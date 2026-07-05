// Global settings context: active palette (light/dark), currency + distance-unit
// formatting, budget, and a persisted profile setter. Wrap the app in <AppProvider>.
import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, saveProfile, type Profile } from './storage';
import { darkColors, lightColors, type Palette } from './theme';

const KM_PER_MI = 1.609344;

type AppValue = {
  profile: Profile;
  ready: boolean;
  colors: Palette;
  dark: boolean;
  setProfile: (patch: Partial<Profile>) => Promise<void>;
  money: (n: number) => string;
  // odometer values are stored canonically in km; convert for display/input.
  kmToDisplay: (km: number) => number;
  displayToKm: (v: number) => number;
  unit: 'km' | 'mi';
  formatDistance: (km: number) => string;
};

const DEFAULTS: Profile = {
  name: 'Rider',
  email: '',
  notificationsEnabled: false,
  currency: '₱',
  distanceUnit: 'km',
  budget: 5000,
  theme: 'light',
};

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setP] = useState<Profile>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      setP(p);
      setReady(true);
    });
  }, []);

  const setProfile = async (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setP(next);
    await saveProfile(next);
  };

  const dark = profile.theme === 'dark';
  const colors = dark ? darkColors : lightColors;
  const unit = profile.distanceUnit;

  const money = (n: number) =>
    profile.currency + n.toLocaleString(undefined, { minimumFractionDigits: 0 });
  const kmToDisplay = (km: number) => (unit === 'mi' ? Math.round(km / KM_PER_MI) : km);
  const displayToKm = (v: number) => (unit === 'mi' ? Math.round(v * KM_PER_MI) : v);
  const formatDistance = (km: number) => `${kmToDisplay(km).toLocaleString()} ${unit}`;

  return (
    <AppContext.Provider
      value={{ profile, ready, colors, dark, setProfile, money, kmToDisplay, displayToKm, unit, formatDistance }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
