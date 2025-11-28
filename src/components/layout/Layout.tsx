import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import { getSettings } from '../../api';

export default function Layout() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const settings = await getSettings();
      setTheme(settings.theme as 'dark' | 'light');
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    } catch {
      // Varsayılan koyu tema
      document.documentElement.classList.add('dark');
    }
  }

  // Tema değişikliğini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      loadTheme();
    };
    window.addEventListener('themeChange', handleStorageChange);
    return () => window.removeEventListener('themeChange', handleStorageChange);
  }, []);

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col font-display
      ${theme === 'dark' ? 'bg-background-dark text-white/90' : 'bg-background-light text-gray-800'}`}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            <Header theme={theme} />
            <main className="flex-1 mt-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
