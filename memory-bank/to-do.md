# Habit Tracker To Do

## Backend
[x] Finalize E2E encryption key handling (recovery key issuance, client-side re-encrypt on rotation, storage rules)
[] Implement migration pipeline (replace db push with migrate dev/deploy; generate baseline migration)
[] Add audit logging for habit/log changes (who/when)
[] Add validation/DTO sharing for API errors and field errors
[] Add basic monitoring/logging hooks (errors, slow queries)

## Frontend (TS + React Native + Tamagui)
[] Scaffold app shell, routing/navigation, theme with modern serif typography
[] Auth flows: login/register (Google + password), password change, session/CSRF handling
[] Habit management UI: create/edit (freq options, start/end, custom rule), list with streak summary
[] Logging UI: quick “today” log entry, per-day task detail, prevent backdating
[] Streak & heatmap UI: per-habit heatmap with hover/tap counts, streak display with 3-day grace logic
[] Export/Import UI: JSON download/upload with validation feedback
[] Offline/PWA: cache-first assets, stale-while-revalidate reads, background sync queue for writes; offline indicators
[] Notifications: in-app push-style banner/toast handling
[] E2E key UX: recovery key display, rotation flow, and storage reminders
[] Testing pass: unit/integration for streak logic, no-backdating, auth flows, and offline queue
