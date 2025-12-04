import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Repeat, CalendarDays, Clock, Timer, ClipboardList } from 'lucide-react';
import { getHabits, deleteHabit } from '../api';
import type { Habit } from '../types';
import { FREQUENCY_OPTIONS, WEEKDAYS } from '../types';
import { HABIT_ICON_MAP } from '../icons/habitIcons';

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

  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

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
          <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-white/60">
            <span className="text-sm font-medium">{dateStr}</span>
            <span className="size-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
            <span className="text-sm">Tüm alışkanlıklarınızı buradan yönetin.</span>
          </div>
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
        <div className="text-center py-16 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] rounded-xl">
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
              className="group relative p-5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                    <span 
                      className="inline-flex items-center justify-center size-12 rounded-2xl shadow-sm transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${habit.color} 15%, transparent)`,
                        color: habit.color
                      }}
                    >
                      {(() => {
                        const IconComp = HABIT_ICON_MAP[habit.icon];
                        return <IconComp size={24} />;
                      })()}
                    </span>
                  )}
                  <div>
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">{habit.title}</h3>
                    {habit.subtitle && <p className="text-gray-500 dark:text-white/60 text-sm mt-0.5 line-clamp-1">{habit.subtitle}</p>}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/habits/${habit.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-700 dark:text-white/30 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Detay Bilgileri */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium mt-2">
                {/* Frequency */}
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 border border-transparent dark:border-white/5">
                  <Repeat size={14} />
                  {getFrequencyLabel(habit.frequency)}
                </span>
                
                {/* Custom Days */}
                {habit.frequency === 'custom' && habit.custom_days && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 border border-transparent dark:border-white/5">
                    <CalendarDays size={14} />
                    {getCustomDaysLabel(habit.custom_days)}
                  </span>
                )}

                {/* Scheduled Time */}
                {habit.scheduled_time && (
                  <span 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                      color: habit.color
                    }}
                  >
                    <Clock size={14} />
                    {habit.scheduled_time}
                  </span>
                )}
                
                {/* Duration */}
                {habit.duration_minutes && (
                  <span 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                      color: habit.color
                    }}
                  >
                    <Timer size={14} />
                    {formatDuration(habit.duration_minutes)}
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
