const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TOTAL_WEEKS = 28;

const formatDate = (date) => date.toISOString().slice(0, 10);

export function buildDashboardPayload(db) {
  const stats = buildStats(db);
  const habits = fetchHabits(db);
  const todayTasks = buildTodayTasks(db, habits);
  const suggestions = habits.slice(0, 3).map((habit) => `${habit.name} +1`);
  const upcomingTasks = buildUpcomingTasks(habits);
  const heatmap = buildHeatmap(db);

  return {
    stats,
    heatmap: heatmap.weeks,
    heatmapMonths: heatmap.months,
    todayTasks,
    suggestions,
    upcomingTasks,
    habits,
    lastUpdated: new Date().toISOString(),
  };
}

function fetchHabits(db) {
  return db
    .prepare(
      'SELECT id, name, category, color, target_per_day as targetPerDay FROM habits WHERE is_archived = 0 ORDER BY sort_order, id'
    )
    .all();
}

function buildTodayTasks(db, habits) {
  const todayKey = formatDate(new Date());
  const entries = db
    .prepare('SELECT habit_id as habitId, SUM(amount) as total FROM habit_entries WHERE date = ? GROUP BY habit_id')
    .all(todayKey);
  const entryMap = new Map(entries.map((entry) => [entry.habitId, entry.total]));

  return habits.slice(0, 8).map((habit) => ({
    id: habit.id,
    title: habit.name,
    category: habit.category,
    color: habit.color,
    date: todayKey,
    completed: entryMap.has(habit.id),
  }));
}

function buildUpcomingTasks(habits) {
  const labels = ['Yarın', 'Salı', 'Çarşamba', 'Perşembe'];
  return habits.slice(0, 4).map((habit, index) => ({
    id: `upcoming-${habit.id}-${index}`,
    title: `Planla: ${habit.name}`,
    category: habit.category,
    dueDate: labels[index % labels.length],
  }));
}

function buildStats(db) {
  const totals = db
    .prepare('SELECT date, SUM(amount) as total FROM habit_entries GROUP BY date ORDER BY date')
    .all();

  const completionDays = totals.filter((row) => Number(row.total) > 0).map((row) => row.date);
  const totalCompletions = totals.reduce((sum, row) => sum + Number(row.total || 0), 0);

  const { current, longest } = calculateStreaks(completionDays);

  return {
    currentStreak: current,
    longestStreak: longest,
    totalCompletions,
  };
}

function calculateStreaks(completionDays) {
  if (!completionDays.length) {
    return { current: 0, longest: 0 };
  }

  const daySet = new Set(completionDays);
  const today = new Date();
  let current = 0;
  let pointer = new Date(today);

  while (daySet.has(formatDate(pointer))) {
    current += 1;
    pointer = new Date(pointer.getTime() - DAY_IN_MS);
  }

  const sortedDays = [...daySet].sort();
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diff = (curr - prev) / DAY_IN_MS;
    if (diff === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) {
      longest = run;
    }
  }

  return { current, longest };
}

function buildHeatmap(db) {
  const totalDays = TOTAL_WEEKS * 7;
  const today = new Date();
  const aggregates = db
    .prepare('SELECT date, SUM(amount) as total FROM habit_entries GROUP BY date')
    .all();
  const aggregateMap = new Map(aggregates.map((item) => [item.date, Number(item.total || 0)]));

  const orderedDays = [];
  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - offset);
    const dateKey = formatDate(targetDate);
    const value = aggregateMap.get(dateKey) || 0;
    orderedDays.push({
      date: dateKey,
      value,
      intensity: Math.min(4, value),
    });
  }

  const weeks = [];
  for (let i = 0; i < orderedDays.length; i += 7) {
    weeks.push(orderedDays.slice(i, i + 7));
  }

  const months = [];
  let lastMonth = '';
  weeks.forEach((week) => {
    const label = new Date(week[0].date).toLocaleString('tr-TR', { month: 'short' });
    const normalized = capitalize(label);
    if (normalized !== lastMonth) {
      months.push(normalized);
      lastMonth = normalized;
    }
  });

  return { weeks, months };
}

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
