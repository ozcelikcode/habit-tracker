import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHabits, deleteHabit } from '../api';
import type { Habit } from '../types';
import { FREQUENCY_OPTIONS } from '../types';

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
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
          Yeni Alışkanlık
        </Link>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-16 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <span className="material-symbols-outlined text-gray-400 dark:text-white/30 text-6xl mb-4">checklist</span>
          <p className="text-gray-500 dark:text-white/50 text-lg">Henüz alışkanlık eklemediniz.</p>
          <Link
            to="/habits/new"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add
            </span>
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
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      edit
                    </span>
                  </Link>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-500 dark:text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      delete
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-1">{habit.title}</h3>
              {habit.subtitle && <p className="text-gray-500 dark:text-white/50 text-sm mb-3">{habit.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-2 text-sm mt-3">
                {/* Frequency */}
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event_repeat</span>
                  {getFrequencyLabel(habit.frequency)}
                </span>
                
                {/* Scheduled Time */}
                {habit.scheduled_time && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    {habit.scheduled_time}
                  </span>
                )}
                
                {/* Duration */}
                {habit.duration_minutes && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                    {habit.duration_minutes >= 60 
                      ? `${Math.floor(habit.duration_minutes / 60)}sa ${habit.duration_minutes % 60 > 0 ? (habit.duration_minutes % 60) + 'dk' : ''}`
                      : `${habit.duration_minutes}dk`
                    }
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
