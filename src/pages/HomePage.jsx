import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import { toggleHabitEntry } from '../lib/api.js';

const NAV_LINKS = [
  { label: 'Kontrol Paneli', path: '/control-panel' },
  { label: 'Alışkanlıklarım', path: '#habits' },
  { label: 'Ayarlar', path: '#settings' },
];

const MONTH_FALLBACK = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem'];
const HEATMAP_PLACEHOLDER = Array.from({ length: 28 }, () =>
  Array.from({ length: 7 }, () => ({ intensity: 0, value: 0, date: '' }))
);

const intensityClasses = ['bg-foreground/10', 'bg-primary/30', 'bg-primary/50', 'bg-primary/70', 'bg-primary'];
const getIntensityClass = (value) => intensityClasses[value] ?? intensityClasses[0];

function HomePage() {
  const { data, loading, error, refetch } = useDashboardData();
  const [pendingIds, setPendingIds] = useState(new Set());
  const [actionError, setActionError] = useState(null);

  const statsCards = [
    { label: 'Mevcut Seri', value: data ? `${data.stats.currentStreak} gün` : '--' },
    { label: 'En Uzun Seri', value: data ? `${data.stats.longestStreak} gün` : '--' },
    { label: 'Toplam Tamamlanan', value: data ? data.stats.totalCompletions : '--' },
  ];

  const heatmapWeeks = data?.heatmap ?? HEATMAP_PLACEHOLDER;
  const monthLabels = data?.heatmapMonths ?? MONTH_FALLBACK;
  const todayTasks = data?.todayTasks ?? [];
  const statusMessage = loading ? 'Veriler yükleniyor...' : error ? 'Veriler alınamadı.' : null;

  const togglePending = (id, shouldAdd) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (shouldAdd) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleTask = async (task) => {
    if (pendingIds.has(task.id)) return;
    try {
      togglePending(task.id, true);
      setActionError(null);
      await toggleHabitEntry({ habitId: task.id, date: task.date });
      await refetch();
    } catch (err) {
      setActionError(err.message || 'Görev güncellenemedi');
    } finally {
      togglePending(task.id, false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-display text-foreground transition-colors">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M39.56 34.15V13.85c0 1.85-2.68 3.48-6.76 4.46-2.5.6-5.53.95-8.8.95s-6.3-.35-8.8-.95c-4.08-.98-6.76-2.61-6.76-4.46v20.29c0 1.84 2.68 3.48 6.76 4.46 2.5.6 5.53.95 8.8.95s6.3-.35 8.8-.95c4.08-.98 6.76-2.62 6.76-4.46Z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">HabitTracker</p>
              <p className="text-sm text-muted">Alışkanlık Takvimi</p>
            </div>
          </div>
          <nav className="flex flex-1 justify-end gap-6 text-sm font-medium text-muted">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.path} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeMenu />
        </header>

        {statusMessage && (
          <div className="mt-6 rounded-xl border border-border bg-card/80 p-4 text-sm text-muted">
            {statusMessage}
            {error && (
              <button
                type="button"
                onClick={refetch}
                className="ml-4 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary"
              >
                Tekrar Dene
              </button>
            )}
          </div>
        )}

        <main className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,3.5fr)_2fr]">
          <section className="space-y-8">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-panel">
              <p className="text-sm uppercase tracking-[0.25em] text-primary/90">Merhaba, Kullanıcı!</p>
              <h1 className="text-4xl font-black leading-tight tracking-tight">Alışkanlık takvimimize hoş geldiniz.</h1>
              <p className="max-w-3xl text-base text-muted">
                Bu takvim, son bir yıldaki alışkanlık tamamlama ilerlemenizi gösterir. Bir günün üzerine gelerek o günün
                detaylarını görebilirsiniz. Renk tonları günlük tamamlama oranını temsil eder.
              </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-panel">
              <div>
                <p className="text-sm text-primary/90">2024 Yılındaki Katkıların</p>
                <h2 className="text-xl font-semibold">Alışkanlık Aktivitesi</h2>
                <p className="mt-1 text-sm text-muted">Renk ne kadar koyuysa o kadar çok alışkanlık tamamlanmış demektir.</p>
              </div>
              <div>
                <div className="flex justify-between px-1 text-xs text-muted sm:px-3">
                  {monthLabels.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
                <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
                  {heatmapWeeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <span
                          key={`day-${weekIndex}-${dayIndex}`}
                          title={day.date ? `${day.date}: ${day.value} tamamlanan` : undefined}
                          className={`h-3.5 w-3.5 rounded-sm ${getIntensityClass(day.intensity)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted">
                  <span>Az</span>
                  {intensityClasses.map((colorClass, index) => (
                    <span key={`legend-${index}`} className={`h-3 w-3 rounded-sm ${colorClass}`} />
                  ))}
                  <span>Çok</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <Link
              to="/control-panel"
              className="flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-panel transition hover:bg-primary/80"
            >
              + Yeni Alışkanlık Ekle
            </Link>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-panel">
              <h3 className="text-lg font-semibold">İstatistikler</h3>
              <div className="space-y-4">
                {statsCards.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-background-alt/80 p-4">
                    <p className="text-sm text-muted">{item.label}</p>
                    <p className="text-3xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bugünün Görevleri</h3>
                {actionError && <p className="text-xs text-red-300">{actionError}</p>}
              </div>
              <div className="mt-4 space-y-2">
                {todayTasks.map((task) => (
                  <label
                    key={task.id}
                    htmlFor={`task-${task.id}`}
                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-transparent px-3 py-2 transition hover:border-primary/60"
                  >
                    <input
                      id={`task-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                      disabled={pendingIds.has(task.id)}
                      className="h-5 w-5 rounded-md border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                    <span className={`text-sm font-medium ${task.completed ? 'text-muted line-through' : ''}`}>
                      {task.title}
                    </span>
                  </label>
                ))}
                {!todayTasks.length && <p className="text-sm text-muted">Bugün için görev bulunamadı.</p>}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
