import { useEffect, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle } from 'lucide-react';
import { getHabits, getCompletions, completeHabit, uncompleteHabit } from '../api';
import type { Habit, Completion } from '../types';
import { HABIT_ICON_MAP } from '../icons/habitIcons';

export default function Pomodoro() {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [habitsData, completionsData] = await Promise.all([
        getHabits(),
        getCompletions({ start_date: today, end_date: today })
      ]);
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound or notification
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const setDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-8">Pomodoro Odak</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Timer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-[#32675a] shadow-sm min-h-[500px]">
          
          {/* Timer Display */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-8">
            {/* Circular Progress Background */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100 dark:text-white/5"
              />
              <circle
                cx="160"
                cy="160"
                r="150"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 150}
                strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
                className="text-[var(--color-primary)] transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center z-10">
              <div className="text-7xl font-bold text-gray-800 dark:text-white tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-500 dark:text-white/50 mt-2 font-medium">
                {isActive ? 'Odaklanma Zamanı' : 'Hazır mısın?'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white dark:text-background-dark rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {isActive ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              {isActive ? 'Duraklat' : 'Başlat'}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-4 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-2xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              title="Sıfırla"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-3">
            {[5, 10, 15, 20, 25].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  initialTime === mins * 60
                    ? 'bg-[var(--color-primary)] text-white dark:text-background-dark shadow-md'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {mins} dk
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="lg:w-1/3 flex flex-col h-full">
          <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-[#32675a] h-full">
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
                  
                  return (
                    <div
                      key={habit.id}
                      className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-gray-100/50 dark:bg-white/5 border-transparent opacity-60'
                          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-[#32675a] hover:border-[var(--color-primary)] shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex-shrink-0 transition-colors ${
                          isCompleted ? 'text-[var(--color-primary)]' : 'text-gray-300 dark:text-white/20 group-hover:text-[var(--color-primary)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} weight="fill" />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                            {habit.title}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            isCompleted 
                              ? 'bg-gray-200 dark:bg-white/10 text-gray-500' 
                              : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          }`}>
                            {habit.scheduled_time}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                          {habit.icon && HABIT_ICON_MAP[habit.icon] && (
                            <span className="flex items-center gap-1">
                              {(() => {
                                const IconComp = HABIT_ICON_MAP[habit.icon];
                                return <IconComp size={12} />;
                              })()}
                            </span>
                          )}
                          {habit.duration_minutes && (
                            <span>• {habit.duration_minutes} dk</span>
                          )}
                        </div>
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
