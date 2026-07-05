import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Fab, ScreenHeader } from '@/components/ui';
import { useApp } from '@/lib/app';
import { SERVICE_ICONS } from '@/lib/constants';
import { monthlyExpense, recordCost } from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';
import type { MaintenanceRecord } from '@/lib/storage';

type Icon = keyof typeof MaterialIcons.glyphMap;

export default function Maintenance() {
  const router = useRouter();
  const { colors, money } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicles, records } = useData();
  const [filter, setFilter] = useState('All');

  const filters = ['All', ...Object.keys(SERVICE_ICONS).filter((t) => records.some((r) => r.type === t))];
  const vehName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : 'Unknown';
  };

  const groups = useMemo(() => {
    const shown = records
      .filter((r) => filter === 'All' || r.type === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, MaintenanceRecord[]>();
    for (const r of shown) {
      const key = r.date.slice(0, 7);
      const bucket = map.get(key) ?? [];
      bucket.push(r);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [records, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Maintenance" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.total}>
          <Text style={[type.labelLg, { color: colors.onPrimaryContainer }]}>Total Spend</Text>
          <Text style={[type.headlineSm, { color: colors.onPrimary }]}>{money(monthlyExpense(records))}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {filters.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
              <Text style={[type.labelLg, { color: filter === f ? colors.onPrimary : colors.onSurfaceVariant }]}>
                {f === 'All' ? 'All Records' : f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {groups.length === 0 ? (
          <EmptyState icon="build" text="No maintenance logged yet. Tap + to add a record." />
        ) : (
          groups.map(([month, recs]) => (
            <View key={month} style={{ gap: space.sm }}>
              <Text style={[type.titleMd, { color: colors.onSurfaceVariant }]}>
                {new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Text>
              {recs.map((r) => (
                <View key={r.id} style={styles.item}>
                  <View style={styles.itemIcon}>
                    <MaterialIcons name={(SERVICE_ICONS[r.type] as Icon) ?? 'build'} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.titleMd, { color: colors.onSurface }]}>{r.type}</Text>
                    <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
                      {vehName(r.vehicleId)} · {new Date(r.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[type.titleMd, { color: colors.onSurface }]}>{money(recordCost(r))}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      <Fab onPress={() => router.push('/maintenance/add')} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: 96 },
    total: { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, padding: space.md, gap: 2 },
    chip: { paddingHorizontal: space.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceContainer },
    chipActive: { backgroundColor: colors.primary },
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
