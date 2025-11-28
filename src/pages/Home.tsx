import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHabits, getCompletions, getStats, getCalendarData, completeHabit, uncompleteHabit, getSettings } from '../api';
import type { Habit, Completion, Stats, Settings } from '../types';
import ContributionCalendar from '../components/ContributionCalendar';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCompleted: 0, currentStreak: 0, longestStreak: 0 });
  const [calendarData, setCalendarData] = useState<{ completed_date: string; completed_count: number }[]>([]);
  const [totalHabits, setTotalHabits] = useState(0);
  const [settings, setSettings] = useState<Settings>({ username: 'Kullanıcı', theme: 'dark' });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [habitsData, completionsData, statsData, calendarRes, settingsData] = await Promise.all([
        getHabits(),
        getCompletions({ start_date: today, end_date: today }),
        getStats(),
        getCalendarData(currentYear),
        getSettings(),
      ]);

      setHabits(habitsData);
      setCompletions(completionsData);
      setStats(statsData);
      setCalendarData(calendarRes.data);
      setTotalHabits(calendarRes.totalHabits);
      setSettings(settingsData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabit(habitId: number) {
    const isCompleted = completions.some((c) => c.habit_id === habitId);

    try {
      if (isCompleted) {
        await uncompleteHabit(habitId, today);
        setCompletions((prev) => prev.filter((c) => c.habit_id !== habitId));
      } else {
        await completeHabit(habitId, today);
        setCompletions((prev) => [...prev, { id: 0, habit_id: habitId, completed_date: today, created_at: '' }]);
      }
      // İstatistikleri ve takvimi güncelle
      const [newStats, newCalendar] = await Promise.all([
        getStats(),
        getCalendarData(currentYear)
      ]);
      setStats(newStats);
      setCalendarData(newCalendar.data);
    } catch (error) {
      console.error('Alışkanlık güncellenirken hata:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-wrap justify-between gap-4 p-4 items-end">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-gray-800 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Merhaba, {settings.username}!
          </p>
          <p className="text-emerald-600 dark:text-[#92c9bb] text-base font-normal leading-normal">
            Alışkanlık takviminize hoş geldiniz.
          </p>
        </div>
        <Link
          to="/habits/new"
          className="flex items-center gap-2 bg-primary text-white dark:text-background-dark font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
          Yeni Alışkanlık Ekle
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6 p-4">
        {/* Calendar Section */}
        <div className="flex-1 lg:w-2/3">
          <h2 className="text-gray-800 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            {currentYear} Yılındaki Katkıların
          </h2>
          <p className="text-gray-600 dark:text-white/60 text-base font-normal leading-normal pb-6 pt-1 px-4">
            Bu takvim, son bir yıldaki alışkanlık tamamlama ilerlemenizi gösterir. Renk tonları, o günkü tamamlama
            oranını temsil eder.
          </p>
          <ContributionCalendar data={calendarData} totalHabits={totalHabits} year={currentYear} />
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 mt-5 lg:mt-0">
          {/* Stats */}
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-800 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 lg:pt-0">
              İstatistikler
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a]">
                <p className="text-gray-600 dark:text-white/70 text-base font-medium leading-normal">Mevcut Seri</p>
                <p className="text-gray-800 dark:text-white tracking-light text-3xl font-bold leading-tight">{stats.currentStreak} gün</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a]">
                <p className="text-gray-600 dark:text-white/70 text-base font-medium leading-normal">En Uzun Seri</p>
                <p className="text-gray-800 dark:text-white tracking-light text-3xl font-bold leading-tight">{stats.longestStreak} gün</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a]">
                <p className="text-gray-600 dark:text-white/70 text-base font-medium leading-normal">Toplam Tamamlanan</p>
                <p className="text-gray-800 dark:text-white tracking-light text-3xl font-bold leading-tight">{stats.totalCompleted}</p>
              </div>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="mt-8">
            <h2 className="text-gray-800 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Bugünün Görevleri
            </h2>
            <div className="flex flex-col gap-3 p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
              {habits.length === 0 ? (
                <p className="text-gray-500 dark:text-white/50 text-center py-4">
                  Henüz alışkanlık eklemediniz.{' '}
                  <Link to="/habits/new" className="text-primary hover:underline">
                    Yeni ekle
                  </Link>
                </p>
              ) : (
                habits.map((habit) => {
                  const isCompleted = completions.some((c) => c.habit_id === habit.id);
                  const formatDuration = (mins: number) => {
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    return h > 0 ? `${h}sa ${m > 0 ? m + 'dk' : ''}` : `${m}dk`;
                  };
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isCompleted 
                          ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#32675a]/50' 
                          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-[#32675a] hover:border-primary/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <label className="flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleHabit(habit.id)}
                          className="size-5 bg-transparent border-2 border-gray-400 dark:border-white/30 rounded text-primary focus:ring-primary cursor-pointer"
                          style={{ accentColor: habit.color }}
                        />
                      </label>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${isCompleted ? 'line-through text-gray-400 dark:text-white/40' : 'text-gray-800 dark:text-white'}`}
                          >
                            {habit.title}
                          </span>
                          <div
                            className="size-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color }}
                          />
                        </div>
                        
                        {habit.subtitle && (
                          <p className={`text-sm mt-0.5 ${isCompleted ? 'text-gray-400 dark:text-white/30' : 'text-gray-500 dark:text-white/50'}`}>
                            {habit.subtitle}
                          </p>
                        )}

                        {/* Time & Duration */}
                        {(habit.scheduled_time || habit.duration_minutes) && (
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            {habit.scheduled_time && (
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                isCompleted 
                                  ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                                {habit.scheduled_time}
                              </span>
                            )}
                            {habit.duration_minutes && (
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                isCompleted 
                                  ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                  : 'bg-accent-orange/10 text-accent-orange'
                              }`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                                {formatDuration(habit.duration_minutes)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
