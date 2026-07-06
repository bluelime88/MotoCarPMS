// Local-only persistence. Data is small (a handful of vehicles/records), so we
// load-all / save-all JSON arrays. ponytail: move to expo-sqlite only if a fleet
// ever grows past thousands of records.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VehicleType = 'car' | 'moto';

export type Vehicle = {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  variant: string;
  year: string;
  plate: string;
  color: string;
  odometer: number;
  fuelType: string;
  transmission: string;
  note: string;
  photoUri?: string;
  createdAt: number;
};

export type MaintenanceRecord = {
  id: string;
  vehicleId: string;
  date: string; // ISO yyyy-mm-dd
  odometer: number;
  type: string;
  description: string;
  workshop: string;
  partsCost: number;
  laborCost: number;
  nextDueDate?: string; // ISO yyyy-mm-dd
  nextDueMileage?: number;
  notificationId?: string; // scheduled local notification, if any
  receiptUri?: string; // local uri of receipt photo
  servicePhotoUri?: string; // local uri of service/work photo
  createdAt: number;
};

export type Profile = {
  name: string;
  email: string;
  notificationsEnabled: boolean;
  photoUri?: string;
  currency: string; // symbol, e.g. '₱'
  distanceUnit: 'km' | 'mi';
  theme: 'light' | 'dark';
};

const K = { vehicles: 'vehicles', records: 'records', profile: 'profile' } as const;

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

async function readList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

// --- Vehicles ---
export const getVehicles = () => readList<Vehicle>(K.vehicles);

export async function saveVehicle(v: Vehicle): Promise<void> {
  const list = await getVehicles();
  const i = list.findIndex((x) => x.id === v.id);
  if (i >= 0) list[i] = v;
  else list.push(v);
  await AsyncStorage.setItem(K.vehicles, JSON.stringify(list));
}

export async function deleteVehicle(id: string): Promise<void> {
  const [vehicles, records] = await Promise.all([getVehicles(), getRecords()]);
  await AsyncStorage.setItem(
    K.vehicles,
    JSON.stringify(vehicles.filter((v) => v.id !== id))
  );
  await AsyncStorage.setItem(
    K.records,
    JSON.stringify(records.filter((r) => r.vehicleId !== id))
  );
}

// --- Records ---
export const getRecords = () => readList<MaintenanceRecord>(K.records);

export async function saveRecord(r: MaintenanceRecord): Promise<void> {
  const list = await getRecords();
  const i = list.findIndex((x) => x.id === r.id);
  if (i >= 0) list[i] = r;
  else list.push(r);
  await AsyncStorage.setItem(K.records, JSON.stringify(list));
}

// --- Profile ---
const DEFAULT_PROFILE: Profile = {
  name: 'Rider',
  email: '',
  notificationsEnabled: false,
  currency: '₱',
  distanceUnit: 'km',
  theme: 'light',
};

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(K.profile);
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
}

export async function saveProfile(p: Profile): Promise<void> {
  await AsyncStorage.setItem(K.profile, JSON.stringify(p));
}

// Wipe vehicles + records (keeps profile/settings).
export async function clearData(): Promise<void> {
  await AsyncStorage.multiRemove([K.vehicles, K.records]);
}
