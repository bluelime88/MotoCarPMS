// Expense analytics: computed entirely from maintenance records (parts + labor).
// Charts are plain Views scaled to the max value — no chart dependency needed.
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, ScreenHeader } from '@/components/ui';
import { useApp } from '@/lib/app';
import {
  expenseByCategory,
  expenseByMonth,
  expenseByVehicle,
  monthlyExpense,
  recordCost,
} from '@/lib/status';
import { radius, space, type, type Palette } from '@/lib/theme';
import { useData } from '@/lib/useData';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function Expenses() {
  const { colors, money } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicles, records } = useData();
  const catPalette = [colors.primary, colors.secondary, colors.tertiary, colors.error, colors.outline];

  const now = new Date();
  const year = String(now.getFullYear());
  const byMonth = expenseByMonth(records, year);
  const yearTotal = byMonth.reduce((a, b) => a + b, 0);
  const avgMonthly = yearTotal / (now.getMonth() + 1);
  const thisMonth = monthlyExpense(records, now.toISOString().slice(0, 7));

  const categories = expenseByCategory(records);
  const catTotal = categories.reduce((a, c) => a + c.total, 0) || 1;
  const topVehicles = expenseByVehicle(records, vehicles).slice(0, 5);
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const vehName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.model}${v.plate ? ` [${v.plate}]` : ''}` : 'Unknown';
  };

  if (records.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Expense Analytics" />
        <EmptyState icon="bar-chart" text="No expenses yet. Add maintenance records to see analytics here." />
      </SafeAreaView>
    );
  }

  const maxMonth = Math.max(...byMonth, 1);
  const maxVeh = Math.max(...topVehicles.map((v) => v.total), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Expense Analytics" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
          Detailed breakdown of maintenance costs
        </Text>

        {/* Summary stats */}
        <View style={styles.statRow}>
          <Card accent={colors.primary} style={styles.stat}>
            <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>Spent in {year}</Text>
            <Text style={[type.headlineSm, { color: colors.onSurface }]}>{money(yearTotal)}</Text>
          </Card>
        </View>
        <View style={styles.statRow}>
          <Card accent={colors.secondary} style={styles.stat}>
            <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>Avg. Monthly</Text>
            <Text style={[type.headlineSm, { color: colors.onSurface }]}>{money(Math.round(avgMonthly))}</Text>
          </Card>
          <Card accent={colors.tertiary} style={styles.stat}>
            <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>This Month</Text>
            <Text style={[type.headlineSm, { color: colors.onSurface }]}>{money(thisMonth)}</Text>
          </Card>
        </View>

        {/* Monthly trend */}
        <Card>
          <Text style={[type.titleMd, { color: colors.onSurface }]}>Monthly Expense Trend</Text>
          <View style={styles.trend}>
            {byMonth.map((v, i) => (
              <View key={i} style={styles.trendCol}>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendBar,
                      { height: `${(v / maxMonth) * 100}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
                <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>{MONTHS[i]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* By category */}
        <Card>
          <Text style={[type.titleMd, { color: colors.onSurface, marginBottom: space.sm }]}>By Category</Text>
          {categories.map((c, i) => {
            const pct = Math.round((c.total / catTotal) * 100);
            const color = catPalette[i % catPalette.length];
            return (
              <View key={c.label} style={{ marginTop: space.sm }}>
                <View style={styles.rowBetween}>
                  <View style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={[type.bodyMd, { color: colors.onSurface }]}>{c.label}</Text>
                  </View>
                  <Text style={[type.labelLg, { color: colors.onSurface }]}>
                    {money(c.total)} · {pct}%
                  </Text>
                </View>
                <View style={styles.hTrack}>
                  <View style={[styles.hBar, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Top vehicles */}
        <Card>
          <Text style={[type.titleMd, { color: colors.onSurface, marginBottom: space.sm }]}>
            Top Expenses by Vehicle
          </Text>
          {topVehicles.map((v) => (
            <View key={v.vehicle.id} style={{ marginTop: space.sm }}>
              <View style={styles.rowBetween}>
                <Text style={[type.bodyMd, { color: colors.onSurface }]} numberOfLines={1}>
                  {v.vehicle.model}
                </Text>
                <Text style={[type.labelLg, { color: colors.onSurface }]}>{money(v.total)}</Text>
              </View>
              <View style={styles.hTrack}>
                <View
                  style={[styles.hBar, { width: `${(v.total / maxVeh) * 100}%`, backgroundColor: colors.primary }]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Recent logs */}
        <Card>
          <Text style={[type.titleMd, { color: colors.onSurface, marginBottom: space.sm }]}>
            Recent Expense Logs
          </Text>
          {recent.map((r) => (
            <View key={r.id} style={styles.logRow}>
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyMd, { color: colors.onSurface }]} numberOfLines={1}>
                  {vehName(r.vehicleId)}
                </Text>
                <Text style={[type.labelSm, { color: colors.onSurfaceVariant }]}>
                  {r.date} · {r.type || 'Other'}
                </Text>
              </View>
              <Text style={[type.labelLg, { color: colors.onSurface }]}>{money(recordCost(r))}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    statRow: { flexDirection: 'row', gap: space.md },
    stat: { flex: 1, gap: space.xs },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    trend: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4, marginTop: space.md },
    trendCol: { flex: 1, alignItems: 'center', gap: space.xs },
    trendTrack: { width: '100%', height: 140, justifyContent: 'flex-end' },
    trendBar: { width: '70%', alignSelf: 'center', borderRadius: radius.sm, minHeight: 2 },
    hTrack: {
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceContainerHigh,
      overflow: 'hidden',
      marginTop: space.xs,
    },
    hBar: { height: 8, borderRadius: radius.pill },
    logRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.sm,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceContainerHigh,
    },
  });
