import { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle, Timer } from 'lucide-react';
import { getCompletions, completeHabit, uncompleteHabit } from '../api';
import type { Habit, Completion } from '../types';
import { HABIT_ICON_MAP } from '../icons/habitIcons';
import { usePomodoro } from '../context/PomodoroContext';

export default function Pomodoro() {
  const { 
    timeLeft, isActive, selectedHabitId, initialTime, habits, dailyProgress,
    toggleTimer, resetTimer, setDuration, selectHabit, formatTime, loading: contextLoading,
    totalWorkedSeconds, progress
  } = usePomodoro();

  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const today = currentDate.toISOString().split('T')[0];

  // Circle configuration
  const size = 280;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    loadCompletions();
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  async function loadCompletions() {
    try {
      const data = await getCompletions({ start_date: today, end_date: today });
      setCompletions(data);
    } catch (error) {
      console.error('Tamamlamalar yüklenemedi:', error);
    } finally {
      setLoadingCompletions(false);
    }
  }

  const handleTimerClick = () => {
    if (isActive) return;
    setEditValue(Math.floor(timeLeft / 60).toString());
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    const minutes = parseInt(editValue, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      setDuration(minutes);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const formatTotalDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
  };

  const getRemainingTime = (habitId: number) => {
    if (dailyProgress[habitId] !== undefined) {
      return dailyProgress[habitId];
    }
    const habit = habits.find(h => h.id === habitId);
    return habit?.duration_minutes || 0;
  };

  const shouldShowHabit = (habit: Habit) => {
    const todayDay = new Date().getDay();
    
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

  const todaysTasks = habits
    .filter(h => shouldShowHabit(h) && h.scheduled_time)
    .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

  const completedHabitIds = useMemo(() => new Set(completions.map((c) => c.habit_id)), [completions]);

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
    } catch (error) {
      console.error('Alışkanlık güncellenirken hata:', error);
    }
  }

  const loading = contextLoading || loadingCompletions;

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      {/* Header Section - Home sayfasıyla uyumlu */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-gray-800 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
            Pomodoro Odak
          </h1>
          <div className="flex items-center gap-2 text-[var(--color-primary)] dark:text-[color-mix(in_srgb,var(--color-primary)_70%,white)] text-base font-normal leading-normal">
            <span className="font-medium">{dateStr}</span>
            <span className="size-1 rounded-full bg-current opacity-50"></span>
            <span>Odaklan ve üretkenliğini artır.</span>
          </div>
        </div>
      </div>

      {/* Stats Section - Home sayfasıyla uyumlu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-6 mb-6">
        <div className="flex flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] shadow-sm">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">Toplam Odak Süresi</p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{formatTotalDuration(totalWorkedSeconds)}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-white/5 border border-border-light dark:border-[#32675a] shadow-sm">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">Bugün Tamamlanan</p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{completions.length} <span className="text-base font-normal text-gray-400">görev</span></p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 pt-0">
        {/* Left Column: Timer */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 p-6 sm:p-8 shadow-sm">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-tight mb-2">
              Zamanlayıcı
            </h2>
            <p className="text-gray-500 dark:text-white/60 text-sm font-normal leading-relaxed mb-8">
              Süreye tıklayarak değiştirebilir veya aşağıdaki hazır sürelerden birini seçebilirsiniz.
            </p>

            <div className="flex flex-col items-center">
              {/* Circular Timer */}
              <div className="relative mb-8">
                <svg width={size} height={size} className="transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-100 dark:text-white/5"
                  />
                  {/* Progress */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="var(--color-primary)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="relative group">
                    {isEditing ? (
                      <div className="flex items-center justify-center">
                        <input
                          ref={inputRef}
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleEditSubmit}
                          onKeyDown={handleKeyDown}
                          className="text-6xl font-black text-center bg-transparent border-b-4 border-[var(--color-primary)] text-gray-800 dark:text-white focus:outline-none w-40"
                          placeholder="25"
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={handleTimerClick}
                        className="text-7xl font-black tracking-tighter text-gray-800 dark:text-white cursor-pointer select-none hover:scale-105 transition-transform"
                      >
                        {formatTime(timeLeft)}
                      </div>
                    )}
                  </div>

                  <p className={`mt-3 text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 dark:text-white/40'}`}>
                    {isActive ? 'Odaklanma modu' : !isEditing && 'Düzenlemek için tıkla'}
                  </p>
                </div>
              </div>

              {/* Selected Habit Info */}
              {selectedHabitId && (
                <div className="mb-6 px-4 py-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                  {habits.find(h => h.id === selectedHabitId)?.title} için çalışılıyor
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 ${
                    isActive 
                      ? 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10' 
                      : 'bg-primary text-white dark:text-background-dark hover:opacity-90 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isActive ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current" />}
                  {isActive ? 'Duraklat' : 'Başlat'}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-white/10"
                  title="Sıfırla"
                >
                  <RotateCcw size={22} />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap justify-center gap-2">
                {[15, 25, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      initialTime === mins * 60
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {mins} dk
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Tasks */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-border-light dark:border-[#32675a] bg-white dark:bg-white/5 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
                Zamanlı Görevler
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-white/50">Yükleniyor...</div>
              ) : todaysTasks.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-white/30">
                    <Clock size={28} />
                  </div>
                  <p className="text-gray-500 dark:text-white/50 text-sm">
                    Bugün için zamanlı görev yok.
                  </p>
                </div>
              ) : (
                todaysTasks.map((habit) => {
                  const isCompleted = completedHabitIds.has(habit.id);
                  const isSelected = selectedHabitId === habit.id;
                  const remaining = getRemainingTime(habit.id);
                  const totalDuration = habit.duration_minutes || 0;
                  const completed = Math.max(0, totalDuration - remaining);
                  const progressPercent = totalDuration > 0 ? (completed / totalDuration) * 100 : 0;
                  
                  return (
                    <div
                      key={habit.id}
                      onClick={() => selectHabit(habit.id)}
                      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30'
                          : isCompleted 
                            ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#32675a]/50 opacity-75' 
                            : 'bg-white dark:bg-transparent border-gray-200 dark:border-[#32675a] hover:border-[var(--color-primary)]/40 hover:shadow-sm'
                      }`}
                      style={isSelected ? {
                        borderColor: `color-mix(in srgb, var(--color-primary) 30%, transparent)`
                      } : undefined}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHabit(habit.id);
                        }}
                        className={`flex-shrink-0 mt-0.5 transition-colors ${
                          isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-white/20 group-hover:text-[var(--color-primary)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={20} className="fill-current" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                            <span className={`inline-flex items-center justify-center size-5 rounded text-gray-700 dark:text-white ${isCompleted ? 'bg-gray-200 dark:bg-white/10' : 'bg-gray-100 dark:bg-white/10'}`}>
                              {(() => {
                                const IconComp = HABIT_ICON_MAP[habit.icon];
                                return <IconComp size={12} />;
                              })()}
                            </span>
                          )}
                          <span className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-gray-400 dark:text-white/40' : 'text-gray-800 dark:text-white'}`}>
                            {habit.title}
                          </span>
                        </div>
                        
                        {/* Detay Bilgileri */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                            isCompleted 
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                              : isSelected
                                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
                          }`}>
                            <Clock size={10} />
                            {habit.scheduled_time}
                          </span>
                          
                          {habit.duration_minutes && (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                              isCompleted 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30' 
                                : 'bg-accent-orange/10 text-accent-orange'
                            }`}>
                              <Timer size={10} />
                              {remaining}dk kaldı
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {habit.duration_minutes !== null && totalDuration > 0 && (
                          <div className="mt-2">
                            <div className="h-1 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                                style={{ width: `${Math.min(100, progressPercent)}%` }}
                              />
                            </div>
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
    </div>
  );
}