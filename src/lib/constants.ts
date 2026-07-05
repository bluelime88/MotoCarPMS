// Picker option lists (from the prototype forms).
export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
export const MAINTENANCE_TYPES = [
  'Oil & Filter Change',
  'Brake Service',
  'Tire Rotation',
  'Tire Replacement',
  'Battery',
  'Engine Diagnostic',
  'General Maintenance',
];

// Icon per maintenance type for timeline/history rows.
export const SERVICE_ICONS: Record<string, string> = {
  'Oil & Filter Change': 'oil-barrel',
  'Brake Service': 'disc-full',
  'Tire Rotation': 'tire-repair',
  'Tire Replacement': 'tire-repair',
  Battery: 'battery-charging-full',
  'Engine Diagnostic': 'settings',
  'General Maintenance': 'build',
};

const now = new Date().getFullYear();
export const YEARS = Array.from({ length: 40 }, (_, i) => String(now - i));

export const VEHICLE_COLORS = ['#1e293b', '#dc2626', '#2563eb', '#16a34a', '#e2e8f0'];
