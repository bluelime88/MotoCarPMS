import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { useApp } from '@/lib/app';
import { scheduledServices, type Reminder } from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';

// Urgency 0..1 for the progress bar (overdue = full).
function urgency(r: Reminder): number {
  if (r.health === 'overdue') return 1;
  if (r.daysLeft != null) return Math.max(0, Math.min(1, 1 - r.daysLeft / 14));
  if (r.kmLeft != null) return Math.max(0, Math.min(1, 1 - r.kmLeft / 500));
  return 0.5;
}

export default function Reminders() {
  const { colors, unit, kmToDisplay } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicles, records } = useData();
  const reminders = scheduledServices(vehicles, records);

  const subtitle = (r: Reminder): string => {
    if (r.health === 'overdue') {
      if (r.daysLeft != null && r.daysLeft < 0) return `${-r.daysLeft} days overdue`;
      if (r.kmLeft != null && r.kmLeft <= 0) return `${kmToDisplay(-r.kmLeft)} ${unit} over`;
      return 'Overdue';
    }
    if (r.daysLeft != null) return `Due in ${r.daysLeft} days`;
    if (r.kmLeft != null) return `Due in ${kmToDisplay(r.kmLeft)} ${unit}`;
    return 'Upcoming';
  };

  // Absolute target ("Jun 1, 2026 · 55,000 km") so the list reads as a real schedule.
  const dueTarget = (r: Reminder): string => {
    const parts: string[] = [];
    if (r.dueDate) parts.push(new Date(r.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
    if (r.dueMileage != null) parts.push(`${kmToDisplay(r.dueMileage).toLocaleString()} ${unit}`);
    return parts.join(' · ');
  };

  const hasDueOn = (d: Date) =>
    reminders.some((r) => r.dueDate && new Date(r.dueDate).toDateString() === d.toDateString());

  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Reminders" back />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[type.titleMd, { color: colors.onSurface }]}>
          {today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.week}>
          {week.map((d) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <View key={d.toISOString()} style={[styles.day, isToday && styles.dayActive]}>
                <Text style={[type.labelSm, { color: isToday ? colors.onPrimary : colors.onSurfaceVariant }]}>
                  {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                </Text>
                <Text style={[type.titleMd, { color: isToday ? colors.onPrimary : colors.onSurface }]}>
                  {d.getDate()}
                </Text>
                <View
                  style={[
                    styles.dueDot,
                    { backgroundColor: isToday ? colors.onPrimary : colors.primary, opacity: hasDueOn(d) ? 1 : 0 },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {reminders.length === 0 ? (
          <EmptyState icon="event-available" text="No services scheduled yet. Set a next service due when logging maintenance." />
        ) : (
          reminders.map((r) => {
            const s = colors.status[r.health];
            return (
              <View key={r.vehicle.id} style={[styles.card, { borderLeftColor: s.fg }]}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.titleMd, { color: colors.onSurface }]}>{r.record.type}</Text>
                    <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
                      {r.vehicle.brand} {r.vehicle.model}
                    </Text>
                    {dueTarget(r) ? (
                      <View style={styles.dueRow}>
                        <MaterialIcons name="event" size={13} color={colors.onSurfaceVariant} />
                        <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>{dueTarget(r)}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <MaterialIcons name={r.health === 'overdue' ? 'warning' : 'schedule'} size={14} color={s.fg} />
                    <Text style={[type.labelSm, { color: s.fg }]}>{subtitle(r)}</Text>
                  </View>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${urgency(r) * 100}%`, backgroundColor: s.fg }]} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    week: { flexDirection: 'row', justifyContent: 'space-between' },
    day: {
      width: 42,
      paddingVertical: space.sm,
      borderRadius: radius.pill,
      alignItems: 'center',
      gap: 2,
      backgroundColor: colors.surfaceContainer,
    },
    dayActive: { backgroundColor: colors.primary },
    dueDot: { width: 5, height: 5, borderRadius: 2.5 },
    dueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: radius.lg,
      padding: space.md,
      gap: space.md,
      borderLeftWidth: 4,
    },
    rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.sm },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.outlineVariant, overflow: 'hidden' },
    fill: { height: 8, borderRadius: radius.pill },
  });
