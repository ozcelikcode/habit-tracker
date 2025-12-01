import { useEffect, useState } from 'react';
import { Moon, Sun, Check, Bell, BellRing } from 'lucide-react';
import { getSettings, updateSetting } from '../api';
import type { Settings as SettingsType } from '../types';
import { ensureServiceWorker, getNotificationStatus, requestNotificationPermission } from '../utils/notificationService';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>({ username: '', theme: 'dark' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setNotificationStatus(getNotificationStatus());
    ensureServiceWorker();
  }, []);

  const notificationStatusText = (() => {
    if (notificationStatus === 'granted') return 'Açık';
    if (notificationStatus === 'denied') return 'Reddedildi';
    if (notificationStatus === 'unsupported') return 'Desteklenmiyor';
    return 'Beklemede';
  })();

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnableNotifications() {
    try {
      setNotificationLoading(true);
      const permission = await requestNotificationPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        await ensureServiceWorker();
      }
    } finally {
      setNotificationLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      await Promise.all([
        updateSetting('username', settings.username),
        updateSetting('theme', settings.theme),
        updateSetting('accentColor', settings.accentColor || '#2EAC8A'),
      ]);
      // Tema değişikliğini tetikle
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      // Accent rengi CSS değişkeni olarak ayarla
      document.documentElement.style.setProperty('--color-primary', settings.accentColor || '#2EAC8A');
      window.dispatchEvent(new Event('themeChange'));
      setMessage('Ayarlar kaydedildi!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Ayarlar</h1>
        <p className="text-gray-600 dark:text-white/60 mt-2">Uygulama tercihlerinizi buradan yönetin.</p>
      </div>

      <div className="space-y-6">
        {/* Kullanıcı Adı */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Profil</h3>
          <div>
            <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="Adınızı girin"
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-[#32675a] rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tema */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Görünüm</h3>
          
          {/* Tema Modu */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Tema Modu</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-primary text-white border-primary font-medium'
                    : 'bg-white dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                }`}
              >
                <Moon size={20} className="mr-2 inline-block align-middle" />
                Koyu
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-primary text-white border-primary font-medium'
                    : 'bg-white dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                }`}
              >
                <Sun size={20} className="mr-2 inline-block align-middle" />
                Açık
              </button>
            </div>
          </div>

          {/* Accent Renk */}
          <div>
            <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-3">Vurgu Rengi</label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Zümrüt', value: '#2EAC8A', class: 'bg-[#2EAC8A]' },
                { name: 'Turkuaz', value: '#14B8A6', class: 'bg-[#14B8A6]' },
                { name: 'Okyanus', value: '#0EA5E9', class: 'bg-[#0EA5E9]' },
                { name: 'Mor', value: '#8B5CF6', class: 'bg-[#8B5CF6]' },
                { name: 'Pembe', value: '#EC4899', class: 'bg-[#EC4899]' },
                { name: 'Gül', value: '#F43F5E', class: 'bg-[#F43F5E]' },
                { name: 'Turuncu', value: '#FB923C', class: 'bg-[#FB923C]' },
                { name: 'Amber', value: '#F59E0B', class: 'bg-[#F59E0B]' },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, accentColor: color.value });
                    // Anında rengi uygula
                    document.documentElement.style.setProperty('--color-primary', color.value);
                    window.dispatchEvent(new CustomEvent('accentColorChange', { detail: { accentColor: color.value } }));
                  }}
                  className={`group relative size-10 rounded-full transition-all hover:scale-110 ${color.class} ${
                    settings.accentColor === color.value || (!settings.accentColor && color.value === '#2EAC8A')
                      ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-white ring-offset-gray-100 dark:ring-offset-gray-800 scale-110'
                      : ''
                  }`}
                  title={color.name}
                >
                  {(settings.accentColor === color.value || (!settings.accentColor && color.value === '#2EAC8A')) && (
                    <Check size={20} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-gray-500 dark:text-white/40 text-xs mt-2">
              Seçilen renk butonlar ve vurgular için kullanılır.
            </p>
          </div>
        </div>

        {/* Bildirimler */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-2">Bildirimler</h3>
          <p className="text-sm text-gray-600 dark:text-white/60 mb-3">
            Planlanan saatlerde hatırlatma gönderebilmek için push bildirimi izni gerekir.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                notificationStatus === 'granted'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-300 border border-green-500/30'
                  : notificationStatus === 'unsupported'
                    ? 'bg-gray-500/10 text-gray-600 dark:text-white/60 border border-gray-500/20'
                    : notificationStatus === 'denied'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              <Bell size={14} />
              {notificationStatusText}
            </span>

            {notificationStatus === 'default' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white dark:text-background-dark hover:opacity-90 disabled:opacity-60"
              >
                <BellRing size={16} />
                {notificationLoading ? 'İzin isteniyor...' : 'Push bildirimlerini aç'}
              </button>
            )}

            {notificationStatus === 'denied' && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Tarayıcı ayarlarından bildirim izni vererek hatırlatmaları açabilirsiniz.
              </p>
            )}

            {notificationStatus === 'unsupported' && (
              <p className="text-xs text-gray-600 dark:text-white/60">
                Tarayıcınız push bildirimlerini desteklemiyor.
              </p>
            )}
          </div>
        </div>

        {/* Hakkında */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Info</h3>
          <div className="space-y-2 text-gray-600 dark:text-white/60">
            <p>
              <span className="text-gray-800 dark:text-white/80">Version:</span> 1.0.6
            </p>
            <p>
              <span className="text-gray-800 dark:text-white/80">Developer:</span> ozcelik
            </p>
            <p>
              <span className="text-gray-800 dark:text-white/80">Tools & Ai:</span> Claude Opus 4.5, Gemini 3 Pro, ChatGPT 5.1 Codex
            </p>
          </div>
        </div>

        {/* Mesaj */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('hata')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        {/* Kaydet Butonu */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-primary text-white dark:text-background-dark rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}
