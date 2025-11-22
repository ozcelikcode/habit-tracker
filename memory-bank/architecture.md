# Architecture & Contracts (Draft)

## Auth/Session Strategy
- Session: httpOnly, secure cookie (name env-driven, default `session_token`) with server-side session store (Prisma) keyed by rotating, SHA-256–hashed session token; CSRF token per session, also set as a non-HttpOnly cookie and echoed in responses.
- Auth: username/password (min 8 chars); Google OAuth linked to same user via `Account` table; logout deletes session; password change requires current password.
- Tokens: no JWT unless future external APIs require it.
- E2E: sensitive habit/log content encrypted client-side with a per-user key; store encrypted blobs server-side. Key derived client-side (PBKDF2/scrypt from user secret). Recovery: user receives a one-time recovery key (not stored server-side); rotation requires re-encrypting data with a new key client-side.

## Data Model (Prisma/SQLite)
- User: id, username (unique), email (optional), passwordHash, createdAt, updatedAt.
- Account (OAuth): id, userId FK, provider, providerAccountId (unique per provider), accessToken?, refreshToken?, createdAt.
- Session: id, userId FK, sessionToken (hashed, unique), csrfToken, expiresAt, createdAt, updatedAt.
- Habit: id, userId FK, title, description (encrypted/string), frequency (string; app-enforced options daily/weekly/monthly/yearly/custom), customRule (string JSON payload, encrypted), startDate?, endDate?, timezone (default Europe/Istanbul), createdAt, updatedAt, deletedAt?.
- HabitLog: id, habitId FK, date (TZ-bound), count (int >=1), note (encrypted/string), createdAt, updatedAt, deletedAt?. No backdating allowed.
- StreakSnapshot: id, habitId FK, streakLength, lastActiveDate, updatedAt.
- ExportJob/ImportJob (optional): id, userId FK, type/status strings, location (path/url), createdAt.
- Backup metadata: managed outside app logic; daily automated backups of SQLite.

## API Contracts (REST over Fastify, JSON)
- Auth
  - POST `/auth/register`: {username, password} -> session cookie; validation (>=8 chars).
  - POST `/auth/login`: {username, password} -> session cookie.
  - POST `/auth/logout`: clears session.
  - POST `/auth/password`: {currentPassword, newPassword} -> 204.
  - GET `/auth/me`: returns user profile (no secrets).
  - GET `/auth/google` / callback endpoints as needed.
- Habits
  - GET `/habits`: list habits with streak summary.
  - POST `/habits`: create habit {title, description?, frequency, customRule?, startDate?, endDate?}.
  - GET `/habits/:id`: detail + heatmap aggregates.
  - PATCH `/habits/:id`: update fields.
  - DELETE `/habits/:id`: soft-delete or hard-delete (TBD; recommend soft).
- Logs
  - POST `/habits/:id/logs`: create log for today (no backdating) {count, note?}.
  - GET `/habits/:id/logs?from&to`: list logs for range.
  - DELETE `/logs/:logId`: optional; if allowed, maintain audit trail.
- Stats
  - GET `/habits/:id/streak`: current streak and lastActiveDate.
  - GET `/habits/:id/heatmap?from&to`: daily counts for calendar.
- Export/Import
  - POST `/export`: triggers JSON export; returns link/status.
  - POST `/import`: upload JSON; validated and applied.

## Offline/PWA Behavior
- Cache-first static assets; stale-while-revalidate for GET APIs.
- Background sync queue for POST/PATCH writes (logs, habits) to avoid streak loss offline; retries with backoff.
- Conflict handling: if offline log for a past date violates no-backdating, surface error on sync (logs only for current TZ date).

## Error/Validation Shape
- Standard error envelope: { error: { code, message, details? } } with HTTP status codes; validation errors include field-level details array.

## Notes
- Prisma pinned to 5.19.1 (SQLite + string fields for enums/json) for stability on Windows; db changes applied with `prisma db push` (non-interactive migrate dev blocked).

## Notes / Open Points
- Soft-delete vs hard-delete for habits/logs.
- E2E recovery/rotation flow needs design (e.g., recovery key).
- Error/validation schema (shared types) to be defined with frontend.
