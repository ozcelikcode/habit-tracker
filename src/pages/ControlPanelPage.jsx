import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import { createHabit, toggleHabitEntry } from '../lib/api.js';

const NAV_LINKS = [
  { icon: 'checklist', label: 'Yapılacaklar', path: '/control-panel', active: true },
  { icon: 'pie_chart', label: 'İstatistikler', path: '#stats' },
  { icon: 'settings', label: 'Ayarlar', path: '#settings' },
];

const HABIT_ICONS = ['self_improvement', 'fitness_center', 'auto_stories', 'water_drop', 'spa'];
const CATEGORY_OPTIONS = ['Genel', 'Sağlık', 'Spor', 'Odak', 'Hobi'];

function ControlPanelPage() {
  const { data, loading, error, refetch } = useDashboardData();
  const habits = data?.habits ?? [];
  const todayTasks = data?.todayTasks ?? [];
  const suggestions = data?.suggestions ?? [];
  const upcoming = data?.upcomingTasks ?? [];
  const statusMessage = loading ? 'Veriler yükleniyor...' : error ? 'Veriler alınamadı.' : null;

  const [pendingIds, setPendingIds] = useState(new Set());
  const [actionError, setActionError] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(CATEGORY_OPTIONS[0]);
  const [sidebarHabitName, setSidebarHabitName] = useState('');
  const [sidebarHabitCategory, setSidebarHabitCategory] = useState(CATEGORY_OPTIONS[0]);
  const [creating, setCreating] = useState(false);
  const [sidebarCreating, setSidebarCreating] = useState(false);

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

  const submitHabit = async ({ name, category }, setStateFn) => {
    if (!name || !name.trim()) {
      setActionError('Lütfen bir başlık yazın');
      return false;
    }
    try {
      setActionError(null);
      setStateFn(true);
      await createHabit({ name: name.trim(), category: category?.trim() || CATEGORY_OPTIONS[0] });
      await refetch();
      return true;
    } catch (err) {
      setActionError(err.message || 'Kayıt sırasında hata oluştu');
      return false;
    } finally {
      setStateFn(false);
    }
  };

  const handleMainCreate = async (event) => {
    event.preventDefault();
    const success = await submitHabit({ name: newTaskName, category: newTaskCategory }, setCreating);
    if (success) {
      setNewTaskName('');
      setNewTaskCategory(CATEGORY_OPTIONS[0]);
    }
  };

  const handleSidebarCreate = async (event) => {
    event.preventDefault();
    const success = await submitHabit(
      { name: sidebarHabitName, category: sidebarHabitCategory },
      setSidebarCreating
    );
    if (success) {
      setSidebarHabitName('');
      setSidebarHabitCategory(CATEGORY_OPTIONS[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 flex-col justify-between border-r border-border bg-card-deep/80 p-6 lg:flex">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">waterfall_chart</span>
              </div>
              <div>
                <p className="text-lg font-semibold">HabitApp</p>
                <p className="text-sm text-muted">Alışkanlık Takibi</p>
              </div>
            </Link>

            <nav className="space-y-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    item.active ? 'bg-primary/20 text-primary' : 'text-muted hover:bg-background-alt/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Alışkanlıklarım</p>
              <div className="space-y-2">
                {habits.slice(0, 6).map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-background-alt/30"
                  >
                    <span className="material-symbols-outlined text-lg text-muted">
                      {HABIT_ICONS[index % HABIT_ICONS.length]}
                    </span>
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-xs text-muted">{habit.category}</p>
                    </div>
                  </div>
                ))}
                {!habits.length && <p className="text-sm text-muted">Henüz alışkanlık yok.</p>}
              </div>
            </div>
          </div>

          <form className="space-y-3 rounded-xl border border-border bg-card p-4" onSubmit={handleSidebarCreate}>
            <p className="text-sm font-semibold">Yeni Alışkanlık</p>
            <input
              type="text"
              value={sidebarHabitName}
              onChange={(event) => setSidebarHabitName(event.target.value)}
              placeholder="Alışkanlık adı"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <select
              value={sidebarHabitCategory}
              onChange={(event) => setSidebarHabitCategory(event.target.value)}
              className="w-full rounded-lg border border-border bg-card-deep px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-background-alt text-foreground">
                  {option}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={sidebarCreating}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary/80 disabled:opacity-60"
            >
              {sidebarCreating ? 'Kaydediliyor...' : 'Yeni Alışkanlık Ekle'}
            </button>
          </form>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Bugünün Görevleri</p>
              <h1 className="text-4xl font-black leading-tight">Pazartesi, 22 Temmuz</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeMenu showLabel />
              <button className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-panel transition hover:bg-primary/80">
                + Yeni Görev Ekle
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="mb-6 rounded-xl border border-border bg-card/90 p-4 text-sm text-muted">
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

          {actionError && (
            <div className="mb-4 rounded-xl border border-red-400/70 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          )}

          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleMainCreate}>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(event) => setNewTaskName(event.target.value)}
                  placeholder="Yeni bir görev ekle..."
                  className="flex-1 rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-0"
                />
                <select
                  value={newTaskCategory}
                  onChange={(event) => setNewTaskCategory(event.target.value)}
                  className="rounded-xl border border-border bg-card-deep px-3 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-background-alt text-foreground">
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-accent/80 disabled:opacity-60"
                >
                  {creating ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNewTaskName(suggestion)}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-base">lightbulb</span>
                    {suggestion}
                  </button>
                ))}
                {!suggestions.length && <p className="text-sm text-muted">Henüz öneri yok.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-muted">
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  {['Tümü', 'Aktif', 'Tamamlanan'].map((filter, index) => (
                    <button
                      key={filter}
                      type="button"
                      className={`rounded-xl px-4 py-2 transition ${
                        index === 1 ? 'bg-foreground/10 text-foreground' : 'bg-foreground/5 hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted">Filtreler (yakında)</span>
              </div>
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card-deep/80 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        disabled={pendingIds.has(task.id)}
                        className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <div>
                        <p className={`text-lg font-semibold ${task.completed ? 'text-muted line-through' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted">Bugün</p>
                      </div>
                    </div>
                    <span className="self-start rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-muted md:self-center">
                      {task.category ?? 'Genel'}
                    </span>
                  </div>
                ))}
                {!todayTasks.length && <p className="text-sm text-muted">Bugün için görev bulunamadı.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Yaklaşan Görevler</h2>
                <button className="text-sm text-primary hover:underline">Tümünü Gör</button>
              </div>
              <div className="mt-5 space-y-3">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background-alt/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold">{item.title}</p>
                      <p className="text-sm text-muted">{item.dueDate}</p>
                    </div>
                    <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-muted">
                      {item.category ?? 'Genel'}
                    </span>
                  </div>
                ))}
                {!upcoming.length && <p className="text-sm text-muted">Yaklaşan görev bulunmuyor.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ControlPanelPage;
