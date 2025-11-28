import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../api';
import type { Settings as SettingsType } from '../types';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>({ username: '', theme: 'dark' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

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

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      await Promise.all([
        updateSetting('username', settings.username),
        updateSetting('theme', settings.theme),
      ]);
      // Tema değişikliğini tetikle
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
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
          <div>
            <label className="block text-gray-700 dark:text-white/80 text-sm font-medium mb-2">Tema</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-primary text-white dark:text-background-dark border-primary font-medium'
                    : 'bg-white dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                }`}
              >
                <span className="material-symbols-outlined mr-2" style={{ fontSize: 20, verticalAlign: 'middle' }}>
                  dark_mode
                </span>
                Koyu
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-primary text-white dark:text-background-dark border-primary font-medium'
                    : 'bg-white dark:bg-white/5 border-gray-300 dark:border-[#32675a] text-gray-600 dark:text-white/70 hover:border-primary/50'
                }`}
              >
                <span className="material-symbols-outlined mr-2" style={{ fontSize: 20, verticalAlign: 'middle' }}>
                  light_mode
                </span>
                Açık
              </button>
            </div>
          </div>
        </div>

        {/* Hakkında */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Hakkında</h3>
          <div className="space-y-2 text-gray-600 dark:text-white/60">
            <p>
              <span className="text-gray-800 dark:text-white/80">Versiyon:</span> 1.0.0
            </p>
            <p>
              <span className="text-gray-800 dark:text-white/80">Geliştirici:</span> HabitTracker Team
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
