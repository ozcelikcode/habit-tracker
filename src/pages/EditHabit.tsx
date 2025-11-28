import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHabit, updateHabit } from '../api';
import { HABIT_COLORS, FREQUENCY_OPTIONS, WEEKDAYS } from '../types';

export default function EditHabit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0].value);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      loadHabit(parseInt(id));
    }
  }, [id]);

  async function loadHabit(habitId: number) {
    try {
      const habit = await getHabit(habitId);
      setTitle(habit.title);
      setSubtitle(habit.subtitle || '');
      setColor(habit.color);
      setFrequency(habit.frequency);
      if (habit.custom_days) {
        setCustomDays(JSON.parse(habit.custom_days));
      }
    } catch (err) {
      setError('Alışkanlık bulunamadı');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Başlık gerekli');
      return;
    }

    if (frequency === 'custom' && customDays.length === 0) {
      setError('En az bir gün seçmelisiniz');
      return;
    }

    setSaving(true);

    try {
      await updateHabit(parseInt(id!), {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        color,
        frequency,
        custom_days: frequency === 'custom' ? JSON.stringify(customDays) : undefined,
      });
      navigate('/habits');
    } catch (err) {
      setError('Alışkanlık güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: number) {
    setCustomDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Alışkanlığı Düzenle</h1>
        <p className="text-gray-600 dark:text-white/60 mt-2">Alışkanlık bilgilerini güncelleyin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Başlık *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Sabah 5'te uyan"
            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-[#32675a] rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Alt Başlık */}
        <div>
          <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Alt Başlık (Opsiyonel)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Örn: Daha üretken bir gün için"
            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-[#32675a] rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Renk Seçimi */}
        <div>
          <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Renk</label>
          <div className="flex gap-3 flex-wrap">
            {HABIT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`size-10 rounded-full transition-all ${
                  color === c.value ? 'ring-2 ring-gray-800 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-background-dark scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Tekrar Sıklığı */}
        <div>
          <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Tekrar Sıklığı</label>
          <div className="flex gap-3 flex-wrap">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequency(opt.value as typeof frequency)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  frequency === opt.value
                    ? 'bg-primary text-white dark:text-background-dark border-primary font-medium'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Özel Günler */}
        {frequency === 'custom' && (
          <div>
            <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Günleri Seçin</label>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    customDays.includes(day.value)
                      ? 'bg-primary text-white dark:text-background-dark border-primary font-medium'
                      : 'bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hata Mesajı */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>
        )}

        {/* Butonlar */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-[#32675a] rounded-lg text-gray-600 dark:text-white/70 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary text-white dark:text-background-dark rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
