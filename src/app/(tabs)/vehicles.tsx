import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Fab, ScreenHeader, StatusChip, VehicleIcon } from '@/components/ui';
import { useApp } from '@/lib/app';
import { vehicleStatus } from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';

export default function Vehicles() {
  const router = useRouter();
  const { colors, formatDistance } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicles, records } = useData();
  const [q, setQ] = useState('');

  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Vehicles" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.search}>
          <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search your fleet"
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
          />
        </View>

        <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>{vehicles.length} registered</Text>

        {filtered.length === 0 ? (
          <EmptyState icon="directions-car" text="No vehicles yet. Tap + to add your first one." />
        ) : (
          filtered.map((v) => {
            const h = vehicleStatus(v, records);
            return (
              <Pressable key={v.id} onPress={() => router.push(`/vehicle/${v.id}`)}>
                <View style={[styles.card, { borderLeftColor: colors.status[h].fg }]}>
                  {v.photoUri ? (
                    <Image source={{ uri: v.photoUri }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <VehicleIcon type={v.type} tint={colors.status[h].fg} bg={colors.status[h].bg} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[type.titleMd, { color: colors.onSurface }]}>
                      {v.brand} {v.model}
                    </Text>
                    <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
                      {v.year} · {v.plate || 'No plate'}
                    </Text>
                    <View style={{ marginTop: 6 }}>
                      <StatusChip health={h} />
                    </View>
                  </View>
                  <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>{formatDistance(v.odometer)}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <Fab onPress={() => router.push('/vehicle/add')} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: 96 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.pill,
      paddingHorizontal: space.md,
      height: 48,
    },
    searchInput: { flex: 1, fontFamily: type.bodyLg.fontFamily, fontSize: 16, color: colors.onSurface },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: radius.lg,
      padding: space.md,
      borderLeftWidth: 4,
    },
    thumb: { width: 44, height: 44, borderRadius: radius.md },
  });
