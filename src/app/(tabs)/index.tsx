import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StatusChip, VehicleIcon } from '@/components/ui';
import { useApp } from '@/lib/app';
import { monthlyExpense, upcomingReminders, vehicleStatus, type Reminder } from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning,' : h < 18 ? 'Good Afternoon,' : 'Good Evening,';
}

export default function Dashboard() {
  const router = useRouter();
  const { colors, money, profile } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicles, records } = useData();

  const reminders = upcomingReminders(vehicles, records);
  const overdue = reminders.filter((r) => r.health === 'overdue');
  const next: Reminder | undefined = reminders.find((r) => r.health === 'due') ?? reminders[0];
  const month = new Date().toISOString().slice(0, 7);
  const spent = monthlyExpense(records, month);
  const budget = profile.budget || 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} contentFit="contain" />
          <Text style={[type.titleLg, { color: colors.primary }]}>MotoCar PMS</Text>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push('/reminders')}>
          <MaterialIcons name="notifications" size={22} color={colors.onSurfaceVariant} />
          {reminders.length > 0 ? <View style={styles.badge} /> : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 2 }}>
          <Text style={[type.titleMd, { color: colors.onSurfaceVariant }]}>{greeting()}</Text>
          <Text style={[type.headlineSm, { color: colors.onSurface }]}>{profile.name || 'Rider'}</Text>
        </View>

        {next ? (
          <Pressable onPress={() => router.push(`/vehicle/${next.vehicle.id}`)}>
            <View style={styles.hero}>
              <View style={styles.rowBetween}>
                <View style={styles.pillLight}>
                  <Text style={[type.labelSm, { color: colors.onPrimary }]}>Upcoming Service</Text>
                </View>
                {next.daysLeft != null ? (
                  <View style={styles.pillUrgent}>
                    <MaterialIcons name="timer" size={13} color={colors.onError} />
                    <Text style={[type.labelSm, { color: colors.onError }]}>
                      {next.daysLeft < 0 ? `${-next.daysLeft}d overdue` : `${next.daysLeft} days left`}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={{ marginTop: space.md }}>
                <Text style={[type.headlineSm, { color: colors.onPrimary }]}>
                  {next.vehicle.brand} {next.vehicle.model}
                </Text>
                <Text style={[type.bodyMd, { color: colors.onPrimaryContainer }]}>{next.record.type}</Text>
              </View>
              {next.dueDate ? (
                <View style={[styles.row, { marginTop: space.md }]}>
                  <MaterialIcons name="calendar-today" size={18} color={colors.onPrimary} />
                  <Text style={[type.labelLg, { color: colors.onPrimary }]}>
                    {new Date(next.dueDate).toDateString()}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ) : null}

        {overdue.map((r) => (
          <Pressable key={r.vehicle.id} onPress={() => router.push(`/vehicle/${r.vehicle.id}`)}>
            <View style={styles.alert}>
              <View style={styles.alertIcon}>
                <MaterialIcons name="warning" size={22} color={colors.onError} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.titleMd, { color: colors.onErrorContainer }]}>Overdue Alert</Text>
                <Text style={[type.bodyMd, { color: colors.onErrorContainer }]}>
                  {r.vehicle.model} — {r.record.type}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.onErrorContainer} />
            </View>
          </Pressable>
        ))}

        <View style={{ gap: space.sm }}>
          <View style={styles.rowBetween}>
            <Text style={[type.titleMd, { color: colors.onSurface }]}>Your Fleet</Text>
            <Pressable onPress={() => router.push('/vehicles')}>
              <Text style={[type.labelLg, { color: colors.primary }]}>View All</Text>
            </Pressable>
          </View>
          {vehicles.length === 0 ? (
            <Card>
              <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
                No vehicles yet. Add one from the Vehicles tab.
              </Text>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
              {vehicles.map((v) => {
                const h = vehicleStatus(v, records);
                return (
                  <Pressable key={v.id} onPress={() => router.push(`/vehicle/${v.id}`)}>
                    <View style={[styles.fleetCard, { borderLeftColor: colors.status[h].fg }]}>
                      <VehicleIcon type={v.type} tint={colors.status[h].fg} bg={colors.status[h].bg} />
                      <Text style={[type.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
                        {v.model}
                      </Text>
                      <StatusChip health={h} />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.expense}>
          <View style={styles.rowBetween}>
            <Text style={[type.titleMd, { color: colors.onSurface }]}>Monthly Expenses</Text>
            <Text style={[type.headlineSm, { color: colors.primary }]}>{money(spent)}</Text>
          </View>
          <View style={{ gap: space.sm, marginTop: space.md }}>
            <View style={styles.rowBetween}>
              <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>Budget Usage</Text>
              <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>
                {money(spent)} / {money(profile.budget)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, (spent / budget) * 100)}%` }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logo: { width: 32, height: 32 },
    bell: { padding: 8 },
    badge: { position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
    body: { padding: space.md, gap: space.lg, paddingBottom: space.xl },
    hero: { backgroundColor: colors.primaryContainer, borderRadius: radius.lg, padding: space.md, minHeight: 150 },
    pillLight: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    pillUrgent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.error,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      backgroundColor: colors.errorContainer,
      borderRadius: radius.lg,
      padding: space.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    alertIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fleetCard: {
      width: 150,
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.lg,
      padding: space.md,
      gap: space.sm,
      borderLeftWidth: 4,
    },
    expense: { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.lg, padding: space.md },
    track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.outlineVariant, overflow: 'hidden' },
    fill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  });
