// Derived logic: vehicle health, reminders, expense totals. Pure functions
// (accept `now`) so they can be checked without a device — see demo() below.
import type { MaintenanceRecord, Vehicle } from './storage';

export type Health = 'good' | 'due' | 'overdue';

const DAY = 86_400_000;
const DUE_DAYS = 14;
const DUE_KM = 500;

export type Reminder = {
  vehicle: Vehicle;
  record: MaintenanceRecord;
  health: Health;
  dueDate?: string;
  dueMileage?: number;
  daysLeft?: number;
  kmLeft?: number;
};

// Most recent record (by date) carrying a next-service target.
function latestDue(records: MaintenanceRecord[]): MaintenanceRecord | undefined {
  return records
    .filter((r) => r.nextDueDate || r.nextDueMileage != null)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function vehicleStatus(
  vehicle: Vehicle,
  records: MaintenanceRecord[],
  now: number = Date.now()
): Health {
  const due = latestDue(records.filter((r) => r.vehicleId === vehicle.id));
  if (!due) return 'good';

  let overdue = false;
  let soon = false;

  if (due.nextDueDate) {
    const daysLeft = Math.floor((Date.parse(due.nextDueDate) - now) / DAY);
    if (daysLeft < 0) overdue = true;
    else if (daysLeft <= DUE_DAYS) soon = true;
  }
  if (due.nextDueMileage != null) {
    const kmLeft = due.nextDueMileage - vehicle.odometer;
    if (kmLeft <= 0) overdue = true;
    else if (kmLeft <= DUE_KM) soon = true;
  }

  return overdue ? 'overdue' : soon ? 'due' : 'good';
}

// Overdue + due-soon services across the fleet, most urgent first.
export function upcomingReminders(
  vehicles: Vehicle[],
  records: MaintenanceRecord[],
  now: number = Date.now()
): Reminder[] {
  const out: Reminder[] = [];
  for (const vehicle of vehicles) {
    const due = latestDue(records.filter((r) => r.vehicleId === vehicle.id));
    if (!due) continue;
    const health = vehicleStatus(vehicle, records, now);
    if (health === 'good') continue;
    out.push({
      vehicle,
      record: due,
      health,
      dueDate: due.nextDueDate,
      dueMileage: due.nextDueMileage,
      daysLeft: due.nextDueDate
        ? Math.floor((Date.parse(due.nextDueDate) - now) / DAY)
        : undefined,
      kmLeft: due.nextDueMileage != null ? due.nextDueMileage - vehicle.odometer : undefined,
    });
  }
  const rank = { overdue: 0, due: 1, good: 2 };
  return out.sort(
    (a, b) => rank[a.health] - rank[b.health] || (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9)
  );
}

export const recordCost = (r: MaintenanceRecord) => r.partsCost + r.laborCost;

// Total spend for a given month ('yyyy-mm'), or all-time if omitted.
export function monthlyExpense(records: MaintenanceRecord[], month?: string): number {
  return records
    .filter((r) => !month || r.date.startsWith(month))
    .reduce((sum, r) => sum + recordCost(r), 0);
}

export function costSplit(records: MaintenanceRecord[]): { parts: number; labor: number } {
  return records.reduce(
    (acc, r) => ({ parts: acc.parts + r.partsCost, labor: acc.labor + r.laborCost }),
    { parts: 0, labor: 0 }
  );
}

// ponytail: single runnable check for the non-trivial date/mileage boundaries.
// Run with: npx tsx src/lib/status.ts
export function demo() {
  const assert = (c: boolean, m: string) => {
    if (!c) throw new Error('demo failed: ' + m);
  };
  const now = Date.parse('2026-01-01');
  const car: Vehicle = {
    id: 'v1', type: 'car', brand: 'Toyota', model: 'RAV4', variant: '', year: '2020',
    plate: '', color: '', odometer: 10_000, fuelType: '', transmission: '', note: '',
    createdAt: 0,
  };
  const base = {
    id: 'r', vehicleId: 'v1', date: '2025-12-01', odometer: 9000, type: 'Oil',
    description: '', workshop: '', partsCost: 80, laborCost: 40, createdAt: 0,
  };

  // Overdue by date.
  assert(vehicleStatus(car, [{ ...base, nextDueDate: '2025-12-15' }], now) === 'overdue', 'date overdue');
  // Due soon by date (within 14 days).
  assert(vehicleStatus(car, [{ ...base, nextDueDate: '2026-01-10' }], now) === 'due', 'date due');
  // Good by date (far future).
  assert(vehicleStatus(car, [{ ...base, nextDueDate: '2026-06-01' }], now) === 'good', 'date good');
  // Overdue by mileage (odometer past target).
  assert(vehicleStatus(car, [{ ...base, nextDueMileage: 10_000 }], now) === 'overdue', 'km overdue');
  // Due soon by mileage (within 500 km).
  assert(vehicleStatus(car, [{ ...base, nextDueMileage: 10_400 }], now) === 'due', 'km due');
  // No target → good.
  assert(vehicleStatus(car, [base], now) === 'good', 'no target good');

  // Expense totals.
  const recs: MaintenanceRecord[] = [
    { ...base, id: 'a', date: '2025-12-01', partsCost: 80, laborCost: 40 },
    { ...base, id: 'b', date: '2025-11-15', partsCost: 100, laborCost: 0 },
  ];
  assert(monthlyExpense(recs, '2025-12') === 120, 'month total');
  assert(monthlyExpense(recs) === 220, 'all-time total');
  assert(costSplit(recs).parts === 180, 'parts split');

  // Reminders sorted overdue-first.
  const rem = upcomingReminders(car ? [car] : [], [{ ...base, nextDueDate: '2025-12-15' }], now);
  assert(rem.length === 1 && rem[0].health === 'overdue', 'reminder overdue');

  console.log('status.ts demo: all assertions passed');
}

// Auto-run when executed directly (tsx/node), not when imported by the app.
declare const require: any;
declare const module: any;
if (typeof require !== 'undefined' && require.main === module) demo();
