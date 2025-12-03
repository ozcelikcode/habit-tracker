import { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle, Edit2, Brain, Target } from 'lucide-react';
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
  const size = 320;
  const strokeWidth = 12;
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
    if (isActive) return; // Don't edit while running
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
    if (h > 0) return `${h} sa ${m} dk`;
    return `${m} dk`;
  };

  const getRemainingTime = (habitId: number) => {
    if (dailyProgress[habitId] !== undefined) {
      return dailyProgress[habitId];
    }
    const habit = habits.find(h => h.id === habitId);
    return habit?.duration_minutes || 0;
  };

  // Task Filtering Logic
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
    .filter(h => shouldShowHabit(h) && h.scheduled_time) // Only show tasks with scheduled time
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Pomodoro Odak</h1>
        <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
          <span className="text-sm font-medium">{dateStr}</span>
          <span className="size-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
          <span className="text-sm">Odaklan ve üretkenliğini artır.</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-gray-200 dark:border-[#32675a] shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[600px]">
            
            {/* Background Decoration */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-3xl transition-opacity duration-1000 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-30'}`} />

            {/* Circular Timer */}
            <div className="relative z-10 mb-10">
              {/* SVG Circle */}
              <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
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
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-[var(--color-primary)] transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {/* Time Display */}
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
                        className="text-7xl font-black text-center bg-transparent border-b-4 border-[var(--color-primary)] text-gray-800 dark:text-white focus:outline-none w-48"
                        placeholder="25"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={handleTimerClick}
                      className="text-8xl font-black tracking-tighter text-gray-800 dark:text-white cursor-pointer select-none hover:scale-105 transition-transform flex flex-col items-center"
                    >
                      {formatTime(timeLeft)}
                      <span className="text-xs font-medium text-gray-400 dark:text-white/40 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <Edit2 size={12} /> Süreyi Düzenle
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Text */}
                <div className="mt-12 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-sm font-medium text-gray-600 dark:text-white/60 backdrop-blur-sm">
                  {isActive ? 'Odaklanılıyor...' : 'Hazır'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 z-10">
              <button
                onClick={toggleTimer}
                className={`h-16 px-10 rounded-2xl flex items-center gap-3 font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                  isActive 
                    ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-white/10' 
                    : 'bg-[var(--color-primary)] text-white dark:text-background-dark hover:opacity-90'
                }`}
              >
                {isActive ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                {isActive ? 'Duraklat' : 'Başlat'}
              </button>

              <button
                onClick={resetTimer}
                className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors hover:text-gray-800 dark:hover:text-white"
                title="Sıfırla"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 z-10">
              {[15, 25, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                    initialTime === mins * 60
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]'
                      : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]'
                  }`}
                >
                  {mins} dk
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tasks & Stats (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-[#32675a] shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-white/50 mb-2 text-sm font-medium">
                <Brain size={16} className="text-[var(--color-primary)]" />
                Toplam Odak
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                {formatTotalDuration(totalWorkedSeconds)}
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-[#32675a] shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-white/50 mb-2 text-sm font-medium">
                <Target size={16} className="text-green-500" />
                Tamamlanan
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                {completions.length} Görev
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-gray-200 dark:border-[#32675a] shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Clock className="text-[var(--color-primary)]" size={20} />
                Bugünün Planı
              </h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
                Zamanlı görevlerinizi buradan takip edin.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
              ) : todaysTasks.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-white/30">
                    <Clock size={32} />
                  </div>
                  <p className="text-gray-600 dark:text-white/60 font-medium">
                    Bugün için zamanlı bir görev bulunmuyor.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
                    Alışkanlık eklerken saat belirtirseniz burada görünür.
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
                      className={`group relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10'
                          : isCompleted
                            ? 'bg-gray-50 dark:bg-white/5 border-transparent opacity-60'
                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-[var(--color-primary)]/30 hover:shadow-md'
                      }`}
                    >
                      {/* Active Indicator Strip */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)]" />
                      )}

                      <div className="flex items-start gap-3">
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
                            <CheckCircle2 size={22} className="fill-current" />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                               {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                                  <span className="text-gray-400 dark:text-white/40">
                                    {(() => {
                                      const IconComp = HABIT_ICON_MAP[habit.icon];
                                      return <IconComp size={16} />;
                                    })()}
                                  </span>
                                )}
                                <span className={`font-semibold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                  {habit.title}
                                </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 font-mono ${
                              isCompleted 
                                ? 'bg-gray-200 dark:bg-white/10 text-gray-500' 
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
                            }`}>
                              {habit.scheduled_time}
                            </span>
                          </div>
                          
                          {habit.duration_minutes !== null && (
                            <div className="mt-2">
                               <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-gray-500 dark:text-white/50 font-medium">
                                    {completed} dk yapıldı
                                  </span>
                                  <span className={isSelected ? 'font-bold text-[var(--color-primary)]' : 'text-gray-500 dark:text-white/50'}>
                                    {remaining} dk kaldı
                                  </span>
                               </div>
                               <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                                  />
                               </div>
                            </div>
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