import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Repeat, Clock, Timer, StickyNote, Save, Loader2, X, Bell, BellRing } from 'lucide-react';
import { getHabits, getCompletions, getStats, getCalendarData, completeHabit, uncompleteHabit, getSettings, getTodayNote, saveTodayNote, getNoteDates, getNoteByDate, getHabitProgress } from '../api';
import type { Habit, Completion, Stats, Settings, DailyNote } from '../types';
import { FREQUENCY_OPTIONS } from '../types';
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
    <div className="max-w-7xl mx-auto w-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-gray-800 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
            Merhaba, {settings.username}!
          </p>
          <p className="text-[var(--color-primary)] dark:text-[color-mix(in_srgb,var(--color-primary)_70%,white)] text-base font-normal leading-normal">
            Alışkanlık takviminize hoş geldiniz.
          </p>
        </div>
        <Link
          to="/habits/new"
          className="flex items-center justify-center gap-2 bg-primary text-white dark:text-background-dark font-bold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={20} />
          Yeni Alışkanlık Ekle
        </Link>
      </div>

      {/* Notification CTA */}
      {notificationStatus === 'default' && (
        <div className="px-4 sm:px-6">
          <div className="mb-6 flex items-start gap-4 rounded-2xl border border-border-light dark:border-[#32675a] bg-white/80 dark:bg-white/5 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-semibold text-sm">Hatırlatma bildirimleri</p>
              <p className="text-sm text-gray-600 dark:text-white/60 mt-1 leading-relaxed">
                Planlanan saatlerde cihaz bildirimi gönderebilmemiz için tarayıcı izni vermelisin.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white dark:text-background-dark hover:opacity-90 disabled:opacity-60 transition-colors"
              >
                <BellRing size={16} />
                {notificationLoading ? 'İzin isteniyor...' : 'Bildirimi aç'}
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationStatus === 'unsupported' && (
        <div className="px-4 sm:px-6">
          <div className="mb-6 rounded-xl border border-border-light dark:border-[#32675a] bg-white/70 dark:bg-white/5 p-4 text-sm text-gray-600 dark:text-white/60">
            Tarayıcınız bildirimleri desteklemiyor, ancak hatırlatmalar uygulama içinde gösterilecek.
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-6 mb-6">
        <div className="flex flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] shadow-sm">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">Mevcut Seri</p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{stats.currentStreak} <span className="text-base font-normal text-gray-400">gün</span></p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] shadow-sm">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">En Uzun Seri</p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{stats.longestStreak} <span className="text-base font-normal text-gray-400">gün</span></p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] shadow-sm">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">Toplam Tamamlanan</p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{stats.totalCompleted}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 pt-0">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 p-6 shadow-sm">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-tight mb-2">
              {currentYear} Yılındaki Katkıların
            </h2>
            <p className="text-gray-500 dark:text-white/60 text-sm font-normal leading-relaxed mb-6">
              Bu takvim, son bir yıldaki alışkanlık tamamlama ilerlemenizi gösterir. Renk tonları, o günkü tamamlama oranını temsil eder.
            </p>
            <ContributionCalendar
              data={calendarData}
              totalHabits={totalHabits}
              year={currentYear}
              noteDates={noteDates}
              onDayClick={handleDayClick}
            />
          </div>

          {/* Seçili Gün Bilgisi */}
          {selectedDay && (
            <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/40">
                    Seçili Gün
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
                    {formatDateTR(selectedDay.date)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                    {selectedDay.count}/{selectedDay.total} görev tamamlandı
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-start gap-3 text-sm text-gray-700 dark:text-white/70">
                <StickyNote size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
                {selectedDay.loading ? (
                  <span className="italic text-gray-400">Not yükleniyor...</span>
                ) : selectedDay.hasNote && selectedDay.noteContent ? (
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{selectedDay.noteContent}</p>
                ) : (
                  <span className="text-gray-400 dark:text-white/40 italic">Bu gün için kayıtlı bir not bulunmuyor.</span>
                )}
              </div>
            </div>
          )}

          {/* Daily Note */}
          <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
              <StickyNote size={20} className="text-primary" />
              <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
                Günün Notu
              </h2>
            </div>
            <div className="p-4">
              <textarea
                value={dailyNote.content}
                onChange={(e) => setDailyNote({ ...dailyNote, content: e.target.value })}
                placeholder="Bugün için notlarınızı buraya yazın..."
                className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm leading-relaxed transition-all"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-gray-400 dark:text-white/30 text-xs">
                  Sadece bugün için
                </p>
                <button
                  onClick={handleSaveNote}
                  disabled={noteSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    noteSaved
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                      : 'bg-primary text-white dark:text-background-dark hover:opacity-90 shadow-sm hover:shadow'
                  } disabled:opacity-50 disabled:shadow-none`}
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

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Tasks */}
          <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
                Bugünün Görevleri
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {todaysHabits.length === 0 ? (
                <div className="text-center py-8 px-4">
                  {habits.length === 0 ? (
                    <p className="text-gray-500 dark:text-white/50 text-sm">
                      Henüz alışkanlık eklemediniz.{' '}
                      <Link to="/habits/new" className="text-primary hover:underline font-medium">
                        Yeni ekle
                      </Link>
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-white/50 text-sm">
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
                      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#32675a]/50 opacity-75' 
                          : 'bg-white dark:bg-transparent border-gray-200 dark:border-[#32675a] hover:border-primary/40 hover:shadow-sm'
                      }`}
                      style={!isCompleted ? {
                        borderColor: `color-mix(in srgb, ${habit.color} 30%, transparent)`
                      } : undefined}
                    >
                      {/* Checkbox */}
                      <label className="relative flex items-center justify-center cursor-pointer mt-0.5 size-6 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleHabit(habit.id)}
                          className="peer appearance-none size-5 rounded-md border-2 border-gray-300 dark:border-white/30 checked:bg-current checked:border-current transition-all cursor-pointer"
                          style={{ color: habit.color }}
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      </label>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                            <span className={`inline-flex items-center justify-center size-6 rounded-lg text-gray-700 dark:text-white ${isCompleted ? 'bg-gray-200 dark:bg-white/10' : 'bg-gray-100 dark:bg-white/10'}`}>
                              {(() => {
                                const IconComp = HABIT_ICON_MAP[habit.icon];
                                return <IconComp size={14} />;
                              })()}
                            </span>
                          )}
                          <span
                            className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-gray-400 dark:text-white/40' : 'text-gray-800 dark:text-white'}`}
                          >
                            {habit.title}
                          </span>
                        </div>
                        
                        {habit.subtitle && (
                          <p className={`text-xs mb-2 truncate ${isCompleted ? 'text-gray-400 dark:text-white/30' : 'text-gray-500 dark:text-white/50'}`}>
                            {habit.subtitle}
                          </p>
                        )}

                        {/* Detay Bilgileri */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
                          {/* Frequency */}
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                            isCompleted 
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                              : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
                          }`}>
                            <Repeat size={10} />
                            {getFrequencyLabel(habit.frequency)}
                          </span>

                          {/* Scheduled Time */}
                          {habit.scheduled_time && (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-primary/10 text-primary'
                            }`}
                            style={!isCompleted ? {
                                backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                                color: habit.color
                            } : undefined}
                            >
                              <Clock size={10} />
                              {habit.scheduled_time}
                            </span>
                          )}
                          
                          {/* Duration */}
                          {habit.duration_minutes && (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-accent-orange/10 text-accent-orange'
                            }`}
                            style={!isCompleted ? {
                                backgroundColor: `color-mix(in srgb, ${habit.color} 10%, transparent)`,
                                color: habit.color
                            } : undefined}
                            >
                              <Timer size={10} />
                              {formatDuration(remaining)}
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
        </div>
      </div>
    </div>
  );
}
