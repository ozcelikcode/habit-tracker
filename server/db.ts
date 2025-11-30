import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'habits.db'));

// Veritabanı tablolarını oluştur
db.exec(`
  -- Alışkanlıklar tablosu
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    color TEXT DEFAULT '#2EAC8A',
    icon TEXT, -- lucide ikon kimliği (ör: 'alarm-clock')
    frequency TEXT DEFAULT 'daily', -- daily, weekdays, custom
    custom_days TEXT, -- JSON array for custom days [0,1,2,3,4,5,6] (0=Pazar)
    scheduled_time TEXT, -- HH:MM format - ne zaman çalışacak
    duration_minutes INTEGER, -- kaç dakika sürecek
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    archived INTEGER DEFAULT 0
  );

  -- Alışkanlık tamamlama kayıtları
  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    completed_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completed_date)
  );

  -- Kullanıcı ayarları
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Günlük notlar
  CREATE TABLE IF NOT EXISTS daily_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_date DATE NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Varsayılan ayarları ekle
  INSERT OR IGNORE INTO settings (key, value) VALUES ('username', 'Kullanıcı');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'dark');
`);

// Migration: Yeni sütunları ekle (mevcut veritabanı için)
try {
  db.exec(`ALTER TABLE habits ADD COLUMN scheduled_time TEXT`);
} catch (e) {
  // Sütun zaten var
}
try {
  db.exec(`ALTER TABLE habits ADD COLUMN duration_minutes INTEGER`);
} catch (e) {
  // Sütun zaten var
}
try {
  db.exec(`ALTER TABLE habits ADD COLUMN icon TEXT`);
} catch (e) {
  // Sütun zaten var
}

export default db;
