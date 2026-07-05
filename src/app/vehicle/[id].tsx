import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Fab, StatusChip } from '@/components/ui';
import { useApp } from '@/lib/app';
import { SERVICE_ICONS } from '@/lib/constants';
import { deleteVehicle } from '@/lib/storage';
import { monthlyExpense, recordCost, vehicleStatus } from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';

type Icon = keyof typeof MaterialIcons.glyphMap;

export default function VehicleDetail() {
  const router = useRouter();
  const { colors, money, formatDistance } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, records } = useData();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState icon="error-outline" text="Vehicle not found." />
      </SafeAreaView>
    );
  }

  const mine = records.filter((r) => r.vehicleId === vehicle.id).sort((a, b) => b.date.localeCompare(a.date));
  const health = vehicleStatus(vehicle, records);
  const totalCost = monthlyExpense(mine);

  const confirmDelete = () =>
    Alert.alert('Delete vehicle', `Remove ${vehicle.brand} ${vehicle.model} and its records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteVehicle(vehicle.id);
          router.back();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={[type.titleLg, { color: colors.onSurface }]} numberOfLines={1}>
          {vehicle.model}
        </Text>
        <View style={styles.row}>
          <Pressable onPress={() => router.push(`/vehicle/add?id=${vehicle.id}`)} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="edit" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="delete-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {vehicle.photoUri ? (
          <Image source={{ uri: vehicle.photoUri }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder, { backgroundColor: vehicle.color }]}>
            <MaterialIcons
              name={vehicle.type === 'car' ? 'directions-car' : 'two-wheeler'}
              size={72}
              color="rgba(255,255,255,0.85)"
            />
          </View>
        )}

        <View style={styles.identity}>
          <View style={{ flex: 1 }}>
            <Text style={[type.headlineSm, { color: colors.onSurface }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
              {vehicle.year} · {vehicle.type === 'car' ? 'Car' : 'Motorcycle'} · {vehicle.plate || 'No plate'}
            </Text>
          </View>
          <StatusChip health={health} />
        </View>

        <View style={styles.grid}>
          <Spec icon="speed" label="Odometer" value={formatDistance(vehicle.odometer)} colors={colors} styles={styles} />
          <Spec icon="payments" label="Total Cost" value={money(totalCost)} colors={colors} styles={styles} />
          <Spec icon="local-gas-station" label="Fuel" value={vehicle.fuelType} colors={colors} styles={styles} />
        </View>

        {vehicle.note ? (
          <View style={styles.noteCard}>
            <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>Note</Text>
            <Text style={[type.bodyMd, { color: colors.onSurface }]}>{vehicle.note}</Text>
          </View>
        ) : null}

        <Text style={[type.titleMd, { color: colors.onSurface }]}>Service History</Text>
        {mine.length === 0 ? (
          <EmptyState icon="build" text="No services logged for this vehicle yet." />
        ) : (
          mine.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={styles.itemIcon}>
                <MaterialIcons name={(SERVICE_ICONS[r.type] as Icon) ?? 'build'} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.titleMd, { color: colors.onSurface }]}>{r.type}</Text>
                {r.description ? (
                  <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {r.description}
                  </Text>
                ) : null}
                <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>
                  {new Date(r.date).toLocaleDateString()} · {formatDistance(r.odometer)}
                </Text>
              </View>
              <Text style={[type.titleMd, { color: colors.onSurface }]}>{money(recordCost(r))}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <Fab onPress={() => router.push(`/maintenance/add?vehicleId=${vehicle.id}`)} />
    </SafeAreaView>
  );
}

function Spec({
  icon,
  label,
  value,
  colors,
  styles,
}: {
  icon: Icon;
  label: string;
  value: string;
  colors: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.spec}>
      <MaterialIcons name={icon} size={20} color={colors.primary} />
      <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[type.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      height: 56,
      paddingHorizontal: space.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { padding: 4 },
    body: { padding: space.md, gap: space.md, paddingBottom: 96 },
    hero: { height: 160, borderRadius: radius.lg },
    heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    identity: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    grid: { flexDirection: 'row', gap: space.sm },
    spec: { flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: radius.lg, padding: space.md, gap: 4 },
    noteCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.lg, padding: space.md, gap: 4 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: radius.lg,
      padding: space.md,
    },
    itemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
