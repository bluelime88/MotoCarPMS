import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, PrimaryButton, ScreenHeader, Select } from '@/components/ui';
import { useApp } from '@/lib/app';
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_COLORS, YEARS } from '@/lib/constants';
import { pickImage } from '@/lib/photo';
import { getVehicles, newId, saveVehicle, type Vehicle, type VehicleType } from '@/lib/storage';
import { radius, space, type, type Palette } from '@/lib/theme';
import { plate } from '@/lib/validate';

const blank = (): Vehicle => ({
  id: newId(),
  type: 'car',
  brand: '',
  model: '',
  variant: '',
  year: String(new Date().getFullYear()),
  plate: '',
  color: VEHICLE_COLORS[0],
  odometer: 0,
  fuelType: FUEL_TYPES[0],
  transmission: TRANSMISSIONS[0],
  note: '',
  createdAt: Date.now(),
});

export default function AddVehicle() {
  const router = useRouter();
  const { colors, unit, kmToDisplay, displayToKm } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [v, setV] = useState<Vehicle>(blank);
  const [odo, setOdo] = useState('');

  useEffect(() => {
    if (!id) return;
    getVehicles().then((list) => {
      const found = list.find((x) => x.id === id);
      if (found) {
        setV(found);
        setOdo(String(kmToDisplay(found.odometer)));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (patch: Partial<Vehicle>) => setV((prev) => ({ ...prev, ...patch }));

  const addPhoto = async () => {
    const uri = await pickImage();
    if (uri) set({ photoUri: uri });
  };

  const submit = async () => {
    const missing: string[] = [];
    if (!v.brand.trim()) missing.push('Brand');
    if (!v.model.trim()) missing.push('Model');
    if (missing.length) {
      Alert.alert('Missing required fields', `Please fill in: ${missing.join(', ')}.`);
      return;
    }
    await saveVehicle({ ...v, odometer: displayToKm(Number(odo) || 0) });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={id ? 'Edit Vehicle' : 'Add Vehicle'} back />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Photo */}
        <Pressable style={styles.photoZone} onPress={addPhoto}>
          {v.photoUri ? (
            <Image source={{ uri: v.photoUri }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoEmpty}>
              <MaterialIcons name="add-a-photo" size={28} color={colors.onSurfaceVariant} />
              <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>Add photo</Text>
            </View>
          )}
          {v.photoUri ? (
            <View style={styles.photoEdit}>
              <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
            </View>
          ) : null}
        </Pressable>

        {/* Type toggle */}
        <View style={styles.toggle}>
          {(['car', 'moto'] as VehicleType[]).map((t) => (
            <Pressable key={t} onPress={() => set({ type: t })} style={[styles.toggleBtn, v.type === t && styles.toggleActive]}>
              <MaterialIcons
                name={t === 'car' ? 'directions-car' : 'two-wheeler'}
                size={20}
                color={v.type === t ? colors.onPrimary : colors.onSurfaceVariant}
              />
              <Text style={[type.labelLg, { color: v.type === t ? colors.onPrimary : colors.onSurfaceVariant }]}>
                {t === 'car' ? 'Car' : 'Motorcycle'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field label="Brand" value={v.brand} onChangeText={(t) => set({ brand: t })} placeholder="Toyota" />
        <Field label="Model" value={v.model} onChangeText={(t) => set({ model: t })} placeholder="RAV4" />
        <Field label="Variant (optional)" value={v.variant} onChangeText={(t) => set({ variant: t })} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Select label="Year" value={v.year} options={YEARS} onSelect={(y) => set({ year: y })} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Plate No." value={v.plate} onChangeText={(t) => set({ plate: plate(t) })} autoCapitalize="characters" />
          </View>
        </View>

        <Field
          label={`Current Odometer (${unit})`}
          value={odo}
          onChangeText={setOdo}
          keyboardType="numeric"
          placeholder="0"
        />

        <View style={{ gap: space.xs }}>
          <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>Color</Text>
          <View style={styles.colors}>
            {VEHICLE_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => set({ color: c })}
                style={[styles.swatch, { backgroundColor: c }, v.color === c && { borderWidth: 3, borderColor: colors.primary }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Select label="Fuel" value={v.fuelType} options={FUEL_TYPES} onSelect={(f) => set({ fuelType: f })} />
          </View>
          <View style={{ flex: 1 }}>
            <Select label="Transmission" value={v.transmission} options={TRANSMISSIONS} onSelect={(t) => set({ transmission: t })} />
          </View>
        </View>

        <Field label="Owner's Note (optional)" value={v.note} onChangeText={(t) => set({ note: t })} multiline />

        <PrimaryButton label="Save Vehicle" icon="check" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    row: { flexDirection: 'row', gap: space.md },
    photoZone: { height: 160, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainer },
    photo: { width: '100%', height: '100%' },
    photoEmpty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.outlineVariant,
      borderRadius: radius.lg,
    },
    photoEdit: {
      position: 'absolute',
      right: space.sm,
      bottom: space.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggle: { flexDirection: 'row', gap: space.sm, backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, padding: 4 },
    toggleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      paddingVertical: 10,
      borderRadius: radius.pill,
    },
    toggleActive: { backgroundColor: colors.primary },
    colors: { flexDirection: 'row', gap: space.sm },
    swatch: { width: 40, height: 40, borderRadius: 20 },
  });
