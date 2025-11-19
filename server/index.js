import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import { buildDashboardPayload } from './dashboardService.js';

const PORT = process.env.PORT || 4000;
const COLOR_PRESETS = ['#34d399', '#22d3ee', '#a78bfa', '#fbbf24', '#f472b6', '#60a5fa'];

const app = express();
const db = initializeDatabase();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/dashboard', (req, res) => {
  const payload = buildDashboardPayload(db);
  res.json(payload);
});

app.get('/api/habits', (req, res) => {
  const habits = db
    .prepare(
      'SELECT id, name, category, color, target_per_day as targetPerDay, sort_order as sortOrder FROM habits WHERE is_archived = 0 ORDER BY sort_order, id'
    )
    .all();
  res.json(habits);
});

app.post('/api/habits', (req, res) => {
  const { name, category = 'Genel', color, targetPerDay = 1 } = req.body || {};
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'İsim gereklidir' });
    return;
  }

  const nextSortOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM habits').get().next;
  const finalColor = color || COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];

  const result = db
    .prepare('INSERT INTO habits (name, category, color, target_per_day, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(name.trim(), category.trim(), finalColor, targetPerDay, nextSortOrder);

  const habit = db
    .prepare('SELECT id, name, category, color, target_per_day as targetPerDay, sort_order as sortOrder FROM habits WHERE id = ?')
    .get(result.lastInsertRowid);

  const dashboard = buildDashboardPayload(db);
  res.status(201).json({ habit, dashboard });
});

app.post('/api/habit-entries/toggle', (req, res) => {
  const { habitId, date } = req.body || {};
  if (!habitId) {
    res.status(400).json({ error: 'habitId değeri gereklidir' });
    return;
  }
  const todayKey = date || new Date().toISOString().slice(0, 10);

  const habit = db.prepare('SELECT id FROM habits WHERE id = ?').get(habitId);
  if (!habit) {
    res.status(404).json({ error: 'Alışkanlık bulunamadı' });
    return;
  }

  const existing = db.prepare('SELECT id FROM habit_entries WHERE habit_id = ? AND date = ?').get(habitId, todayKey);
  let status = 'created';
  if (existing) {
    db.prepare('DELETE FROM habit_entries WHERE id = ?').run(existing.id);
    status = 'deleted';
  } else {
    db.prepare('INSERT INTO habit_entries (habit_id, date, amount) VALUES (?, ?, 1)').run(habitId, todayKey);
  }

  const dashboard = buildDashboardPayload(db);
  res.json({ status, dashboard });
});

app.listen(PORT, () => {
  console.log(`Habit Tracker API is running on http://localhost:${PORT}`);
});
