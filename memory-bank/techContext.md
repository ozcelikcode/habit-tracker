# Tech Context

- Platform: responsive web/mobile.
- Frontend: TypeScript + React Native with Tamagui; modern serif typography (not Times New Roman), sharp/minimal/professional style.
- Backend: Node.js + Fastify (performance-focused) with Prisma ORM on SQLite.
- Locale/timezone: English UI, TR date format, Istanbul timezone.
- Notifications: site-internal push-style notifications (no external provider for now).
- Auth: username/password (min 8 chars) + Google; password change via profile (current + new); no anonymous/social beyond Google.
- Security: strong encryption expected (at rest) and E2E encryption for sensitive data; anonymized logs where needed; daily automated backups.
- Features: no social, no gamification, no other integrations; export/import uses JSON.
- Offline: permitted after initial online load; PWA caching with cache-first static assets, stale-while-revalidate for API reads, and background sync queue for writes.
- Open: hosting/deployment target, precise E2E key handling, session strategy (cookie vs JWT).
