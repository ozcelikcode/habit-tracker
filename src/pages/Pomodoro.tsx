import { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle, Timer, Edit2 } from 'lucide-react';
import { getCompletions, completeHabit, uncompleteHabit } from '../api';
import type { Habit, Completion } from '../types';
import { HABIT_ICON_MAP } from '../icons/habitIcons';
import { usePomodoro } from '../context/PomodoroContext';

export default function Pomodoro() {
  const { 
    timeLeft, isActive, selectedHabitId, initialTime, habits, dailyProgress,
    toggleTimer, resetTimer, setDuration, selectHabit, formatTime, loading: contextLoading,
    totalWorkedSeconds
  } = usePomodoro();

  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const today = currentDate.toISOString().split('T')[0];

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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-end mb-8">
        <div>
          <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Pomodoro Odak</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-white/60">
            <span className="text-sm font-medium">{dateStr}</span>
            <span className="size-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
            <span className="text-sm">Odaklan ve üretkenliğini artır.</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Timer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-[#32675a] shadow-sm min-h-[500px] relative overflow-hidden">
          
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
             <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Timer Display */}
          <div className="relative z-10 flex flex-col items-center mb-12">
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
                    className="text-8xl font-black text-center bg-transparent border-b-4 border-primary text-gray-800 dark:text-white focus:outline-none w-64"
                    placeholder="25"
                  />
                  <span className="text-2xl font-medium text-gray-400 ml-2">dk</span>
                </div>
              ) : (
                <div 
                  onClick={handleTimerClick}
                  className={`text-[10rem] leading-none font-black tabular-nums tracking-tighter transition-colors cursor-pointer select-none flex items-center justify-center ${
                    isActive ? 'text-primary' : 'text-gray-800 dark:text-white hover:text-primary/80'
                  }`}
                >
                  {formatTime(timeLeft)}
                  {!isActive && (
                    <Edit2 size={24} className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                  )}
                </div>
              )}
            </div>
            
            <p className={`text-lg font-medium mt-4 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 dark:text-white/50'}`}>
              {isActive ? 'Odaklanma Modu Aktif' : 'Başlamak için hazır mısın?'}
            </p>
            
            {selectedHabitId && (
              <div className="mt-4 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                {habits.find(h => h.id === selectedHabitId)?.title} için çalışılıyor
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-12 z-10">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl ${
                isActive 
                  ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-white/10' 
                  : 'bg-primary text-white dark:text-background-dark hover:opacity-90'
              }`}
            >
              {isActive ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current" />}
              {isActive ? 'Duraklat' : 'Başlat'}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors hover:text-gray-800 dark:hover:text-white"
              title="Sıfırla"
            >
              <RotateCcw size={28} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl z-10">
            {[15, 25, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                  initialTime === mins * 60
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {mins} dk
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="lg:w-1/3 flex flex-col h-full gap-6">
          {/* Total Worked Time Box */}
          <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-[#32675a] shadow-sm">
             <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <Timer className="text-[var(--color-primary)]" size={20} />
                Toplam Çalışılan Süre
             </h2>
             <p className="text-3xl font-black text-gray-800 dark:text-white tabular-nums">
                {formatTotalDuration(totalWorkedSeconds)}
             </p>
             <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
               Tüm oturumlarınızın toplamı
             </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-[#32675a] flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="text-[var(--color-primary)]" />
              Zamanlı Görevler
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : todaysTasks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-white/30">
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
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {todaysTasks.map((habit) => {
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
                      className={`group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10'
                          : isCompleted
                            ? 'bg-gray-100/50 dark:bg-white/5 border-transparent opacity-60'
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-[#32675a] hover:border-[var(--color-primary)]/50 shadow-sm'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHabit(habit.id);
                        }}
                        className={`flex-shrink-0 transition-colors ${
                          isCompleted ? 'text-[var(--color-primary)]' : 'text-gray-300 dark:text-white/20 group-hover:text-[var(--color-primary)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} className="fill-current" />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
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
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-gray-200 dark:bg-white/10 text-gray-500' 
                              : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          }`}>
                            {habit.scheduled_time}
                          </span>
                        </div>
                        
                        {habit.duration_minutes !== null && (
                          <div className="mt-3">
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
                                  className={`h-full transition-all duration-500 ${isCompleted ? 'bg-gray-400' : 'bg-[var(--color-primary)]'}`}
                                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                                />
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}