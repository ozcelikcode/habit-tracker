import { Bell, Download, Moon, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import ThemeMenu from './ThemeMenu.jsx';

function SettingsView({ data, notify }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [confirmCalendarOpen, setConfirmCalendarOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleExport = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify?.('Yedek indirildi');
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    notify?.('İçe aktarma yakında eklenecek');
  };

  const resetAll = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (!response.ok) throw new Error();
      notify?.('Tüm veriler sıfırlandı');
      window.location.reload();
    } catch {
      notify?.('Sıfırlama başarısız oldu');
    } finally {
      setIsResetting(false);
      setConfirmAllOpen(false);
    }
  };

  const resetCalendar = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset-entries', { method: 'POST' });
      if (!response.ok) throw new Error();
      notify?.('Takvim temizlendi');
      window.location.reload();
    } catch {
      notify?.('Takvim temizlenemedi');
    } finally {
      setIsResetting(false);
      setConfirmCalendarOpen(false);
    }
  };

  const confirmationBox = (title, description, onConfirm, onClose, loading) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Trash2 size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary"
            disabled={loading}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'İşleniyor...' : 'Evet, Onaylıyorum'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {confirmAllOpen &&
        confirmationBox(
          'Tüm veriler sıfırlansın mı?',
          'Alışkanlıklar, tamamlanma kayıtları ve ayarlar kalıcı olarak silinecek.',
          resetAll,
          () => setConfirmAllOpen(false),
          isResetting
        )}

      {confirmCalendarOpen &&
        confirmationBox(
          'Takvim temizlensin mi?',
          'Sadece tamamlanma kayıtları silinecek, alışkanlık listeniz korunur.',
          resetCalendar,
          () => setConfirmCalendarOpen(false),
          isResetting
        )}

      {/* Görünüm Ayarları */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Moon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Görünüm</h2>
            <p className="text-sm text-muted">Uygulama temasını ve renklerini kişiselleştirin.</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background-alt/50 p-4">
          <span className="text-sm font-medium">Tema Seçimi</span>
          <ThemeMenu />
        </div>
      </section>

      {/* Bildirim Ayarları */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bildirimler</h2>
            <p className="text-sm text-muted">Hatırlatıcılar ve bildirim tercihlerini yönetin.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background-alt/50 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Günlük Hatırlatıcı</p>
              <p className="text-xs text-muted">Her gün belirlediğiniz saatte bildirim alın.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  setReminderTime(e.target.value);
                  notify?.('Hatırlatıcı saati güncellendi');
                }}
                disabled={!notificationsEnabled}
                className="rounded-lg border border-border bg-card px-2 py-1 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  notify?.(!notificationsEnabled ? 'Bildirimler açıldı' : 'Bildirimler kapatıldı');
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary' : 'bg-muted/30'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Veri Yönetimi */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <Download size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Veri Yönetimi</h2>
            <p className="text-sm text-muted">Verilerinizi yedekleyin veya geri yükleyin.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background-alt/30 p-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm">
              <Download size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Yedekle (JSON)</p>
              <p className="text-xs text-muted">Tüm verilerinizi indirin</p>
            </div>
          </button>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background-alt/30 p-6 text-center transition hover:border-primary hover:bg-primary/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm">
              <Upload size={24} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold">Geri Yükle</p>
              <p className="text-xs text-muted">Yedek dosyasından yükle</p>
            </div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-200/70 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <Trash2 size={20} />
                <div>
                  <p className="text-sm font-semibold">Tüm Verileri Sil</p>
                  <p className="text-xs opacity-80">Alışkanlıklar + kayıtlar temizlenir.</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmAllOpen(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                Sıfırla
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
                <Trash2 size={20} />
                <div>
                  <p className="text-sm font-semibold">Takvimi Temizle</p>
                  <p className="text-xs opacity-80">Sadece tamamlanma kayıtlarını siler.</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmCalendarOpen(true)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SettingsView;
