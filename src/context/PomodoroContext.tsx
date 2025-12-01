import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { getHabits, updateHabitProgress, getHabitProgress } from '../api';
import type { Habit } from '../types';

interface PomodoroContextType {
  timeLeft: number;
  isActive: boolean;
  selectedHabitId: number | null;
  initialTime: number;
  habits: Habit[];
  dailyProgress: Record<number, number>;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
  selectHabit: (habitId: number | null) => void;
  formatTime: (seconds: number) => string;
  progress: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  updateDailyProgress: (habitId: number, minutes: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  
  // Session Tracking
  const sessionStartRef = useRef<number>(25 * 60);
  const pendingSecondsRef = useRef<number>(0);
  
  // Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyProgress, setDailyProgress] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const refreshData = useCallback(async () => {
    try {
      const [habitsData, progressData] = await Promise.all([
        getHabits(),
        getHabitProgress(today)
      ]);
      setHabits(habitsData);
      
      const progressMap: Record<number, number> = {};
      progressData.forEach(p => {
        progressMap[p.habit_id] = p.remaining_minutes;
      });
      setDailyProgress(progressMap);
    } catch (error) {
      console.error('Veri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getRemainingTime = (habitId: number) => {
    if (dailyProgress[habitId] !== undefined) {
      return dailyProgress[habitId];
    }
    const habit = habits.find(h => h.id === habitId);
    return habit?.duration_minutes || 0;
  };

  const deductTime = async (seconds: number, habitId: number) => {
    if (seconds <= 0) return;
    
    pendingSecondsRef.current += seconds;
    const minutesToDeduct = Math.floor(pendingSecondsRef.current / 60);
    
    if (minutesToDeduct > 0) {
      pendingSecondsRef.current %= 60;
      
      const currentRemaining = getRemainingTime(habitId);
      const newRemaining = Math.max(0, currentRemaining - minutesToDeduct);
      
      // Optimistic update
      setDailyProgress(prev => ({ ...prev, [habitId]: newRemaining }));
      
      try {
        await updateHabitProgress(habitId, today, newRemaining);
      } catch (err) {
        console.error('İlerleme kaydedilemedi:', err);
      }
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished naturally
      if (selectedHabitId) {
        const spent = sessionStartRef.current - timeLeft;
        deductTime(spent, selectedHabitId);
      }
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, selectedHabitId]);

  const toggleTimer = () => {
    if (isActive) {
      // Pausing
      if (selectedHabitId) {
        const spent = sessionStartRef.current - timeLeft;
        deductTime(spent, selectedHabitId);
      }
    } else {
      // Starting
      sessionStartRef.current = timeLeft;
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    if (isActive && selectedHabitId) {
       const spent = sessionStartRef.current - timeLeft;
       deductTime(spent, selectedHabitId);
    }
    setIsActive(false);
    setTimeLeft(initialTime);
    sessionStartRef.current = initialTime;
    pendingSecondsRef.current = 0;
  };

  const setDuration = (minutes: number) => {
    if (isActive && selectedHabitId) {
      const spent = sessionStartRef.current - timeLeft;
      deductTime(spent, selectedHabitId);
    }
    
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    sessionStartRef.current = seconds;
    setIsActive(false);
    pendingSecondsRef.current = 0;
  };

  const selectHabit = (habitId: number | null) => {
    if (isActive && selectedHabitId && selectedHabitId !== habitId) {
      const spent = sessionStartRef.current - timeLeft;
      deductTime(spent, selectedHabitId);
      sessionStartRef.current = timeLeft;
    }

    if (selectedHabitId === habitId) {
      setSelectedHabitId(null);
    } else {
      setSelectedHabitId(habitId);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateDailyProgress = (habitId: number, minutes: number) => {
    setDailyProgress(prev => ({ ...prev, [habitId]: minutes }));
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <PomodoroContext.Provider value={{
      timeLeft,
      isActive,
      selectedHabitId,
      initialTime,
      habits,
      dailyProgress,
      toggleTimer,
      resetTimer,
      setDuration,
      selectHabit,
      formatTime,
      progress,
      loading,
      refreshData,
      updateDailyProgress
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
