# Project Brief: Habit Tracker

- Purpose: Build a responsive (web + mobile) habit tracker with a GitHub-like commit streak experience to motivate daily consistency.
- Core actions: create/manage habits (daily/weekly/monthly/yearly/custom) with optional start/end dates, log completions (no backdating), view per-habit commit heatmaps, and inspect per-day tasks.
- Expected outcomes: quick daily logging (<10s), clear streak visibility with a 3-day grace rule, English-only UI (TR locale/timezone), and secure storage with export/import.
- Success signals: users maintain streaks, understand misses instantly, and can export or back up their habit history; stable auth with username/password + Google.
- Decisions captured: no social or gamification; site-internal push notifications; streak resets after 3 missed consecutive days; Istanbul timezone; SQLite database; frontend TypeScript + React Native + Tamagui with a modern serif look; backend Node.js + Fastify + Prisma; offline supported (initial assets served online) with cache-first static assets and stale-while-revalidate API + background sync; daily automated backups; export/import in JSON; E2E encryption expected.
- Open decisions: hosting/deployment target and exact E2E scope/implementation details.
