// Small shared UI primitives. All read the active palette from useApp() so they
// respond to the light/dark setting.
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '@/lib/app';
import { radius, space, type } from '@/lib/theme';
import type { Palette } from '@/lib/theme';
import type { Health } from '@/lib/status';

type Icon = keyof typeof MaterialIcons.glyphMap;

function useStyles() {
  const { colors } = useApp();
  return useMemo(() => makeStyles(colors), [colors]);
}

export function StatusChip({ health }: { health: Health }) {
  const { colors } = useApp();
  const s = colors.status[health];
  return (
    <View style={[chip.chip, { backgroundColor: s.bg }]}>
      <View style={[chip.dot, { backgroundColor: s.fg }]} />
      <Text style={[type.labelSm, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

export function Fab({ onPress, icon = 'add' }: { onPress: () => void; icon?: Icon }) {
  const { colors } = useApp();
  const styles = useStyles();
  return (
    <Pressable style={styles.fab} onPress={onPress} accessibilityRole="button">
      <MaterialIcons name={icon} size={30} color={colors.onPrimary} />
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const { colors } = useApp();
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <View style={styles.rowCenter}>
        {back ? (
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
        ) : null}
        <Text style={[type.titleLg, { color: colors.onSurface }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  accent,
  style,
}: {
  children: React.ReactNode;
  accent?: string;
  style?: object;
}) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.card,
        accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null,
        style,
      ]}>
      {children}
    </View>
  );
}

export function EmptyState({ icon, text }: { icon: Icon; text: string }) {
  const { colors } = useApp();
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <MaterialIcons name={icon} size={48} color={colors.outline} />
      <Text style={[type.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'characters' | 'sentences';
}) {
  const { colors } = useApp();
  const styles = useStyles();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline ? { height: 88, textAlignVertical: 'top' } : null]}
      />
    </View>
  );
}

export function Select({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const { colors } = useApp();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: space.xs }}>
      <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Pressable style={[styles.input, styles.rowBetween]} onPress={() => setOpen(true)}>
        <Text style={[type.bodyLg, { color: value ? colors.onSurface : colors.outline }]}>
          {value || 'Select…'}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={colors.onSurfaceVariant} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={[type.titleMd, { color: colors.onSurface, marginBottom: space.sm }]}>{label}</Text>
            <ScrollView>
              {options.map((o) => (
                <Pressable
                  key={o}
                  style={styles.option}
                  onPress={() => {
                    onSelect(o);
                    setOpen(false);
                  }}>
                  <Text style={[type.bodyLg, { color: colors.onSurface }]}>{o}</Text>
                  {o === value ? <MaterialIcons name="check" size={20} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const { colors } = useApp();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: space.xs, flex: 1 }}>
      <Text style={[type.labelLg, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Pressable style={[styles.input, styles.rowBetween]} onPress={() => setOpen(true)}>
        <Text style={[type.bodyLg, { color: value ? colors.onSurface : colors.outline }]}>
          {value || 'Select date'}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          onChange={(e, d) => {
            setOpen(false);
            if (e.type === 'set' && d) onChange(d.toISOString().slice(0, 10));
          }}
        />
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: Icon;
}) {
  const { colors } = useApp();
  const styles = useStyles();
  return (
    <Pressable style={styles.primaryBtn} onPress={onPress}>
      {icon ? <MaterialIcons name={icon} size={20} color={colors.onPrimary} /> : null}
      <Text style={[type.labelLg, { color: colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function VehicleIcon({ type: t, tint, bg }: { type: 'car' | 'moto'; tint: string; bg: string }) {
  return (
    <View style={[chip.vehIcon, { backgroundColor: bg }]}>
      <MaterialIcons name={t === 'car' ? 'directions-car' : 'two-wheeler'} size={22} color={tint} />
    </View>
  );
}

// Palette-independent bits.
const chip = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  vehIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      height: 56,
      paddingHorizontal: space.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
    },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: { padding: 4 },
    fab: {
      position: 'absolute',
      right: space.lg,
      bottom: space.lg,
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    card: { backgroundColor: colors.surfaceContainer, borderRadius: radius.lg, padding: space.md },
    empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl * 2 },
    input: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      paddingHorizontal: space.md,
      paddingVertical: 12,
      fontFamily: type.bodyLg.fontFamily,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerLowest,
    },
    scrim: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surfaceContainerLowest,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: space.md,
      maxHeight: '60%',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceContainerHigh,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: radius.pill,
    },
  });
