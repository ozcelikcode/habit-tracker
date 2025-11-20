import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'server', 'habit-tracker.db');

const HABIT_SEED = [
  { name: "Sabah 5'te uyan", category: 'Sabah Rutini', color: '#34d399', target: 1 },
  { name: '30 dakika egzersiz yap', category: 'Spor', color: '#60a5fa', target: 1 },
  { name: '15 sayfa kitap oku', category: 'Kitap Okuma', color: '#f472b6', target: 1 },
  { name: '2 litre su iç', category: 'Sağlık', color: '#fde047', target: 1 },
  { name: 'Meditasyon', category: 'Rahatlama', color: '#c084fc', target: 1 },
];

const formatDate = (date) => date.toISOString().slice(0, 10);

export function initializeDatabase() {
  ensureDirectory();
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  createTables(db);
  ensureHabitColumns(db);
  seedIfNeeded(db);
  return db;
}

function ensureDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      color TEXT,
      target_per_day INTEGER DEFAULT 1,
      is_archived INTEGER DEFAULT 0,
      preferred_date TEXT,
      preferred_time TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER DEFAULT 1,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id)
    );

    CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
    CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_date ON habit_entries(habit_id, date);
  `);
}

function ensureHabitColumns(db) {
  const columns = db.prepare('PRAGMA table_info(habits)').all();
  const has = (name) => columns.some((col) => col.name === name);
  const addColumn = (name, definition) => {
    if (!has(name)) {
      db.prepare(`ALTER TABLE habits ADD COLUMN ${name} ${definition}`).run();
    }
  };
  addColumn('preferred_date', 'TEXT');
  addColumn('preferred_time', 'TEXT');
}

function seedIfNeeded(db) {
  const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
  if (habitCount > 0) {
    return;
  }

  const insertHabit = db.prepare(
    'INSERT INTO habits (name, category, color, target_per_day, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  const insertEntry = db.prepare(
    'INSERT INTO habit_entries (habit_id, date, amount) VALUES (?, ?, ?)'
  );

  const habitIds = HABIT_SEED.map((habit, index) => {
    const result = insertHabit.run(habit.name, habit.category, habit.color, habit.target, index);
    return result.lastInsertRowid;
  });

  const today = new Date();
  const totalDays = 28 * 7 + 28; // roughly 8 months

  for (let offset = 0; offset < totalDays; offset += 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - offset);
    const dateKey = formatDate(targetDate);

    habitIds.forEach((habitId, idx) => {
      const completionChance = 0.35 + Math.random() * 0.5 + idx * 0.02;
      if (Math.random() < completionChance) {
        const amount = Math.random() > 0.8 ? 2 : 1;
        insertEntry.run(habitId, dateKey, amount);
      }
    });
  }
}
