import { useEffect, useMemo, useState } from 'preact/hooks';
import { baseShifts, roles, fmtDate, type Shift } from '../data/shifts';
import { load, subscribe, addSignup, removeSignup, type State } from '../lib/store';

const empty: State = { signups: [], extraShifts: [] };
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ShiftBoard() {
  const [state, setState] = useState<State>(empty);
  const [role, setRole] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [myEmail, setMyEmail] = useState('');

  useEffect(() => { setState(load()); return subscribe(setState); }, []);

  const shifts: Shift[] = useMemo(
    () => [...baseShifts, ...state.extraShifts].sort((a, b) => a.date.localeCompare(b.date)), [state]);
  const left = (s: Shift) => s.capacity - state.signups.filter((x) => x.shiftId === s.id).length;
  const shown = shifts.filter((s) => (!role || s.role === role) && (!openOnly || left(s) > 0));
  const mine = myEmail ? state.signups.filter((x) => x.email.toLowerCase() === myEmail.toLowerCase()) : [];
  const label = (s: Shift) => `${s.role}, ${fmtDate(s.date)}, ${s.time}`;

  function submit(e: Event, s: Shift) {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    const name = String(f.get('name') ?? '').trim(), email = String(f.get('email') ?? '').trim(), phone = String(f.get('phone') ?? '').trim();
    const errs: Record<string, string> = {};
    if (!name) errs.name = 'Enter your name.';
    if (!EMAIL.test(email)) errs.email = 'Enter an email address like name@example.com.';
    else if (state.signups.some((x) => x.shiftId === s.id && x.email.toLowerCase() === email.toLowerCase())) errs.email = 'That email is already signed up for this shift.';
    if (left(s) <= 0) errs.name = 'Sorry, this shift just filled up.';
    setErrors(errs);
    if (Object.keys(errs).length) { setTimeout(() => (document.getElementById(`${Object.keys(errs)[0]}-${s.id}`) as HTMLElement)?.focus(), 0); return; }
    addSignup({ shiftId: s.id, name, email, phone });
    setMyEmail(email); setOpenId(null); setErrors({});
    setMessage(`Thank you, ${name}. You are signed up for ${label(s)}`);
    setTimeout(() => document.getElementById(`h-${s.id}`)?.focus(), 0);
  }

  function cancel(id: string, shiftId: string) {
    const s = shifts.find((x) => x.id === shiftId)!;
    removeSignup(id);
    setMessage(`Your sign-up for ${label(s)} was cancelled.`);
    setTimeout(() => document.getElementById('status')?.focus(), 0);
  }

  return (
    <div>
      <p class="demo-note"><strong>Demo:</strong> sign-ups are stored only in your browser. Nothing is sent to anyone.</p>
      <div class="controls">
        <div>
          <label for="role">Type of shift</label>
          <select id="role" value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value)}>
            <option value="">All types</option>
            {roles.map((r) => <option value={r}>{r}</option>)}
          </select>
        </div>
        <div class="choice">
          <input id="openonly" type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly((e.target as HTMLInputElement).checked)} />
          <label for="openonly">Only show shifts with spots open</label>
        </div>
      </div>
      <p id="status" tabIndex={-1} role="status" aria-live="polite" class="status">
        {message || `${shown.length} ${shown.length === 1 ? 'shift' : 'shifts'} shown.`}
      </p>

      {mine.length > 0 && (
        <section aria-labelledby="mine-h" class="mine">
          <h2 id="mine-h">Your sign-ups</h2>
          <ul class="plain">{mine.map((x) => {
            const s = shifts.find((y) => y.id === x.shiftId)!;
            return <li><span>{label(s)}</span> <button class="linkbtn" type="button" aria-label={`Cancel sign-up for ${label(s)}`} onClick={() => cancel(x.id, x.shiftId)}>Cancel sign-up</button></li>;
          })}</ul>
        </section>
      )}

      <ul class="shifts">
        {shown.map((s) => {
          const n = left(s), isOpen = openId === s.id;
          return (
            <li class="shift">
              <h2 id={`h-${s.id}`} tabIndex={-1}>{s.role}</h2>
              <p class="when"><time dateTime={s.date}>{fmtDate(s.date)}</time> · {s.time}</p>
              <p>{s.note}</p>
              <p class={n > 0 ? 'spots' : 'spots full'}>{n > 0 ? `${n} of ${s.capacity} spots open` : `Full (${s.capacity} of ${s.capacity})`}</p>
              {n > 0 && (
                <button class="btn" type="button" aria-expanded={isOpen} aria-controls={`f-${s.id}`} aria-label={`${isOpen ? 'Close form' : 'Sign up'} for ${label(s)}`}
                  onClick={() => { setOpenId(isOpen ? null : s.id); setErrors({}); }}>
                  {isOpen ? 'Close form' : 'Sign up'}
                </button>
              )}
              {isOpen && (
                <form id={`f-${s.id}`} noValidate onSubmit={(e) => submit(e, s)}>
                  <div>
                    <label for={`name-${s.id}`}>Your name <span class="hint">(required)</span></label>
                    <input id={`name-${s.id}`} name="name" type="text" autoComplete="name" aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? `ne-${s.id}` : undefined} />
                    {errors.name && <p id={`ne-${s.id}`} class="error">{errors.name}</p>}
                  </div>
                  <div>
                    <label for={`email-${s.id}`}>Email <span class="hint">(required)</span></label>
                    <input id={`email-${s.id}`} name="email" type="email" autoComplete="email" aria-invalid={errors.email ? 'true' : undefined} aria-describedby={errors.email ? `ee-${s.id}` : undefined} />
                    {errors.email && <p id={`ee-${s.id}`} class="error">{errors.email}</p>}
                  </div>
                  <div>
                    <label for={`phone-${s.id}`}>Phone <span class="hint">(optional)</span></label>
                    <input id={`phone-${s.id}`} name="phone" type="tel" autoComplete="tel" />
                  </div>
                  <button class="btn" type="submit">Confirm sign-up</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p>No shifts match. Try a different type, or turn off the spots filter.</p>}
    </div>
  );
}
