import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Repeat, CalendarDays, Clock, Timer, ClipboardList } from 'lucide-react';
import { getHabits, deleteHabit } from '../api';
import type { Habit } from '../types';
import { FREQUENCY_OPTIONS, WEEKDAYS } from '../types';

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (error) {
      console.error('Alışkanlıklar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Bu alışkanlığı silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Alışkanlık silinirken hata:', error);
    }
  }

  function getFrequencyLabel(frequency: string) {
    return FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || frequency;
  }

  function getCustomDaysLabel(customDays: string | null) {
    if (!customDays) return '';
    try {
      const days: number[] = JSON.parse(customDays);
      return days.map(d => WEEKDAYS.find(w => w.value === d)?.label).filter(Boolean).join(', ');
    } catch {
      return '';
    }
  }

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}sa ${m}dk`;
    if (h > 0) return `${h}sa`;
    return `${m}dk`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-end mb-8">
        <div>
          <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Alışkanlıklarım</h1>
          <p className="text-gray-600 dark:text-white/60 mt-2">Tüm alışkanlıklarınızı buradan yönetin.</p>
        </div>
        <Link
          to="/habits/new"
          className="flex items-center gap-2 bg-primary text-white dark:text-background-dark font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Yeni Alışkanlık
        </Link>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-16 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <ClipboardList size={64} className="text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/50 text-lg">Henüz alışkanlık eklemediniz.</p>
          <Link
            to="/habits/new"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <Plus size={18} />
            İlk alışkanlığınızı ekleyin
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <div className="flex gap-2">
                  <Link
                    to={`/habits/${habit.id}/edit`}
                    className="p-2 text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pencil size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-500 dark:text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-1">{habit.title}</h3>
              {habit.subtitle && <p className="text-gray-500 dark:text-white/50 text-sm mb-2">{habit.subtitle}</p>}

              {/* Detay Bilgileri */}
              <div className="flex flex-wrap items-center gap-2 text-sm mt-3">
                {/* Frequency - Her zaman göster */}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60">
                  <Repeat size={16} />
                  {getFrequencyLabel(habit.frequency)}
                </span>
                
                {/* Custom Days */}
                {habit.frequency === 'custom' && habit.custom_days && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-teal/10 text-accent-teal">
                    <CalendarDays size={16} />
                    {getCustomDaysLabel(habit.custom_days)}
                  </span>
                )}

                {/* Scheduled Time */}
                {habit.scheduled_time ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                    <Clock size={16} />
                    {habit.scheduled_time}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30">
                    <Clock size={16} />
                    Saat yok
                  </span>
                )}
                
                {/* Duration */}
                {habit.duration_minutes ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-orange/10 text-accent-orange font-medium">
                    <Timer size={16} />
                    {formatDuration(habit.duration_minutes)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30">
                    <Timer size={16} />
                    Süre yok
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
