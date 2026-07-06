# MotoCar PMS

A mobile-first, **local-first** app for tracking Preventive Maintenance Services (PMS) for cars and motorcycles. Log service history, track expenses, and stay ahead of upcoming maintenance — no account or internet required, all data stays on the device.

Built with Expo (SDK 54) + React Native, Material Design 3 styling, light/dark themes.

## Features

- **Vehicles** — add/edit cars & motorcycles with photos; live health status (Healthy / Due Soon / Overdue) from mileage or time.
- **Maintenance log** — record service type, odometer, workshop, and parts/labor cost; attach **receipt** and **service** photos; month-grouped timeline with per-type filters.
- **Upcoming schedule** — Reminders screen lists all scheduled services (overdue, due-soon, and future) with absolute due dates, plus a week strip marking due days. Optional local notifications.
- **Expense analytics** — spend auto-computed from records: year/avg/month stats, monthly trend, by-category and top-vehicle charts, recent logs.
- **Settings** — currency, km/mi units, dark mode, CSV export, contact developer, reset data.
- **Validation** — required-field alerts on all add/edit forms, email/plate/number formatting.

See [`docs/PRD.md`](docs/PRD.md) for the full product requirements and roadmap.

## Tech stack

- Expo SDK 54, React Native 0.81, React 19 (React Compiler)
- `expo-router` (file-based, typed routes), TypeScript
- `@react-native-async-storage/async-storage` (local persistence)
- `expo-image-picker` / `expo-image`, `expo-notifications`, `expo-file-system` + `expo-sharing`

## Getting started

```bash
npm install
npx expo start
```

Then open on an Android device/emulator, iOS simulator, or the web preview.

Pure functions have runnable self-checks (no test framework):

```bash
npx tsx src/lib/status.ts     # reminders / expense math
npx tsx src/lib/validate.ts   # input validation
npx tsc --noEmit              # type check
```

## Builds (EAS)

```bash
eas build --profile preview --platform android      # internal APK
eas build --profile production --platform android   # store app-bundle
```

## Project structure

```
src/
  app/            # expo-router screens
    (tabs)/       # Dashboard, Vehicles, Maintenance, Expenses, Profile
    vehicle/      # add/edit + detail
    maintenance/  # add service record
    reminders.tsx # upcoming schedule
  components/      # shared UI primitives
  lib/            # storage, status logic, theme, validation, helpers
```
