// Demo storage. Everything lives in this browser (localStorage) and never leaves it.
// To connect a real back end, replace the bodies of load/addSignup/removeSignup/addShift/reset
// with calls to an API or a database and keep the same function names and types.
import type { Shift } from '../data/shifts';

export type Signup = { id: string; shiftId: string; name: string; email: string; phone: string; at: string };
export type State = { signups: Signup[]; extraShifts: Shift[] };

const KEY = 'maple-hollow-demo-v1';
const listeners = new Set<(s: State) => void>();
let memory: State | null = null;

const seed = (): State => ({
  extraShifts: [],
  signups: [
    ['s1', 'Alex Rivera', 'alex@example.com'], ['s1', 'Jordan Lee', 'jordan@example.com'], ['s1', 'Sam Patel', 'sam@example.com'],
    ['s2', 'Casey Morgan', 'casey@example.com'], ['s3', 'Riley Chen', 'riley@example.com'], ['s3', 'Taylor Brooks', 'taylor@example.com'],
    ['s3', 'Drew Nakamura', 'drew@example.com'], ['s3', 'Quinn Alvarez', 'quinn@example.com'], ['s3', 'Avery Singh', 'avery@example.com'],
    ['s4', 'Morgan Ellis', 'morgan@example.com'], ['s6', 'Jamie Fox', 'jamie@example.com'],
    ['s10', 'Robin Okoye', 'robin@example.com'], ['s10', 'Skyler Hart', 'skyler@example.com'],
  ].map(([shiftId, name, email], i) => ({ id: `seed${i}`, shiftId, name, email, phone: '', at: '2026-10-20T12:00:00Z' })),
});

export function load(): State {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { memory = JSON.parse(raw) as State; return memory; }
  } catch { /* storage blocked or corrupt: fall back to seed data */ }
  memory = seed();
  return memory;
}

function save(next: State) {
  memory = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* keep in memory only */ }
  listeners.forEach((fn) => fn(next));
}

export function subscribe(fn: (s: State) => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { memory = null; fn(load()); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

export function addSignup(s: Omit<Signup, 'id' | 'at'>) {
  const cur = load();
  save({ ...cur, signups: [...cur.signups, { ...s, id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()), at: new Date().toISOString() }] });
}
export function removeSignup(id: string) { const cur = load(); save({ ...cur, signups: cur.signups.filter((x) => x.id !== id) }); }
export function addShift(s: Omit<Shift, 'id'>) { const cur = load(); save({ ...cur, extraShifts: [...cur.extraShifts, { ...s, id: `x${Date.now()}` }] }); }
export function reset() { save(seed()); }

// Spreadsheet programs run text that starts with = + - or @ as a formula, so defuse it.
const cell = (v: string) => { const t = /^[=+\-@]/.test(v) ? `'${v}` : v; return `"${t.replaceAll('"', '""')}"`; };
export function toCsv(rows: string[][]) { return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'; }
