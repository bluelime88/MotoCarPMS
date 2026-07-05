// Loads vehicles + records and refreshes whenever a screen regains focus
// (so edits on other screens show up). Small dataset → just reload everything.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getRecords, getVehicles, type MaintenanceRecord, type Vehicle } from './storage';

export function useData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const [v, r] = await Promise.all([getVehicles(), getRecords()]);
    setVehicles(v);
    setRecords(r);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { vehicles, records, ready, reload };
}
