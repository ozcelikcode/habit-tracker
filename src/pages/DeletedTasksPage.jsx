import { Menu, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { restoreHabit } from '../lib/api.js';
import {
  clearDeletedTasks,
  getDeletedTasks,
  permanentlyDeleteTask,
  restoreDeletedTask,
  subscribeToDeletedTasks,
} from '../lib/deletedTasks.js';

const NAV_LINKS = [
  { icon: 'checklist', label: 'Yapılacaklar', path: '/control-panel' },
  { icon: 'pie_chart', label: 'İstatistikler', path: '/control-panel#stats' },
  { icon: 'settings', label: 'Ayarlar', path: '/control-panel#settings' },
  { icon: 'delete', label: 'Silinenler', path: '/deleted' },
];

function DeletedTasksPage() {
  const [deletedTasks, setDeletedTasks] = useState(() => getDeletedTasks());
  const [actionError, setActionError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToDeletedTasks(setDeletedTasks);
    return unsubscribe;
  }, []);

  const totalDeleted = useMemo(() => deletedTasks.length, [deletedTasks]);

  const handleRestore = async (taskId) => {
    setPendingId(taskId);
    setActionError(null);
    try {
      await restoreHabit(taskId);
      restoreDeletedTask(taskId);
      showToast('Görev geri alındı');
    } catch (err) {
      setActionError(err.message || 'Geri alma başarısız oldu');
    } finally {
      setPendingId(null);
    }
  };

  const handlePermanentDelete = (taskId) => {
    setActionError(null);
    permanentlyDeleteTask(taskId);
    showToast('Görev kalıcı olarak silindi');
  };

  const handleBulkDelete = () => {
    setActionError(null);
    clearDeletedTasks();
    showToast('Arşiv boşaltıldı');
  };

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
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
                item.path === '/deleted' ? 'bg-primary/20 text-primary' : 'text-muted hover:bg-background-alt/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="rounded-xl border border-border bg-card-deep/70 p-4 text-xs text-muted">
        Silinen görevler burada saklanır. İstediğiniz zaman geri alabilir veya kalıcı olarak silebilirsiniz.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-border bg-card-deep/80 p-6 lg:flex">{sidebar}</aside>

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
              <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Arşiv</p>
              <h1 className="text-4xl font-black leading-tight">Silinen Görevler</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeMenu showLabel />
              <Link
                to="/control-panel"
                className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary"
              >
                Kontrol Paneli
              </Link>
            </div>
          </div>

          {actionError && (
            <div className="mb-4 rounded-xl border border-red-400/70 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_1.1fr]">
            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-primary/80">Arşiv</p>
                  <h2 className="text-xl font-semibold">Son Silinenler</h2>
                  <p className="text-sm text-muted">Toplam {totalDeleted} görev</p>
                </div>
                {deletedTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition hover:border-red-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                    Tümünü Kalıcı Sil
                  </button>
                )}
              </div>

              {deletedTasks.length === 0 && (
                <div className="rounded-xl border border-border bg-background-alt/60 p-6 text-sm text-muted">
                  Hiç silinen görev yok.
                </div>
              )}

              {deletedTasks.length > 0 && (
                <div className="space-y-3">
                  {deletedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-card-deep/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold">{task.title || 'Başlıksız Görev'}</p>
                        <p className="text-sm text-muted">
                          {(task.category ?? 'Genel') + ' • '}
                          {task.deletedAt ? new Date(task.deletedAt).toLocaleString('tr-TR') : 'Silinme tarihi yok'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestore(task.id)}
                          disabled={pendingId === task.id}
                          className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary disabled:opacity-60"
                        >
                          {pendingId === task.id ? 'Geri Yükleniyor...' : 'Geri Al'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(task.id)}
                          className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-red-400 hover:text-red-400"
                        >
                          Kalıcı Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary/80">İpucu</p>
                  <h2 className="text-xl font-semibold">Neden arşiv?</h2>
                  <p className="mt-1 text-sm text-muted">
                    Görevleri tamamen silmeden önce burada tutarak yanlışlıkla yapılan işlemleri geri alabilirsiniz.
                    Arşivlenen görevler istatistiklere dahil edilmez.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background-alt/50 p-4 text-sm text-muted">
                <ul className="space-y-2 list-disc list-inside">
                  <li>Geri al butonu görevi yeniden aktif hale getirir.</li>
                  <li>Kalıcı sil butonu listeden tamamen temizler.</li>
                  <li>“Tümünü Kalıcı Sil” arşivin tamamını boşaltır.</li>
                </ul>
              </div>
            </section>
          </div>
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
            <div className="flex-1 overflow-y-auto pr-1">{sidebar}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeletedTasksPage;
