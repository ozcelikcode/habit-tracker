import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Repeat, CalendarDays, Clock, Timer, StickyNote, Save, Loader2, X, Bell, BellRing } from 'lucide-react';
import { getHabits, getCompletions, getStats, getCalendarData, completeHabit, uncompleteHabit, getSettings, getTodayNote, saveTodayNote, getNoteDates, getNoteByDate, getHabitProgress } from '../api';
import type { Habit, Completion, Stats, Settings, DailyNote } from '../types';
import { FREQUENCY_OPTIONS, WEEKDAYS } from '../types';
import ContributionCalendar from '../components/ContributionCalendar';
import { HABIT_ICON_MAP } from '../icons/habitIcons';
import { ensureServiceWorker, getNotificationStatus, requestNotificationPermission, showHabitNotification } from '../utils/notificationService';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCompleted: 0, currentStreak: 0, longestStreak: 0 });
  const [calendarData, setCalendarData] = useState<{ completed_date: string; completed_count: number; total_count?: number }[]>([]);
  const [totalHabits, setTotalHabits] = useState(0);
  const [settings, setSettings] = useState<Settings>({ username: 'Kullanıcı', theme: 'dark' });
  const [loading, setLoading] = useState(true);
  const [dailyNote, setDailyNote] = useState<DailyNote>({ note_date: '', content: '' });
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteDates, setNoteDates] = useState<string[]>([]);
  const [dailyProgress, setDailyProgress] = useState<Record<number, number>>({});
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    count: number;
    total: number;
    hasNote: boolean;
    noteContent: string;
    loading: boolean;
  } | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notifiedHabits, setNotifiedHabits] = useState<{ date: string; ids: number[] }>(() => {
    if (typeof window === 'undefined') {
      return { date: today, ids: [] };
    }
    try {
      const stored = localStorage.getItem('habit-notified');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.date === today && Array.isArray(parsed.ids)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Bildirim kaydı okunamadı:', error);
    }
    return { date: today, ids: [] };
  });

  const formatDateTR = (dateStr: string) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}sa ${m}dk`;
    if (h > 0) return `${h}sa`;
    return `${m}dk`;
  };

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || frequency;
  };

  const getCustomDaysLabel = (customDays: string | null) => {
    if (!customDays) return '';
    try {
      const days: number[] = JSON.parse(customDays);
      return days.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).filter(Boolean).join(', ');
    } catch {
      return '';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setNotificationStatus(getNotificationStatus());
    ensureServiceWorker();
  }, []);

  useEffect(() => {
    if (notifiedHabits.date !== today) {
      setNotifiedHabits({ date: today, ids: [] });
    }
  }, [today, notifiedHabits.date]);

  async function loadData() {
    try {
      // Her bir isteği ayrı ayrı catch bloğu ile sarmalayarak birinin hatasının diğerlerini etkilemesini engelliyoruz
      const [habitsData, completionsData, statsData, calendarRes, settingsData, noteData, noteDatesData, progressData] = await Promise.all([
        getHabits().catch(e => {
          console.error('Alışkanlıklar yüklenemedi:', e);
          return [];
        }),
        getCompletions({ start_date: today, end_date: today }).catch(e => {
          console.error('Tamamlamalar yüklenemedi:', e);
          return [];
        }),
        getStats().catch(e => {
          console.error('İstatistikler yüklenemedi:', e);
          return { totalCompleted: 0, currentStreak: 0, longestStreak: 0 };
        }),
        getCalendarData(currentYear).catch(e => {
          console.error('Takvim verisi yüklenemedi:', e);
          return { data: [], totalHabits: 0 };
        }),
        getSettings().catch(e => {
          console.error('Ayarlar yüklenemedi:', e);
          return { username: 'Kullanıcı', theme: 'dark' as 'dark' | 'light' };
        }),
        getTodayNote().catch(e => {
          console.error('Not yüklenemedi:', e);
          return { note_date: today, content: '' };
        }),
        getNoteDates(currentYear).catch(e => {
          console.error('Not tarihleri yüklenemedi:', e);
          return [];
        }),
        getHabitProgress(today).catch(e => {
          console.error('İlerleme yüklenemedi:', e);
          return [];
        }),
      ]);

      setHabits(habitsData);
      setCompletions(completionsData);
      setStats(statsData);
      setCalendarData(calendarRes.data);
      setTotalHabits(calendarRes.totalHabits);
      setSettings(settingsData);
      setDailyNote(noteData);
      setNoteDates(noteDatesData.map((n: any) => n.note_date));
      
      const progressMap: Record<number, number> = {};
      progressData.forEach((p: any) => {
        progressMap[p.habit_id] = p.remaining_minutes;
      });
      setDailyProgress(progressMap);
    } catch (error) {
      console.error('Genel veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }

  // Alışkanlığın bugün gösterilip gösterilmeyeceğini belirle
  const shouldShowHabit = (habit: Habit) => {
    const todayDay = new Date().getDay(); // 0 = Pazar, 1 = Pazartesi, ...
    
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekdays') return todayDay !== 0 && todayDay !== 6;
    if (habit.frequency === 'custom' && habit.custom_days) {
      try {
        const days = JSON.parse(habit.custom_days);
        return Array.isArray(days) && days.includes(todayDay);
      } catch {
        return false;
      }
    }
    return false;
  };

  const todaysHabits = habits.filter(shouldShowHabit);
  const completedHabitIds = useMemo(() => new Set(completions.map((c) => c.habit_id)), [completions]);

  const persistNotifiedState = (next: { date: string; ids: number[] }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habit-notified', JSON.stringify(next));
    }
  };

  async function handleEnableNotifications() {
    try {
      setNotificationLoading(true);
      const permission = await requestNotificationPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        await ensureServiceWorker();
      }
    } finally {
      setNotificationLoading(false);
    }
  }

  useEffect(() => {
    if (notificationStatus !== 'granted') return;

    const toleranceMinutes = 5; // saate girdikten sonra 5 dk icinde hatirlat

    const checkAndNotify = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      todaysHabits.forEach((habit) => {
        if (!habit.scheduled_time) return;
        if (notifiedHabits.date === today && notifiedHabits.ids.includes(habit.id)) return;
        if (completedHabitIds.has(habit.id)) return;

        const [h, m] = habit.scheduled_time.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return;
        const habitMinutes = h * 60 + m;
        const diff = nowMinutes - habitMinutes;

        if (diff < 0 || diff > toleranceMinutes) return;

        const durationText = habit.duration_minutes ? ` (~${formatDuration(habit.duration_minutes)})` : '';
        showHabitNotification('Hatırlatma', {
          body: `${habit.title} için planlanan saat geldi${durationText}.`,
          tag: `habit-${habit.id}-${today}`,
          icon: '/vite.svg',
          badge: '/vite.svg',
        });

        setNotifiedHabits((prev) => {
          const next = prev.date === today
            ? { ...prev, ids: [...prev.ids, habit.id] }
            : { date: today, ids: [habit.id] };
          persistNotifiedState(next);
          return next;
        });
      });
    };

    const interval = window.setInterval(checkAndNotify, 60 * 1000);
    checkAndNotify();

    return () => clearInterval(interval);
  }, [notificationStatus, todaysHabits, completedHabitIds, notifiedHabits, today]);

  async function handleDayClick(info: { date: string; count: number; total: number; hasNote: boolean }) {
    const { date, count, total, hasNote } = info;

    // İlk anda paneli göster
    setSelectedDay({
      date,
      count,
      total,
      hasNote,
      noteContent: '',
      loading: true,
    });

    try {
      const note = await getNoteByDate(date);
      setSelectedDay((prev) => {
        if (!prev || prev.date !== date) return prev;
        const content = (note?.content || '').trim();
        return {
          ...prev,
          hasNote: !!content,
          noteContent: content,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Gün notu yüklenemedi:', error);
      setSelectedDay((prev) => (prev && prev.date === date ? { ...prev, loading: false } : prev));
    }
  }

  async function handleSaveNote() {
    if (noteSaving) return;
    setNoteSaving(true);
    setNoteSaved(false);
    
    try {
      await saveTodayNote(dailyNote.content);
      setNoteSaved(true);
      // Not tarihlerini güncelle
      const newNoteDates = await getNoteDates(currentYear);
      setNoteDates(newNoteDates.map(n => n.note_date));
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    } finally {
      setNoteSaving(false);
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
          <p className="text-[var(--color-primary)] dark:text-[color-mix(in_srgb,var(--color-primary)_70%,white)] text-base font-normal leading-normal">
            Alışkanlık takviminize hoş geldiniz.
          </p>
        </div>
        <Link
          to="/habits/new"
          className="flex items-center gap-2 bg-primary text-white dark:text-background-dark font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Yeni Alışkanlık Ekle
        </Link>
      </div>

      {/* Notification CTA */}
      {notificationStatus === 'default' && (
        <div className="px-4">
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-border-light dark:border-[#32675a] bg-white/80 dark:bg-white/5 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-white font-semibold text-sm">Hatirlatma bildirimleri</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1">
                Planlanan saatlerde cihaz bildirimi gönderebilmemiz için tarayıcı izni vermelisin.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white dark:text-background-dark hover:opacity-90 disabled:opacity-60"
              >
                <BellRing size={16} />
                {notificationLoading ? 'İzin isteniyor...' : 'Bildirimi aç'}
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationStatus === 'unsupported' && (
        <div className="px-4">
          <div className="mb-4 rounded-xl border border-border-light dark:border-[#32675a] bg-white/70 dark:bg-white/5 p-4 text-sm text-gray-600 dark:text-white/60">
            Tarayıcınız bildirimleri desteklemiyor, ancak hatırlatmalar uygulama içinde gösterilecek.
          </div>
        </div>
      )}

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
          <ContributionCalendar
            data={calendarData}
            totalHabits={totalHabits}
            year={currentYear}
            noteDates={noteDates}
            onDayClick={handleDayClick}
          />

          {/* Seçili Gün Bilgisi */}
          {selectedDay && (
            <div className="mt-4 mx-4 mb-2 rounded-xl border border-border-light dark:border-[#32675a] bg-white/90 dark:bg-black/40 p-4 max-w-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/40">
                    Seçili Gün
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                    {formatDateTR(selectedDay.date)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1">
                    {selectedDay.count}/{selectedDay.total} görev tamamlandı
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white rounded-full p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-white/70">
                <StickyNote size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
                {selectedDay.loading ? (
                  <span>Not yükleniyor...</span>
                ) : selectedDay.hasNote && selectedDay.noteContent ? (
                  <p className="whitespace-pre-wrap break-words">{selectedDay.noteContent}</p>
                ) : (
                  <span>Bu gün için kayıtlı bir not bulunmuyor.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 mt-5 lg:mt-0">
          {/* Stats */}
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-800 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 lg:pt-0">
              İstatistikler
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a]">
                <p className="text-gray-600 dark:text-white/70 text-base font-medium leading-normal">Mevcut Seri</p>
                <p className="text-gray-800 dark:text-white tracking-light text-3xl font-bold leading-tight">{stats.currentStreak} gün</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a]">
                <p className="text-gray-600 dark:text-white/70 text-base font-medium leading-normal">En Uzun Seri</p>
                <p className="text-gray-800 dark:text-white tracking-light text-3xl font-bold leading-tight">{stats.longestStreak} gün</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a]">
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
            <div className="flex flex-col gap-3 p-4 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] rounded-xl">
              {todaysHabits.length === 0 ? (
                <div className="text-center py-8">
                  {habits.length === 0 ? (
                    <p className="text-gray-500 dark:text-white/50">
                      Henüz alışkanlık eklemediniz.{' '}
                      <Link to="/habits/new" className="text-primary hover:underline">
                        Yeni ekle
                      </Link>
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-white/50">
                      Bugün için planlanmış görev bulunmuyor.
                    </p>
                  )}
                </div>
              ) : (
                todaysHabits.map((habit) => {
                  const isCompleted = completedHabitIds.has(habit.id);
                  const remaining = dailyProgress[habit.id] !== undefined ? dailyProgress[habit.id] : (habit.duration_minutes || 0);

                  return (
                    <div
                      key={habit.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isCompleted 
                          ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#32675a]/50' 
                          : 'border-gray-200 dark:border-[#32675a] hover:border-primary/30'
                      }`}
                      style={!isCompleted ? {
                        backgroundColor: `color-mix(in srgb, ${habit.color} 5%, transparent)`,
                        borderColor: `color-mix(in srgb, ${habit.color} 20%, transparent)`
                      } : undefined}
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
                          {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 dark:bg-black/40 text-gray-800 dark:text-white">
                              {(() => {
                                const IconComp = HABIT_ICON_MAP[habit.icon];
                                return <IconComp size={16} />;
                              })()}
                            </span>
                          )}
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

                        {/* Detay Bilgileri */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          {/* Frequency - Her zaman göster */}
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                            isCompleted 
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                              : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60'
                          }`}>
                            <Repeat size={14} />
                            {getFrequencyLabel(habit.frequency)}
                          </span>

                          {/* Custom Days */}
                          {habit.frequency === 'custom' && habit.custom_days && (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-accent-teal/10 text-accent-teal'
                            }`}>
                              <CalendarDays size={14} />
                              {getCustomDaysLabel(habit.custom_days)}
                            </span>
                          )}

                          {/* Scheduled Time */}
                          {habit.scheduled_time ? (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-primary/10 text-primary'
                            }`}
                            style={!isCompleted ? {
                                backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                                color: habit.color
                            } : undefined}
                            >
                              <Clock size={14} />
                              {habit.scheduled_time}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30">
                              <Clock size={14} />
                              Saat yok
                            </span>
                          )}
                          
                          {/* Duration */}
                          {habit.duration_minutes ? (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-accent-orange/10 text-accent-orange'
                            }`}
                            style={!isCompleted ? {
                                backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                                color: habit.color
                            } : undefined}
                            >
                              <Timer size={14} />
                              {formatDuration(remaining)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30">
                              <Timer size={14} />
                              Süre yok
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Note */}
          <div className="mt-8">
            <h2 className="text-gray-800 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 flex items-center gap-2">
              <StickyNote size={22} className="text-primary" />
              Günün Notu
            </h2>
            <div className="p-4 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] rounded-xl">
              <textarea
                value={dailyNote.content}
                onChange={(e) => setDailyNote({ ...dailyNote, content: e.target.value })}
                placeholder="Bugün için notlarınızı buraya yazın..."
                className="w-full h-32 px-4 py-3 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-gray-400 dark:text-white/30 text-xs">
                  Sadece bugün için not ekleyebilirsiniz
                </p>
                <button
                  onClick={handleSaveNote}
                  disabled={noteSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    noteSaved
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                      : 'bg-primary text-white dark:text-background-dark hover:opacity-90'
                  } disabled:opacity-50`}
                >
                  {noteSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : noteSaved ? (
                    <>
                      <Save size={16} />
                      Kaydedildi!
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
