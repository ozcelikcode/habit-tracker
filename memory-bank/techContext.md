## Tech Context

- **Frontend**: React 18 + Vite for dev/build pipeline, TypeScript optional (decide soon). Tailwind CSS for styling, PostCSS autoprefixer. Potential use of Heroicons or similar for icons.
- **Backend**: Lightweight Node/Express server exposing REST endpoints. SQLite (via `better-sqlite3` or `sqlite3`) for storage. Consider using drizzle/prisma for migrations.
- **Tooling**: pnpm or npm (choose). ESLint + Prettier integration recommended. Vitest for unit testing, Playwright or Cypress for E2E later.
- **Hosting**: Eventually deploy frontend (Netlify/Vercel) and backend (Render/Fly). For now, local dev only.
- **Data considerations**: store habits, daily completions, metadata (color, target). Need migrations + seed data.
