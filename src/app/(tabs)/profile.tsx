import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, ScreenHeader, Select } from '@/components/ui';
import { useApp } from '@/lib/app';
import { exportCsv } from '@/lib/export';
import { requestPermission } from '@/lib/notify';
import { pickImage } from '@/lib/photo';
import { clearData } from '@/lib/storage';
import { radius, space, type, type Palette } from '@/lib/theme';
import { isEmail } from '@/lib/validate';

const CURRENCIES = [
  { label: '₱  Philippine Peso', sym: '₱' },
  { label: '$  US Dollar', sym: '$' },
  { label: '€  Euro', sym: '€' },
  { label: '£  British Pound', sym: '£' },
  { label: '¥  Japanese Yen', sym: '¥' },
];

export default function ProfileScreen() {
  const { colors, dark, profile, setProfile } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const emailError = email.trim() && !isEmail(email.trim()) ? 'Enter a valid email address' : '';
  const dirty = name !== profile.name || email !== profile.email;

  const saveDetails = async () => {
    const missing: string[] = [];
    if (!name.trim()) missing.push('Name');
    if (missing.length) {
      Alert.alert('Missing required fields', `Please fill in: ${missing.join(', ')}.`);
      return;
    }
    if (emailError) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    await setProfile({ name: name.trim(), email: email.trim() });
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const changePhoto = async () => {
    const uri = await pickImage();
    if (uri) await setProfile({ photoUri: uri });
  };

  const toggleNotifs = async (on: boolean) => {
    if (on && !(await requestPermission())) {
      Alert.alert('Notifications disabled', 'Enable notifications in system settings to get service alerts.');
      return;
    }
    await setProfile({ notificationsEnabled: on });
  };

  const doExport = async () => {
    try {
      const n = await exportCsv();
      if (n === 0) Alert.alert('Nothing to export', 'Add some maintenance records first.');
    } catch {
      Alert.alert('Export failed', 'Could not export records.');
    }
  };

  const doReset = () =>
    Alert.alert('Reset all data', 'This deletes every vehicle and maintenance record. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: async () => {
          await clearData();
          Alert.alert('Done', 'All vehicles and records have been cleared.');
        },
      },
    ]);

  const contactDeveloper = async () => {
    const url = 'mailto:josenies@gmail.com?subject=' + encodeURIComponent('MotoCar PMS app - Feedback');
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No email app', 'Set up an email account on this device to send feedback.');
    }
  };

  const currencyLabel = CURRENCIES.find((c) => c.sym === profile.currency)?.label ?? CURRENCIES[0].label;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.avatarWrap}>
          <Pressable onPress={changePhoto}>
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <MaterialIcons name="person" size={44} color={colors.onPrimary} />
              </View>
            )}
            <View style={styles.avatarEdit}>
              <MaterialIcons name="photo-camera" size={16} color={colors.onPrimary} />
            </View>
          </Pressable>
          <Text style={[type.titleLg, { color: colors.onSurface }]}>{profile.name || 'Rider'}</Text>
          {profile.email ? <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>{profile.email}</Text> : null}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" error={emailError} />
          {dirty ? (
            <Pressable style={styles.saveBtn} onPress={saveDetails}>
              <Text style={[type.labelLg, { color: colors.onPrimary }]}>Save Profile</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Select
            label="Currency"
            value={currencyLabel}
            options={CURRENCIES.map((c) => c.label)}
            onSelect={(label) => {
              const c = CURRENCIES.find((x) => x.label === label);
              if (c) setProfile({ currency: c.sym });
            }}
          />
          <View>
            <Text style={[type.labelLg, { color: colors.onSurfaceVariant, marginBottom: space.xs }]}>Distance Unit</Text>
            <View style={styles.toggle}>
              {(['km', 'mi'] as const).map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setProfile({ distanceUnit: u })}
                  style={[styles.toggleBtn, profile.distanceUnit === u && styles.toggleActive]}>
                  <Text
                    style={[type.labelLg, { color: profile.distanceUnit === u ? colors.onPrimary : colors.onSurfaceVariant }]}>
                    {u === 'km' ? 'Kilometers (km)' : 'Miles (mi)'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Row label="Dark Mode" sub="Use a dark color theme">
            <Switch value={dark} onValueChange={(on) => setProfile({ theme: on ? 'dark' : 'light' })} trackColor={{ true: colors.primaryContainer }} />
          </Row>
          <Row label="Service Alerts" sub="Notify me when a service is due">
            <Switch value={profile.notificationsEnabled} onValueChange={toggleNotifs} trackColor={{ true: colors.primaryContainer }} />
          </Row>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Pressable style={styles.actionRow} onPress={doExport}>
            <MaterialIcons name="file-download" size={22} color={colors.primary} />
            <Text style={[type.titleMd, { color: colors.onSurface, flex: 1 }]}>Export records to CSV</Text>
            <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable style={styles.actionRow} onPress={doReset}>
            <MaterialIcons name="delete-forever" size={22} color={colors.error} />
            <Text style={[type.titleMd, { color: colors.error, flex: 1 }]}>Reset all data</Text>
            <MaterialIcons name="chevron-right" size={22} color={colors.error} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable style={styles.actionRow} onPress={contactDeveloper}>
            <MaterialIcons name="mail-outline" size={22} color={colors.primary} />
            <Text style={[type.titleMd, { color: colors.onSurface, flex: 1 }]}>Contact the Developer</Text>
            <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[type.titleMd, { color: colors.onSurface }]}>About MotoCar PMS</Text>
          <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>
            Local-first vehicle maintenance tracker. All data stays on this device. Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function Row({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
    return (
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[type.titleMd, { color: colors.onSurface }]}>{label}</Text>
          <Text style={[type.bodyMd, { color: colors.onSurfaceVariant }]}>{sub}</Text>
        </View>
        {children}
      </View>
    );
  }
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { padding: space.md, gap: space.md, paddingBottom: space.xl },
    avatarWrap: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
    avatar: { width: 88, height: 88, borderRadius: 44 },
    avatarEmpty: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarEdit: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    section: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.lg, padding: space.md, gap: space.md },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
    saveBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center' },
    toggle: { flexDirection: 'row', gap: space.sm, backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, padding: 4 },
    toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.pill },
    toggleActive: { backgroundColor: colors.primary },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  });
