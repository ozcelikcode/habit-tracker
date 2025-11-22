# System Patterns

- Patterns emerging:
  - Timezone-bound logging (Istanbul) with no backdating; commit calendar intensity increases with more completions per day.
  - Per-habit heatmaps; hover shows daily completion count; click reveals that day's tasks.
  - Streak engine: 3-day grace (streak resets after 3 consecutive no-activity days).
  - Offline-capable frontend after initial online load; daily automated backups.
  - Offline/PWA strategy: cache-first for static assets; stale-while-revalidate for API reads; background sync queue for write ops (habit logs) to preserve streak integrity.
- Anticipated needs: auditability/log history, export/import pipeline (JSON), and secure storage with strong encryption at rest and E2E for sensitive data.
- To decide: frontend state management, exact API auth/session implementation (likely cookie/session vs JWT), and push delivery pattern (site-internal notifications specifics).
