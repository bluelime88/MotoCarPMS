import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateField, Field, PrimaryButton, ScreenHeader, Select } from '@/components/ui';
import { useApp } from '@/lib/app';
import { MAINTENANCE_TYPES } from '@/lib/constants';
import { cancel, scheduleDue } from '@/lib/notify';
import {
  getProfile,
  getVehicles,
  newId,
  saveRecord,
  saveVehicle,
  type MaintenanceRecord,
  type Vehicle,
} from '@/lib/storage';
import { radius, space, type, type Palette } from '@/lib/theme';

export default function AddRecord() {
  const router = useRouter();
  const { colors, profile, unit, displayToKm } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [r, setR] = useState<MaintenanceRecord>({
    id: newId(),
    vehicleId: vehicleId ?? '',
    date: new Date().toISOString().slice(0, 10),
    odometer: 0,
    type: MAINTENANCE_TYPES[0],
    description: '',
    workshop: '',
    partsCost: 0,
    laborCost: 0,
    createdAt: Date.now(),
  });
  const [odo, setOdo] = useState('');
  const [parts, setParts] = useState('');
  const [labor, setLabor] = useState('');
  const [dueKm, setDueKm] = useState('');

  useEffect(() => {
    getVehicles().then((list) => {
      setVehicles(list);
      if (!vehicleId && list.length) setR((p) => ({ ...p, vehicleId: list[0].id }));
    });
  }, [vehicleId]);

  const set = (patch: Partial<MaintenanceRecord>) => setR((prev) => ({ ...prev, ...patch }));
  const vehicleLabel = (v: Vehicle) => `${v.brand} ${v.model}`;
  const selected = vehicles.find((v) => v.id === r.vehicleId);

  const submit = async () => {
    if (!r.vehicleId) {
      Alert.alert('No vehicle', 'Add a vehicle first, then log its service.');
      return;
    }
    const record: MaintenanceRecord = {
      ...r,
      odometer: displayToKm(Number(odo) || 0),
      partsCost: Number(parts) || 0,
      laborCost: Number(labor) || 0,
      nextDueMileage: dueKm ? displayToKm(Number(dueKm)) : undefined,
      nextDueDate: r.nextDueDate || undefined,
    };

    if (selected && record.odometer > selected.odometer) {
      await saveVehicle({ ...selected, odometer: record.odometer });
    }

    const prof = await getProfile();
    await cancel(record.notificationId);
    if (prof.notificationsEnabled && selected && record.nextDueDate) {
      record.notificationId = await scheduleDue(selected, record);
    }

    await saveRecord(record);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Add Service Record" back />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <DateField label="Service Date" value={r.date} onChange={(d) => set({ date: d })} />
        </View>

        <Select
          label="Vehicle"
          value={selected ? vehicleLabel(selected) : ''}
          options={vehicles.map(vehicleLabel)}
          onSelect={(name) => {
            const v = vehicles.find((x) => vehicleLabel(x) === name);
            if (v) set({ vehicleId: v.id });
          }}
        />

        <Field label={`Odometer (${unit})`} value={odo} onChangeText={setOdo} keyboardType="numeric" placeholder="0" />

        <Select label="Maintenance Type" value={r.type} options={MAINTENANCE_TYPES} onSelect={(t) => set({ type: t })} />

        <Field label="Description (optional)" value={r.description} onChangeText={(t) => set({ description: t })} multiline />

        <Field label="Service Center (optional)" value={r.workshop} onChangeText={(t) => set({ workshop: t })} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label={`Parts Cost (${profile.currency})`} value={parts} onChangeText={setParts} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={`Labor Cost (${profile.currency})`} value={labor} onChangeText={setLabor} keyboardType="numeric" placeholder="0" />
          </View>
        </View>

        <View style={styles.nextCard}>
          <Text style={[type.titleMd, { color: colors.onSurface }]}>Next Service Due (optional)</Text>
          <View style={styles.row}>
            <DateField label="Due Date" value={r.nextDueDate ?? ''} onChange={(d) => set({ nextDueDate: d })} />
            <View style={{ flex: 1 }}>
              <Field label={`Due Mileage (${unit})`} value={dueKm} onChangeText={setDueKm} keyboardType="numeric" placeholder={unit} />
            </View>
          </View>
        </View>

        <PrimaryButton label="Save Record" icon="check" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    row: { flexDirection: 'row', gap: space.md },
    nextCard: { backgroundColor: colors.surfaceContainer, borderRadius: radius.lg, padding: space.md, gap: space.md },
  });
