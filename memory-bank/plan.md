# Plan

## Phase 1: Finalize Decisions
- ORM: Prisma on SQLite with Fastify.
- Export/import: JSON with validation.
- Offline: PWA cache-first static assets, stale-while-revalidate API reads, background sync queue for writes.
- Security: at-rest encryption and E2E for sensitive data; daily backups.
- Status: completed.

## Phase 2: Architecture & Data Model
- Define habit schema (frequency options, optional start/end, timezone binding).
- Define log/commit schema (per-day counts, no backdating, audit trail).
- Model streak rules with 3-day grace; compute per habit; store summaries.
- Plan auth flows (username/password + Google) and password change endpoint; session/token strategy.
- Specify site-internal notification mechanism (in-app/push-style).
- Define E2E key handling approach (storage, rotation, recovery constraints).
- Status: in progress (architecture draft added in `memory-bank/architecture.md`; decisions taken: soft delete via deletedAt, E2E recovery via user-held recovery key + re-encrypt on rotation, standard error envelope). Schema modeled and `prisma db push` applied with Prisma 5.19.1; migrate dev pending due to non-interactive environment. Auth routes implemented (register/login/logout/me/password) with hashed session tokens and CSRF cookie; habit/log/streak/heatmap/export/import endpoints added.

## Phase 3: Backend Implementation (Node.js + Fastify + ORM on SQLite)
- Set up SQLite schema/migrations; seed minimal data.
- Build auth (register/login with password policy, Google OAuth, password change).
- Implement habit CRUD and logging endpoints enforcing no backdating and timezone rules.
- Implement streak calculation service and calendar intensity aggregation per habit.
- Add export/import endpoints; apply JSON format; include validation.
- Add encryption at rest and E2E for sensitive fields; daily automated backups; anonymize logs.

## Phase 4: Frontend Implementation (TypeScript + React Native + Tamagui)
- Build auth screens (login/register with Google, password change) and marketing/landing for signed-out users.
- Build habit management UI (create/edit with frequency and optional dates).
- Build logging UI for quick daily entry; show per-habit heatmaps with hover counts and click-to-view task list per day.
- Display streaks and concise stats; surface site-internal notifications and offline cues; cache assets/data for offline after first load.
- Add export/import UI flows with validation feedback and error states.
- Apply modern serif typography (high-quality, not Times New Roman) with sharp, minimal, professional styling.

## Phase 5: QA, Security, and Release
- Add unit/integration tests for streak logic, no-backdating, auth rules, and import/export.
- Add accessibility pass (keyboard/contrast) and locale/timezone verification (TR format, Istanbul).
- Add monitoring/logging (error tracking), backup routine, and deployment pipeline.
- Prepare release notes and a simple usage guide.
