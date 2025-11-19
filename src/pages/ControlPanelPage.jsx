import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    const success = await submitHabit({ name: sidebarHabitName, category: sidebarHabitCategory }, setSidebarCreating);
    if (success) {
      setSidebarHabitName('');
      setSidebarHabitCategory(CATEGORY_OPTIONS[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark font-display text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 flex-col justify-between border-r border-white/10 bg-card-deeper/80 p-6 lg:flex">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">waterfall_chart</span>
              </div>
              <div>
                <p className="text-lg font-semibold">HabitApp</p>
                <p className="text-sm text-white/60">Alışkanlık Takibi</p>
              </div>
            </Link>

            <nav className="space-y-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    item.active ? 'bg-primary/25 text-primary' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Alışkanlıklarım</p>
              <div className="space-y-2">
                {habits.slice(0, 6).map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-lg text-white/70">
                      {HABIT_ICONS[index % HABIT_ICONS.length]}
                    </span>
                    <div className="flex flex-col">
                      <span>{habit.name}</span>
                      <span className="text-xs text-white/40">{habit.category}</span>
                    </div>
                  </div>
                ))}
                {!habits.length && <p className="text-sm text-white/60">Henüz alışkanlık yok.</p>}
              </div>
            </div>
          </div>

          <form className="space-y-3 rounded-xl border border-white/10 bg-card-dark/60 p-4" onSubmit={handleSidebarCreate}>
            <p className="text-sm font-semibold text-white">Yeni Alışkanlık</p>
            <input
              type="text"
              value={sidebarHabitName}
              onChange={(event) => setSidebarHabitName(event.target.value)}
              placeholder="Alışkanlık adı"
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
            />
            <select
              value={sidebarHabitCategory}
              onChange={(event) => setSidebarHabitCategory(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-card-deeper px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-card-deeper text-gray-900">
                  {option}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={sidebarCreating}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-[#092821] transition hover:bg-primary/90 disabled:opacity-50"
            >
              {sidebarCreating ? 'Kaydediliyor...' : 'Yeni Alışkanlık Ekle'}
            </button>
          </form>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Bugünün Görevleri</p>
              <h1 className="text-4xl font-black leading-tight">Pazartesi, 22 Temmuz</h1>
            </div>
            <button className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-[#04130f] shadow-panel transition hover:bg-primary/90">
              + Yeni Görev Ekle
            </button>
          </div>

          {statusMessage && (
            <div className="mb-6 rounded-xl border border-white/10 bg-card-dark/80 p-4 text-sm text-white/70">
              {statusMessage}
              {error && (
                <button
                  type="button"
                  onClick={refetch}
                  className="ml-4 rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:border-primary"
                >
                  Tekrar Dene
                </button>
              )}
            </div>
          )}

          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-card-dark/80 p-5 shadow-panel">
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleMainCreate}>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(event) => setNewTaskName(event.target.value)}
                  placeholder="Yeni bir görev ekle..."
                  className="flex-1 rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-0"
                />
                <select
                  value={newTaskCategory}
                  onChange={(event) => setNewTaskCategory(event.target.value)}
                  className="rounded-xl border border-white/15 bg-card-deeper px-3 py-3 text-sm text-white focus:border-primary focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-card-deeper text-gray-900">
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-[#05362a] transition hover:bg-accent/90 disabled:opacity-50"
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-primary hover:text-white"
                  >
                    <span className="material-symbols-outlined text-base">lightbulb</span>
                    {suggestion}
                  </button>
                ))}
                {!suggestions.length && <p className="text-sm text-white/60">Henüz öneri yok.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card-dark/80 p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bugünün Görevleri</h3>
                {actionError && <p className="text-xs text-red-300">{actionError}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Tümü', 'Aktif', 'Tamamlanan'].map((filter, index) => (
                  <button
                    key={filter}
                    type="button"
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      index === 1 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-card-deeper/60 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        disabled={pendingIds.has(task.id)}
                        className="mt-1 h-5 w-5 rounded border-white/30 text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <div>
                        <p className={`text-lg font-semibold ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-white/50">Bugün</p>
                      </div>
                    </div>
                    <span className="self-start rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 md:self-center">
                      {task.category ?? 'Genel'}
                    </span>
                  </div>
                ))}
                {!todayTasks.length && <p className="text-sm text-white/60">Bugün için görev bulunamadı.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card-dark/80 p-5 shadow-panel">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Yaklaşan Görevler</h2>
                <button className="text-sm text-primary hover:underline">Tümünü Gör</button>
              </div>
              <div className="mt-5 space-y-3">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold">{item.title}</p>
                      <p className="text-sm text-white/50">{item.dueDate}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      {item.category ?? 'Genel'}
                    </span>
                  </div>
                ))}
                {!upcoming.length && <p className="text-sm text-white/60">Yaklaşan görev bulunmuyor.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ControlPanelPage;
