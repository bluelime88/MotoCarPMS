# Project Requirements Document (PRD): MotoCar PMS

> **Status:** Reflects the current implementation as of 2026-07-06 (App v1.0.0, Expo SDK 54).
> Legend: ✅ Implemented · 🔶 Partial · 📋 Planned (not yet built)

## 1. Project Overview
**MotoCar PMS** is a mobile-first, **local-first** application for vehicle owners to track and manage Preventive Maintenance Services (PMS) for cars and motorcycles. It bridges the gap between complex fleet-management tools and simple note-taking with an intuitive, Material Design 3-inspired interface for tracking service history, expenses, and upcoming maintenance schedules — all stored on-device.

### 1.1 Goal
To provide a seamless, one-handed mobile experience that reduces the mental load of vehicle maintenance through scheduled reminders, organized history, and clear expense visualization — with no account or internet connection required.

### 1.2 Target Audience
- **Everyday Commuters:** People who want to keep their primary vehicle reliable.
- **Enthusiasts/Collectors:** Users with multiple vehicles (cars and bikes) needing centralized tracking.
- **Cost-Conscious Owners:** Users tracking maintenance spend and resale value through detailed service logs.

---

## 2. Design & Branding
- **Visual Language:** Material Design 3 (Android-first), with full **light and dark themes**. ✅
- **Color Roles** (from the app's M3 palette, `theme.ts`):
  - **Primary:** `#004AC6` blue (prominent container `#2563EB`) — trust and reliability.
  - **Secondary:** `#006E2F` green — health / "Healthy" status.
  - **Tertiary/Accent:** `#784B00` amber — "Due Soon" alerts.
  - **Error:** `#BA1A1A` red — "Overdue" and destructive actions.
  - **Status chips:** Healthy (green), Due Soon (amber), Overdue (red).
- **Typography:** Inter (400/500/600/700), loaded via `@expo-google-fonts/inter`. ✅
- **Key UI Patterns:** Rounded cards (8–16px radius), floating action buttons (FAB), 5-tab bottom navigation, month-grouped timeline, and status pills. ✅

---

## 3. Functional Requirements

### 3.1 Vehicle Management ✅
- **Multi-Vehicle Support:** Add/edit/delete unlimited cars and motorcycles.
- **Vehicle Profiles:** Brand, model, variant, year, plate, color, odometer, fuel type, transmission, owner's note, and a photo.
- **Health Indicators:** Real-time status (Healthy / Due Soon / Overdue) computed from the latest recorded next-service target — **thresholds: within 14 days or 500 km = Due Soon; past = Overdue**.
- **Search:** Filter the fleet by brand, model, or plate.
- **Input validation:** Brand and Model required; plate auto-formatted (uppercase, alphanumeric); odometer numeric-only.

### 3.2 Maintenance Tracking ✅
- **Service Logs:** Record date, odometer, service type, description, workshop/service center, and split **parts + labor** costs.
- **Service Types:** Oil & Filter Change, Brake Service, Tire Rotation, Tire Replacement, Battery, Engine Diagnostic, General Maintenance.
- **Asset Attachment:** Upload a **Receipt Photo** and a **Service Photo** per record; thumbnails appear in the vehicle's history and open in a **full-screen viewer** on tap.
- **Timeline View:** Chronological history **grouped by month**, with per-type filter chips and a running total spend (Maintenance tab). Per-vehicle service history also shown on the Vehicle Detail screen.
- **Odometer sync:** Logging a higher odometer than the vehicle's current reading updates the vehicle automatically.
- **Validation:** A vehicle must be selected, and **Next Service Due requires at least one of due date or due mileage** (see 3.3). Missing required fields raise a clear alert listing exactly what's needed.

### 3.3 Reminders & Scheduling ✅
- **Hybrid Triggers:** Next service defined by **due date, due mileage, or both** (at least one required when logging).
- **Upcoming Schedule View:** The Reminders screen lists **all** scheduled services across the fleet — overdue, due-soon, and far-future — sorted most-urgent-first, each showing its **absolute due date and/or target mileage** and a relative label ("17 days overdue", "Due in 70 days").
- **Calendar Strip:** A current-week day strip that **marks days with a due service** via a dot. 🔶 *(Full month/scrollable calendar — 📋 planned.)*
- **Local Notifications:** Local scheduled notifications for services with a due date, gated by the "Service Alerts" setting and OS permission (via `expo-notifications`). ✅ *(Remote/push notifications — 📋 planned.)*

### 3.4 Expense Analytics ✅
- **Auto-computed Spend:** Monthly expenses are derived directly from maintenance records (parts + labor) — **no manual budget entry**.
- **Analytics Dashboard (Expenses tab):**
  - Stat cards: **Spent this Year**, **Avg. Monthly**, **This Month**.
  - **Monthly Expense Trend** — 12-month bar chart for the current year.
  - **By Category** — breakdown by service type with amount and percentage.
  - **Top Expenses by Vehicle** — ranked bar chart (fleet comparison).
  - **Recent Expense Logs** — latest records with vehicle, type, and cost.
- Charts are rendered natively (no charting dependency). 🔶 *(Monthly/Annual toggle and Fuel/Insurance categories — 📋 planned; the app currently categorizes by service type, and does not track fuel or insurance.)*

### 3.5 Settings & Data ✅
- **Profile:** Editable name and email (email format validated), avatar photo.
- **Preferences:** Currency symbol (₱ / $ / € / £ / ¥), distance unit (km / mi, with automatic conversion), dark mode, and service-alert notifications.
- **Data Export:** Export all records to **CSV** via the native share sheet. ✅ *(PDF export — 📋 planned.)*
- **Reset:** Wipe all vehicles and records (keeps settings).
- **Contact the Developer:** Opens the device email client pre-filled to the developer with a feedback subject.

---

## 4. User Experience (UX) Principles ✅
- **Fast Logging:** Smart defaults, pickers, date pickers, and numeric keyboards minimize typing.
- **One-Handed Navigation:** Core actions (Add Vehicle, Add Record) via bottom-aligned FABs and a bottom tab bar.
- **Contextual Data:** The Dashboard surfaces the single most relevant item (next/overdue service) prominently, with the full list one tap away.
- **Clear Validation:** Submitting an incomplete form alerts the user to the specific missing required fields rather than failing silently.

---

## 5. Screen List (Implemented)
1. **Dashboard** — greeting, upcoming-service hero, overdue alerts, horizontal fleet with status chips, auto-computed monthly-expense card, and a bell → Reminders. ✅
2. **Vehicles List** — searchable list of all registered vehicles with status. ✅
3. **Add / Edit Vehicle** — full profile form with photo and validation. ✅
4. **Vehicle Detail** — specs grid, total cost, service history with photo thumbnails + full-screen viewer, edit/delete. ✅
5. **Maintenance** — master timeline grouped by month, type filters, total spend. ✅
6. **Add Service Record** — service entry with cost split, next-due, and receipt/service photo attachments. ✅
7. **Reminders (Upcoming Schedule)** — week strip + full sorted schedule of all upcoming/overdue services. ✅
8. **Expense Analytics** — stat cards, trend/category/vehicle charts, recent logs. ✅
9. **Profile & Settings** — profile, preferences, export, reset, contact developer. ✅

**Navigation:** 5-tab bottom bar — Dashboard · Vehicles · Maintenance · Expenses · Profile.

---

## 6. Technical Implementation
- **Framework:** Expo **SDK 54**, React Native 0.81, React 19 (React Compiler enabled).
- **Routing:** `expo-router` (file-based, typed routes).
- **Language:** TypeScript.
- **Storage:** **Local-first** via `@react-native-async-storage/async-storage` (JSON collections for vehicles, records, and profile). No backend/account.
- **Media:** `expo-image-picker` (photos), `expo-image` (rendering).
- **Notifications:** `expo-notifications` (local, scheduled).
- **Export/Share:** `expo-file-system` + `expo-sharing` (CSV).
- **Build/Distribution:** EAS Build — Android **APK** (preview/internal) and app-bundle (production).
- **Platform:** Android (primary); iOS supported via the same cross-platform codebase (secondary).

---

## 7. Roadmap / Not Yet Implemented (📋)
- **Cloud sync & backup** (currently device-local only; data is lost on uninstall/reset).
- **PDF export** for resale/service documentation (CSV is available today).
- **Full calendar view** (month grid) beyond the current-week strip.
- **Remote/push notifications** (only local scheduled notifications today).
- **Expense categories for Fuel & Insurance** and a **Monthly/Annual analytics toggle**.
- **Pinch-to-zoom** in the photo viewer.
