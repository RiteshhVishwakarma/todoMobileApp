# Blossom Todo

A clean, soft-pink to-do app for Android, iOS and web, built with React Native and Expo.

> **Status:** Phase 2 — the full user interface and navigation are done. Saving tasks on the device comes next.

## Highlights

- **5-tab mobile app:** Home, Tasks, Calendar, Categories and Settings, plus a Completed screen and a quick "Add Task" sheet
- **Daily progress:** a progress ring, today's and upcoming tasks, and a monthly calendar that marks busy days
- **Search and filters:** find tasks by name and switch between all, active and completed tasks
- **Light and dark themes** with a consistent pastel design
- **Reusable components:** typed with TypeScript, with no type or lint errors

## Tech stack

React Native · Expo (SDK 58) · TypeScript · Expo Router · Lucide icons

## Run it locally

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app, or press `a` (Android), `i` (iOS) or `w` (web).

## Project structure

```
src/
  app/          screens and navigation (Expo Router)
  components/   reusable UI (TaskCard, ProgressCard, EmptyState…)
  constants/    colors and categories
  data/         sample tasks for previews
  theme/        light/dark theme
```

## Roadmap

- [x] UI and navigation
- [ ] Save tasks on the device
- [ ] Reminders and notifications
