import { usePomodoro } from '../context/PomodoroContext';
import { Play, Pause, X, Square } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { HABIT_ICON_MAP } from '../icons/habitIcons';

export default function PomodoroFooter() {
  const { isActive, timeLeft, toggleTimer, selectedHabitId, habits, resetTimer, formatTime, progress, selectHabit } = usePomodoro();
  const location = useLocation();

  // Don't show on Pomodoro page
  if (location.pathname === '/pomodoro') return null;

  // Only show if a habit is selected
  if (!selectedHabitId) return null;

  const activeHabit = habits.find(h => h.id === selectedHabitId);
  if (!activeHabit) return null;

  const handleClose = () => {
    resetTimer();
    selectHabit(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2c26] border-t border-gray-200 dark:border-[#32675a] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 transition-transform duration-300">
      {/* Progress Bar Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5">
        <div 
          className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Habit Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
             {activeHabit.icon && HABIT_ICON_MAP[activeHabit.icon] ? (
                (() => {
                  const IconComp = HABIT_ICON_MAP[activeHabit.icon];
                  return <IconComp size={20} />;
                })()
             ) : (
               <span className="font-bold text-lg">{activeHabit.title.charAt(0)}</span>
             )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 dark:text-white truncate text-sm sm:text-base">
              {activeHabit.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-white/50 truncate">
              {isActive ? 'Çalışılıyor...' : 'Duraklatıldı'}
            </p>
          </div>
        </div>

        {/* Center: Controls & Time */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <div className="text-xl sm:text-2xl font-mono font-bold text-gray-800 dark:text-white tabular-nums">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white dark:text-background-dark flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
            >
              {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <button
              onClick={resetTimer}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              title="Sıfırla"
            >
              <Square size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Right: Close (Cancel Session) */}
        <div className="flex-1 flex justify-end">
           <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white transition-colors"
              title="Kapat"
            >
              <X size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}
