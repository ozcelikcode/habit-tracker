## System Patterns

### Architecture Overview
- Frontend: React + Vite SPA with routing kept minimal (likely single dashboard).
- State management: start with React Query or Zustand to keep server cache and UI state simple; expand later if complexity grows.
- Styling: Tailwind CSS utility-first, leveraging CSS grid/flexbox for layout.
- Data layer: SQLite database with simple REST/JSON API (Express or similar) or local SQLite via WASM/tauri? (to be decided).

### Key Components
1. **HabitList / To-Do Panel** - shows today's habits, allows toggling completion.
2. **CalendarHeatmap** - renders a matrix for days, tinted by completion count.
3. **HabitForm** - create/update habits.
4. **StatsBanner** - current streak, completion percent.

### Patterns
- Source of truth for habit entries stored in SQLite; UI fetches via API.
- Deterministic color scale for heatmap (0-4 levels).
- Use hooks for data fetching/mutations to encapsulate logic (`useHabits`, `useCompletions`).
- Keep server API restful: `/habits`, `/entries`, aggregated endpoints for stats.

### Open Questions
- Should SQLite run on server (node backend) or client (WASM)? leaning server.
- Need authentication? For MVP, single-user local usage.
