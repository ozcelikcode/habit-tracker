import { useEffect, useState } from 'react';
import { Moon, Sun, Check } from 'lucide-react';
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
                  onClick={() => setSettings({ ...settings, accentColor: color.value })}
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

        {/* Hakkında */}
        <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#32675a] rounded-xl">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Hakkında</h3>
          <div className="space-y-2 text-gray-600 dark:text-white/60">
            <p>
              <span className="text-gray-800 dark:text-white/80">Versiyon:</span> 1.0.4
            </p>
            <p>
              <span className="text-gray-800 dark:text-white/80">Geliştirici:</span> ozcelik & Claude Opus 4.5
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
