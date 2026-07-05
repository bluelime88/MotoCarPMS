// Design tokens (Material Design 3, MotoCar PMS). Light palette from DESIGN.md;
// dark palette is the M3 dark counterpart of the same roles.
export type Palette = {
  surface: string;
  surfaceDim: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  status: Record<'good' | 'due' | 'overdue', { fg: string; bg: string; label: string }>;
};

export const lightColors: Palette = {
  surface: '#faf8ff',
  surfaceDim: '#d2d9f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f3ff',
  surfaceContainer: '#eaedff',
  surfaceContainerHigh: '#e2e7ff',
  surfaceContainerHighest: '#dae2fd',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  primary: '#004ac6',
  onPrimary: '#ffffff',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#eeefff',
  secondary: '#006e2f',
  onSecondary: '#ffffff',
  secondaryContainer: '#6bff8f',
  onSecondaryContainer: '#007432',
  tertiary: '#784b00',
  onTertiary: '#ffffff',
  tertiaryContainer: '#996100',
  onTertiaryContainer: '#ffeedd',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#faf8ff',
  onBackground: '#131b2e',
  status: {
    good: { fg: '#006e2f', bg: '#6bff8f', label: 'Healthy' },
    due: { fg: '#784b00', bg: '#ffddb8', label: 'Due Soon' },
    overdue: { fg: '#ba1a1a', bg: '#ffdad6', label: 'Overdue' },
  },
};

export const darkColors: Palette = {
  surface: '#101323',
  surfaceDim: '#101323',
  surfaceContainerLowest: '#0b0e1a',
  surfaceContainerLow: '#191c2c',
  surfaceContainer: '#1d2030',
  surfaceContainerHigh: '#272a3b',
  surfaceContainerHighest: '#323548',
  onSurface: '#e5e8f7',
  onSurfaceVariant: '#c3c6d7',
  outline: '#8d90a0',
  outlineVariant: '#434655',
  primary: '#b4c5ff',
  onPrimary: '#002d6e',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#dbe1ff',
  secondary: '#4ae176',
  onSecondary: '#003916',
  secondaryContainer: '#005321',
  onSecondaryContainer: '#6bff8f',
  tertiary: '#ffb95f',
  onTertiary: '#472a00',
  tertiaryContainer: '#653e00',
  onTertiaryContainer: '#ffddb8',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  background: '#101323',
  onBackground: '#e5e8f7',
  status: {
    good: { fg: '#6bff8f', bg: '#005321', label: 'Healthy' },
    due: { fg: '#ffb95f', bg: '#653e00', label: 'Due Soon' },
    overdue: { fg: '#ffb4ab', bg: '#93000a', label: 'Overdue' },
  },
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 4, md: 8, lg: 16, pill: 9999 } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  headlineSm: { fontFamily: font.semibold, fontSize: 24, lineHeight: 32 },
  titleLg: { fontFamily: font.medium, fontSize: 22, lineHeight: 28 },
  titleMd: { fontFamily: font.medium, fontSize: 16, lineHeight: 24 },
  bodyLg: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  labelLg: { fontFamily: font.medium, fontSize: 14, lineHeight: 20 },
  labelSm: { fontFamily: font.medium, fontSize: 11, lineHeight: 16 },
} as const;
