import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ============ HABITS API ============

// Tüm alışkanlıkları getir
app.get('/api/habits', (req, res) => {
  try {
    const habits = db.prepare(`
      SELECT * FROM habits WHERE archived = 0 ORDER BY created_at DESC
    `).all();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Alışkanlıklar getirilemedi' });
  }
});

// Tek alışkanlık getir
app.get('/api/habits/:id', (req, res) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    if (!habit) {
      return res.status(404).json({ error: 'Alışkanlık bulunamadı' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Alışkanlık getirilemedi' });
  }
});

// Yeni alışkanlık oluştur
app.post('/api/habits', (req, res) => {
  try {
    const { title, subtitle, color, frequency, custom_days } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Başlık gerekli' });
    }

    const result = db.prepare(`
      INSERT INTO habits (title, subtitle, color, frequency, custom_days)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, subtitle || null, color || '#2EAC8A', frequency || 'daily', custom_days ? JSON.stringify(custom_days) : null);

    const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ error: 'Alışkanlık oluşturulamadı' });
  }
});

// Alışkanlık güncelle
app.put('/api/habits/:id', (req, res) => {
  try {
    const { title, subtitle, color, frequency, custom_days } = req.body;
    
    db.prepare(`
      UPDATE habits 
      SET title = COALESCE(?, title),
          subtitle = COALESCE(?, subtitle),
          color = COALESCE(?, color),
          frequency = COALESCE(?, frequency),
          custom_days = COALESCE(?, custom_days),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, subtitle, color, frequency, custom_days ? JSON.stringify(custom_days) : null, req.params.id);

    const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Alışkanlık güncellenemedi' });
  }
});

// Alışkanlık sil (arşivle)
app.delete('/api/habits/:id', (req, res) => {
  try {
    db.prepare('UPDATE habits SET archived = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Alışkanlık silinemedi' });
  }
});

// ============ COMPLETIONS API ============

// Belirli tarih aralığındaki tamamlamaları getir
app.get('/api/completions', (req, res) => {
  try {
    const { start_date, end_date, habit_id } = req.query;
    
    let query = 'SELECT * FROM completions WHERE 1=1';
    const params: any[] = [];

    if (start_date) {
      query += ' AND completed_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND completed_date <= ?';
      params.push(end_date);
    }
    if (habit_id) {
      query += ' AND habit_id = ?';
      params.push(habit_id);
    }

    const completions = db.prepare(query).all(...params);
    res.json(completions);
  } catch (error) {
    res.status(500).json({ error: 'Tamamlamalar getirilemedi' });
  }
});

// Alışkanlığı tamamla
app.post('/api/completions', (req, res) => {
  try {
    const { habit_id, completed_date } = req.body;
    
    if (!habit_id || !completed_date) {
      return res.status(400).json({ error: 'habit_id ve completed_date gerekli' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO completions (habit_id, completed_date)
      VALUES (?, ?)
    `).run(habit_id, completed_date);

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Tamamlama kaydedilemedi' });
  }
});

// Tamamlamayı kaldır
app.delete('/api/completions', (req, res) => {
  try {
    const { habit_id, completed_date } = req.body;
    
    db.prepare(`
      DELETE FROM completions WHERE habit_id = ? AND completed_date = ?
    `).run(habit_id, completed_date);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Tamamlama kaldırılamadı' });
  }
});

// ============ STATS API ============

// İstatistikleri getir
app.get('/api/stats', (req, res) => {
  try {
    // Toplam tamamlanan
    const totalCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM completions
    `).get() as { count: number };

    // Mevcut seri hesapla (bugünden geriye doğru ardışık günler)
    const today = new Date().toISOString().split('T')[0];
    const streakData = db.prepare(`
      SELECT DISTINCT completed_date FROM completions 
      ORDER BY completed_date DESC
    `).all() as { completed_date: string }[];

    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (const record of streakData) {
      const recordDate = new Date(record.completed_date);
      const diffDays = Math.floor((checkDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        checkDate = recordDate;
      } else {
        break;
      }
    }

    // En uzun seri (basit hesaplama)
    let longestStreak = currentStreak;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const record of streakData.reverse()) {
      const recordDate = new Date(record.completed_date);
      
      if (prevDate) {
        const diffDays = Math.floor((recordDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = recordDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    res.json({
      totalCompleted: totalCompleted.count,
      currentStreak,
      longestStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'İstatistikler getirilemedi' });
  }
});

// Yıllık takvim verisi
app.get('/api/calendar/:year', (req, res) => {
  try {
    const year = req.params.year;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Her gün için tamamlanan alışkanlık sayısını getir
    const calendarData = db.prepare(`
      SELECT 
        completed_date,
        COUNT(*) as completed_count
      FROM completions
      WHERE completed_date >= ? AND completed_date <= ?
      GROUP BY completed_date
    `).all(startDate, endDate);

    // Toplam aktif alışkanlık sayısı
    const totalHabits = db.prepare(`
      SELECT COUNT(*) as count FROM habits WHERE archived = 0
    `).get() as { count: number };

    res.json({
      data: calendarData,
      totalHabits: totalHabits.count
    });
  } catch (error) {
    res.status(500).json({ error: 'Takvim verisi getirilemedi' });
  }
});

// ============ SETTINGS API ============

// Ayarları getir
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj: Record<string, string> = {};
    (settings as { key: string; value: string }[]).forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: 'Ayarlar getirilemedi' });
  }
});

// Ayar güncelle
app.put('/api/settings/:key', (req, res) => {
  try {
    const { value } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `).run(req.params.key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ayar güncellenemedi' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
