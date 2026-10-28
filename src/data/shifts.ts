export type Shift = { id: string; role: string; date: string; time: string; capacity: number; note: string };

export const roles = ['Dog walking', 'Cat socializing', 'Adoption event', 'Cleaning and laundry', 'Transport driver'];

export const baseShifts: Shift[] = [
  { id: 's1', role: 'Dog walking', date: '2026-10-31', time: '9:00 to 11:00 a.m.', capacity: 6, note: 'Meet at the front desk. Closed-toe shoes please.' },
  { id: 's2', role: 'Cat socializing', date: '2026-10-31', time: '1:00 to 3:00 p.m.', capacity: 4, note: 'Quiet play and brushing in the cat room.' },
  { id: 's3', role: 'Adoption event', date: '2026-11-01', time: '11:00 a.m. to 3:00 p.m.', capacity: 8, note: 'Greet visitors at the pet store event table.' },
  { id: 's4', role: 'Cleaning and laundry', date: '2026-11-02', time: '4:00 to 6:00 p.m.', capacity: 3, note: 'Wash bedding and clean kennels.' },
  { id: 's5', role: 'Dog walking', date: '2026-11-03', time: '4:00 to 6:00 p.m.', capacity: 5, note: 'After-school walks. Teens 16 and up with a signed form.' },
  { id: 's6', role: 'Transport driver', date: '2026-11-05', time: '8:00 a.m. to 12:00 p.m.', capacity: 2, note: 'Drive animals to and from the vet. Valid licence needed.' },
  { id: 's7', role: 'Cat socializing', date: '2026-11-07', time: '10:00 a.m. to 12:00 p.m.', capacity: 4, note: 'Quiet play and brushing in the cat room.' },
  { id: 's8', role: 'Dog walking', date: '2026-11-07', time: '1:00 to 3:00 p.m.', capacity: 6, note: 'Meet at the front desk. Closed-toe shoes please.' },
  { id: 's9', role: 'Cleaning and laundry', date: '2026-11-09', time: '4:00 to 6:00 p.m.', capacity: 3, note: 'Wash bedding and clean kennels.' },
  { id: 's10', role: 'Adoption event', date: '2026-11-14', time: '10:00 a.m. to 2:00 p.m.', capacity: 8, note: 'Fall adoption day at the shelter. Help with greeting and paperwork.' },
  { id: 's11', role: 'Dog walking', date: '2026-11-14', time: '3:00 to 5:00 p.m.', capacity: 6, note: 'Meet at the front desk. Closed-toe shoes please.' },
];

export const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
