# Citizen Monitors

Citizen Monitors is a React Native (Expo) mobile app for election observation and civic engagement in Nigeria. It lets registered observers submit election results and incident reports from polling units, tracks those submissions through an offline-first sync queue, and gives every user live collation results, community discussion, and voter education content.

## Core features

- **Auth** — email/password sign-up with verification, Google sign-in, password reset, and an app-level lock (device PIN/pattern/password or biometrics).
- **Election reporting** — submit election results and incident reports per polling unit, with photo/video evidence. Reports queue locally and sync automatically once the device is online, so observers can report from areas with poor connectivity.
- **Digital Vault** — a personal record of every report a user has submitted, with live sync status (synced, pending, or failed).
- **Collation** — live, per-election result collation with a geographic breakdown, sentiment analysis, and a community review feed where submitted reports can be confirmed, disputed, or flagged.
- **Pulse** — a discussion feed for sharing opinions and commenting on election-related topics.
- **Voter essentials** — registration guide, polling unit locator, election day procedure, a citizen academy, press coverage, and news/insights.
- **Notifications, help & support, and donations.**

## Tech stack

- [Expo](https://expo.dev) SDK 57 (React Native 0.86, React 19) with [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [TanStack Query](https://tanstack.com/query) for server state and caching
- TypeScript, ESLint (`eslint-config-expo`)
- `@gorhom/bottom-sheet`, `react-native-reanimated`, `react-native-gesture-handler`
- `expo-secure-store` for token/credential storage, `expo-local-authentication` for biometric app lock
- EAS Build and EAS Update for native builds and over-the-air updates

## Project structure

```
app/                    Screens and routes (Expo Router, file-based)
  (public)/              Sign in, sign up, onboarding, password flows
  (app)/(tabs)/           Home, Elections, Collation, Pulse, Me
  (app)/reporting/        Election result & incident report submission flows
  (app)/voter-essentials/ Registration guide, polling unit locator, academy, etc.
src/
  components/            UI components, grouped by feature area
  context/                Auth, offline sync, network, elections, tour context
  hooks/api/               React Query hooks per API domain
  lib/api/                 API request functions and response mapping
  data/                    Static reference data (parties, FAQ content, etc.)
  theme/                   Colors, spacing, typography
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with the following variables:

   ```
   EXPO_PUBLIC_API_BASE_URL=
   EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN=
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
   ```

   Ask a project maintainer for the actual values. `.env.local` is git-ignored and should never be committed.

3. Start the dev server:

   ```bash
   npx expo start
   ```

   This app uses native modules (Google Sign-In, biometrics, camera, etc.), so it needs a development build rather than Expo Go — run `npx expo run:ios` or `npx expo run:android` for a first build, then `npx expo start` for subsequent development.

## Building and releasing

Native builds and store submissions go through [EAS](https://docs.expo.dev/eas/):

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

Build profiles (`development`, `preview`, `production`) are defined in `eas.json`.

Over-the-air JS updates are published per environment:

```bash
npm run update:development
npm run update:preview
npm run update:production
```

Each of these requires the matching environment variables to be configured on EAS (`eas env:list --environment <name>`), separate from local `.env.local`.

## Linting and type-checking

```bash
npm run lint
npx tsc --noEmit
```
