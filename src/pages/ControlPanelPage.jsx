import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, Clock, Menu, Pencil, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsView from '../components/SettingsView.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import ThemeMenu from '../components/ThemeMenu.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import { useServerTime } from '../hooks/useServerTime.js';
import { createHabit, deleteHabit, toggleHabitEntry, updateHabit } from '../lib/api.js';
import {
  archiveDeletedTask,
  getDeletedTaskIds,
  restoreDeletedTask,
  subscribeToDeletedTasks,
} from '../lib/deletedTasks.js';

const NAV_LINKS = [
  { icon: 'checklist', label: 'Yapılacaklar', id: 'tasks' },
  { icon: 'pie_chart', label: 'İstatistikler', path: '' },
  { icon: 'settings', label: 'Ayarlar', id: 'settings' },
  { icon: 'delete', label: 'Silinenler', path: '/deleted' },
];

const HABIT_ICONS = ['self_improvement', 'fitness_center', 'auto_stories', 'water_drop', 'spa'];
const CATEGORY_OPTIONS = ['Genel', 'Sağlık', 'Spor', 'Odak', 'Hobi'];
const STATUS_FLOW = ['backlog', 'active', 'done'];
const STATUS_LABELS = {
  backlog: 'Beklemede',
  active: 'Aktif',
  done: 'Tamamlandı',
};
const FILTER_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'done', label: 'Tamamlanan' },
];

function ControlPanelPage({ initialView = 'tasks' }) {
  const { data, loading, error, refetch, setData } = useDashboardData();
  const habits = data?.habits ?? [];
  const suggestions = data?.suggestions ?? [];
  const upcoming = data?.upcomingTasks ?? [];
  const statusMessage = loading ? 'Veriler yükleniyor...' : error ? 'Veriler alınamadı.' : null;

  const [pendingIds, setPendingIds] = useState(new Set());
  const [actionError, setActionError] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(CATEGORY_OPTIONS[0]);
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [formMode, setFormMode] = useState('create'); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [sidebarHabitName, setSidebarHabitName] = useState('');
  const [sidebarHabitCategory, setSidebarHabitCategory] = useState(CATEGORY_OPTIONS[0]);
  const [creating, setCreating] = useState(false);
  const [sidebarCreating, setSidebarCreating] = useState(false);
  const [activeView, setActiveView] = useState(initialView);
  const [taskFilter, setTaskFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [isTaskDirty, setIsTaskDirty] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletedTaskIds, setDeletedTaskIds] = useState(() => getDeletedTaskIds());
  const { showToast } = useToast();
  const serverNow = useServerTime();
  const dateLabel = serverNow
    ? serverNow.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Tarih yükleniyor...';
  const timeLabel = serverNow ? serverNow.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  const todayTasks = data?.todayTasks ?? [];

  useEffect(() => {
    const unsubscribe = subscribeToDeletedTasks((tasks) => {
      setDeletedTaskIds(tasks.map((task) => task.id));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!newTaskDate && serverNow) {
      setNewTaskDate(serverNow.toISOString().slice(0, 10));
    }
  }, [serverNow, newTaskDate]);

  const deletedTaskIdSet = useMemo(() => new Set(deletedTaskIds), [deletedTaskIds]);

  useEffect(() => {
    if (!todayTasks) {
      return;
    }
    if (isTaskDirty) {
      return;
    }
    const mapped = todayTasks
      .filter((task) => !deletedTaskIdSet.has(task.id))
      .map((task) => ({
        id: task.id,
        title: task.title,
        category: task.category ?? 'Genel',
        date: task.date,
        scheduledDate: task.scheduledDate,
        scheduledTime: task.scheduledTime,
        status: task.completed ? 'done' : 'active',
      }));
    setTasks(mapped);
  }, [todayTasks, isTaskDirty, deletedTaskIdSet]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return tasks;
    if (taskFilter === 'done') return tasks.filter((task) => task.status === 'done');
    if (taskFilter === 'active') return tasks.filter((task) => task.status === 'active');
    return tasks;
  }, [taskFilter, tasks]);

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
    const nextStatus = task.status === 'done' ? 'active' : 'done';
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );
    setIsTaskDirty(true);
    try {
      togglePending(task.id, true);
      setActionError(null);
      const response = await toggleHabitEntry({ habitId: task.id, date: task.date });
      if (response.dashboard) {
        setData(response.dashboard);
      }
    } catch (err) {
      setTasks(previousTasks);
      setActionError(err.message || 'Görev güncellenemedi');
    } finally {
      togglePending(task.id, false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setActionError(null);

    archiveDeletedTask({
      id: targetTask?.id ?? taskId,
      title: targetTask?.title ?? '',
      category: targetTask?.category ?? 'Genel',
      status: targetTask?.status ?? 'active',
      date: targetTask?.date ?? '',
    });
    setIsTaskDirty(true);

    try {
      togglePending(taskId, true);
      const response = await deleteHabit(taskId);
      if (response.dashboard) {
        setData(response.dashboard);
      } else {
        await refetch();
      }
      setIsTaskDirty(false);
      showToast('Görev silinenlere taşındı');
    } catch (err) {
      setTasks(previousTasks);
      restoreDeletedTask(taskId);
      setActionError(err.message || 'Görev silinemedi');
      setIsTaskDirty(false);
    } finally {
      togglePending(taskId, false);
    }
  };

  const handleMoveTask = (taskId, direction) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const currentIndex = STATUS_FLOW.indexOf(task.status);
        const nextIndex = Math.min(Math.max(currentIndex + direction, 0), STATUS_FLOW.length - 1);
        return {
          ...task,
          status: STATUS_FLOW[nextIndex],
        };
      })
    );
    setIsTaskDirty(true);
  };

  const submitHabit = async ({ id, name, category, date, time }, setStateFn) => {
    const trimmedName = (name ?? '').toString().trim();
    const safeCategory = (category ?? CATEGORY_OPTIONS[0]).toString().trim() || CATEGORY_OPTIONS[0];
    const payload = {
      name: trimmedName,
      category: safeCategory,
      preferredDate: date || null,
      preferredTime: time || null,
    };

    if (!trimmedName) {
      setActionError('Lütfen bir başlık yazın');
      return false;
    }
    try {
      setActionError(null);
      setStateFn(true);
      const response =
        formMode === 'edit' && id
          ? await updateHabit(id, payload)
          : await createHabit(payload);

      if (response?.dashboard) {
        setData(response.dashboard);
      } else {
        await refetch();
      }
      setIsTaskDirty(false);
      showToast(formMode === 'edit' ? 'Görev güncellendi' : 'Görev eklendi');
      return true;
    } catch (err) {
      setActionError(err.message || 'Kayıt sırasında hata oluştu');
      return false;
    } finally {
      setStateFn(false);
    }
  };

  const resetForm = () => {
    setFormMode('create');
    setEditingId(null);
    setNewTaskName('');
    setNewTaskCategory(CATEGORY_OPTIONS[0]);
    setNewTaskDate(serverNow ? serverNow.toISOString().slice(0, 10) : '');
    setNewTaskTime('');
  };

  const handleMainCreate = async (event) => {
    event.preventDefault();
    const success = await submitHabit(
      {
        id: formMode === 'edit' ? editingId : undefined,
        name: newTaskName,
        category: newTaskCategory,
        date: newTaskDate,
        time: newTaskTime,
      },
      setCreating
    );
    if (success) {
      resetForm();
    }
  };

  const handleSidebarCreate = async (event) => {
    event.preventDefault();
    const success = await submitHabit(
      {
        id: formMode === 'edit' ? editingId : undefined,
        name: sidebarHabitName,
        category: sidebarHabitCategory,
        date: newTaskDate,
        time: newTaskTime,
      },
      setSidebarCreating
    );
    if (success) {
      resetForm();
      setSidebarHabitName('');
      setSidebarHabitCategory(CATEGORY_OPTIONS[0]);
    }
  };

  const startEditFromList = (task) => {
    setFormMode('edit');
    setEditingId(task.id);
    setNewTaskName(task.title);
    setNewTaskCategory(task.category ?? CATEGORY_OPTIONS[0]);
    setNewTaskDate(task.scheduledDate || task.date || (serverNow ? serverNow.toISOString().slice(0, 10) : ''));
    setNewTaskTime(task.scheduledTime || '');
    showToast('Düzenleme moduna geçildi');
  };

  const sidebarInner = (
    <>
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
          {NAV_LINKS.map((item) => {
            if (item.path) {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-background-alt/30"
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${activeView === item.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted hover:bg-background-alt/30'
                  }`}
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
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

      <form className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4" onSubmit={handleSidebarCreate}>
        <p className="text-sm font-semibold">Yeni Alışkanlık</p>
        <input
          type="text"
          value={sidebarHabitName}
          onChange={(event) => setSidebarHabitName(event.target.value)}
          placeholder="Alışkanlık adı"
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <div className="relative">
          <select
            value={sidebarHabitCategory}
            onChange={(event) => setSidebarHabitCategory(event.target.value)}
            className="themed-select"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-background-alt text-foreground">
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" size={16} />
        </div>
        <button
          type="submit"
          disabled={sidebarCreating}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary/80 disabled:opacity-60"
        >
          {sidebarCreating ? 'Kaydediliyor...' : 'Yeni Alışkanlık Ekle'}
        </button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 flex-col justify-between border-r border-border bg-card-deep/80 p-6 lg:flex">
          {sidebarInner}
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-border pb-6">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:text-primary lg:hidden"
              aria-label="Menüyü aç"
            >
              <Menu size={18} />
            </button>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.4em] text-primary/80">
                {activeView === 'settings' ? 'Ayarlar' : 'Bugünün Görevleri'}
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-4xl font-black leading-tight">
                  {activeView === 'settings' ? 'Uygulama Ayarları' : dateLabel}
                </h1>
                {activeView !== 'settings' && (
                  <span className="text-base font-semibold text-muted">{timeLabel}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeMenu showLabel />
              <Link
                to="/deleted"
                className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary"
              >
                Silinenler
              </Link>
              <button
                onClick={() => setActiveView('tasks')}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary/80"
              >
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

          {activeView === 'settings' ? (
            <SettingsView data={data} notify={showToast} />
          ) : activeView === 'stats' ? (
            <StatsPanel data={data} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
                  <div className="grid flex-1 gap-3 sm:grid-cols-3">
                    {FILTER_OPTIONS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setTaskFilter(filter.value)}
                        className={`rounded-xl px-4 py-2 transition ${
                          taskFilter === filter.value ? 'bg-primary/20 text-primary' : 'bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-muted">Toplam {filteredTasks.length} görev</span>
                </div>

                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group rounded-2xl border border-border bg-card-deep/80 p-4 transition hover:border-primary/60"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={() => handleToggleTask(task)}
                          disabled={pendingIds.has(task.id)}
                          className="themed-checkbox mt-1 disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p
                                className={`text-lg font-semibold ${
                                  task.status === 'done' ? 'text-muted line-through' : 'text-foreground'
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="text-sm text-muted">{task.category ?? 'Genel'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditFromList(task)}
                                className="rounded-full border border-border/70 p-1 text-muted transition hover:border-primary hover:text-foreground"
                                aria-label="Görevi düzenle"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="rounded-full border border-border/70 p-1 text-muted transition hover:border-primary hover:text-red-300"
                                aria-label="Görevi sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1">
                              <Calendar size={12} /> {task.scheduledDate || 'Tarih seçilmedi'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1">
                              <Clock size={12} /> {task.scheduledTime || 'Saat seçilmedi'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveTask(task.id, -1)}
                            disabled={task.status === STATUS_FLOW[0]}
                            className="rounded-full border border-border/70 p-1 text-muted transition hover:border-primary hover:text-foreground disabled:opacity-40"
                            aria-label="Sola taşı"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <span className="rounded-full border border-border/60 px-2 py-1 text-xs font-semibold text-muted">
                            {STATUS_LABELS[task.status]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveTask(task.id, 1)}
                            disabled={task.status === STATUS_FLOW[STATUS_FLOW.length - 1]}
                            className="rounded-full border border-border/70 p-1 text-muted transition hover:border-primary hover:text-foreground disabled:opacity-40"
                            aria-label="Sağa taşı"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!filteredTasks.length && <p className="text-sm text-muted">Bugün için görev bulunamadı.</p>}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary/80">{formMode === 'edit' ? 'Görev Düzenle' : 'Yeni Görev'}</p>
                    <h2 className="text-xl font-semibold">
                      {formMode === 'edit' ? 'Seçili görevi güncelle' : 'Görev ekle'}
                    </h2>
                  </div>
                  {formMode === 'edit' && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                    >
                      Yeni Görev
                    </button>
                  )}
                </div>

                <form className="space-y-3" onSubmit={handleMainCreate}>
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(event) => setNewTaskName(event.target.value)}
                    placeholder="Görev başlığı"
                    className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <select
                        value={newTaskCategory}
                        onChange={(event) => setNewTaskCategory(event.target.value)}
                        className="themed-select"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-background-alt text-foreground">
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card-deep px-3 py-2">
                        <Calendar size={16} className="text-muted" />
                        <input
                          type="date"
                          value={newTaskDate}
                          onChange={(event) => setNewTaskDate(event.target.value)}
                          className="themed-input-ghost"
                        />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card-deep px-3 py-2">
                        <Clock size={16} className="text-muted" />
                        <input
                          type="time"
                          value={newTaskTime}
                          onChange={(event) => setNewTaskTime(event.target.value)}
                          className="themed-input-ghost"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-accent/80 disabled:opacity-60"
                  >
                    {creating ? 'Kaydediliyor...' : formMode === 'edit' ? 'Güncelle' : 'Ekle'}
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
              </section>
            </div>
          )}
        </main>
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 p-4 lg:hidden">
          <div className="ml-auto flex h-full max-w-xs flex-col rounded-2xl border border-border bg-card-deep/95 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menü</h2>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">{sidebarInner}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlPanelPage;
