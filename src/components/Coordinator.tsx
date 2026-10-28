import { useEffect, useState } from 'preact/hooks';
import { baseShifts, roles, fmtDate, type Shift } from '../data/shifts';
import { load, subscribe, addShift, reset, toCsv, type State } from '../lib/store';

const empty: State = { signups: [], extraShifts: [] };

export default function Coordinator() {
  const [state, setState] = useState<State>(empty);
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { setState(load()); return subscribe(setState); }, []);

  const shifts: Shift[] = [...baseShifts, ...state.extraShifts].sort((a, b) => a.date.localeCompare(b.date));
  const filled = (s: Shift) => state.signups.filter((x) => x.shiftId === s.id);
  const totalSpots = shifts.reduce((n, s) => n + s.capacity, 0);
  const totalFilled = shifts.reduce((n, s) => n + Math.min(s.capacity, filled(s).length), 0);
  const needs = shifts.filter((s) => filled(s).length / s.capacity < 0.5).sort((a, b) => filled(a).length / a.capacity - filled(b).length / b.capacity);

  function exportCsv() {
    const rows = [['Shift', 'Date', 'Time', 'Name', 'Email', 'Phone']];
    for (const s of shifts) for (const x of filled(s)) rows.push([s.role, s.date, s.time, x.name, x.email, x.phone]);
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'volunteer-signups.csv'; a.click();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${rows.length - 1} sign-ups to volunteer-signups.csv.`);
  }

  function onAdd(e: Event) {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    const role = String(f.get('role')), date = String(f.get('date')), time = String(f.get('time')).trim(), capacity = Number(f.get('capacity'));
    if (!date) { setErr('Choose a date.'); document.getElementById('a-date')?.focus(); return; }
    if (!time) { setErr('Enter the time, for example 9:00 to 11:00 a.m.'); document.getElementById('a-time')?.focus(); return; }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) { setErr('Enter a number of volunteers from 1 to 50.'); document.getElementById('a-cap')?.focus(); return; }
    addShift({ role, date, time, capacity, note: 'Added by the coordinator.' });
    setErr(''); (e.target as HTMLFormElement).reset();
    setMessage(`Added ${role} on ${fmtDate(date)}.`);
  }

  return (
    <div>
      <p class="demo-note"><strong>Demo:</strong> this view shows what you and other visitors signed up for in this browser. A real site would put this behind a staff login.</p>
      <p id="cstatus" role="status" aria-live="polite" class="status">{message}</p>

      <h2>Coverage</h2>
      <p><strong>{totalFilled}</strong> of <strong>{totalSpots}</strong> volunteer spots filled across {shifts.length} shifts ({Math.round((totalFilled / totalSpots) * 100)}%).</p>
      <h3>Shifts that need help</h3>
      {needs.length ? (
        <ul>{needs.map((s) => <li>{s.role}, {fmtDate(s.date)}, {s.time}: {filled(s).length} of {s.capacity} filled</li>)}</ul>
      ) : <p>Every shift is at least half filled.</p>}

      <h2>All shifts</h2>
      <table class="stack">
        <caption>Sign-ups by shift</caption>
        <thead><tr><th scope="col">Shift</th><th scope="col">Filled</th><th scope="col">Volunteers</th></tr></thead>
        <tbody>{shifts.map((s) => {
          const v = filled(s);
          return (
            <tr>
              <th scope="row">{s.role}<br /><span class="meta">{fmtDate(s.date)}, {s.time}</span></th>
              <td data-label="Filled"><progress max={s.capacity} value={Math.min(v.length, s.capacity)} aria-label={`${s.role} ${fmtDate(s.date)}`} /> {v.length} of {s.capacity}</td>
              <td data-label="Volunteers">{v.length ? v.map((x) => x.name).join(', ') : 'No one yet'}</td>
            </tr>
          );
        })}</tbody>
      </table>

      <div class="actions">
        <button class="btn" type="button" onClick={exportCsv}>Export sign-ups as CSV</button>
        {!confirming
          ? <button class="btn alt" type="button" onClick={() => setConfirming(true)}>Reset demo data</button>
          : <>
              <button class="btn danger" type="button" onClick={() => { reset(); setConfirming(false); setMessage('Demo data reset.'); }}>Yes, erase my sign-ups and shifts</button>
              <button class="btn alt" type="button" onClick={() => setConfirming(false)}>Keep my data</button>
            </>}
      </div>

      <h2>Add a shift</h2>
      <form id="add" noValidate onSubmit={onAdd}>
        {err && <p class="error" role="alert">{err}</p>}
        <div><label for="a-role">Type of shift</label>
          <select id="a-role" name="role">{roles.map((r) => <option>{r}</option>)}</select></div>
        <div><label for="a-date">Date</label><input id="a-date" name="date" type="date" /></div>
        <div><label for="a-time">Time</label><input id="a-time" name="time" type="text" placeholder="9:00 to 11:00 a.m." /></div>
        <div><label for="a-cap">Volunteers needed</label><input id="a-cap" name="capacity" type="number" min="1" max="50" value="4" /></div>
        <div><button class="btn" type="submit">Add shift</button></div>
      </form>
    </div>
  );
}
