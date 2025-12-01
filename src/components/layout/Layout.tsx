import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import { getSettings } from '../../api';
import { PomodoroProvider } from '../../context/PomodoroContext';
import PomodoroFooter from '../PomodoroFooter';

// Hex renginden koyu arka plan ve border rengi oluştur
function generateThemeColors(hexColor: string) {
  // Hex'i RGB'ye çevir
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // RGB'yi HSL'ye çevir
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  // Koyu arka plan için: aynı hue, düşük saturation, çok düşük lightness
  const bgDark = `hsl(${Math.round(h * 360)}, ${Math.round(s * 40)}%, 8%)`;
  // Border için: aynı hue, orta saturation, düşük lightness
  const borderDark = `hsl(${Math.round(h * 360)}, ${Math.round(s * 50)}%, 25%)`;
  
  return { bgDark, borderDark };
}

function applyAccentColor(accentColor: string) {
  const { bgDark, borderDark } = generateThemeColors(accentColor);
  
  document.documentElement.style.setProperty('--color-primary', accentColor);
  document.documentElement.style.setProperty('--color-bg-dark', bgDark);
  document.documentElement.style.setProperty('--color-border-dark', borderDark);
}

export default function Layout() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getSettings();
      setTheme(settings.theme as 'dark' | 'light');
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      
      // Apply accent color from settings
      if (settings.accentColor) {
        applyAccentColor(settings.accentColor);
      } else {
        applyAccentColor('#2EAC8A');
      }
    } catch {
      // Varsayılan koyu tema ve renk
      document.documentElement.classList.add('dark');
      applyAccentColor('#2EAC8A');
    }
  }

  // Tema ve accent renk değişikliğini dinle
  useEffect(() => {
    const handleThemeChange = () => {
      loadSettings();
    };
    const handleAccentChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.accentColor) {
        applyAccentColor(customEvent.detail.accentColor);
      }
    };
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('accentColorChange', handleAccentChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('accentColorChange', handleAccentChange);
    };
  }, []);

  return (
    <PomodoroProvider>
      <div 
        className={`relative flex h-auto min-h-screen w-full flex-col font-display transition-colors duration-300
          ${theme === 'dark' ? 'text-white/90' : 'bg-background-light text-gray-800'}`}
        style={theme === 'dark' ? { backgroundColor: 'var(--color-bg-dark)' } : undefined}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
              <Header theme={theme} />
              <main className="flex-1 mt-8 pb-24">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
        <PomodoroFooter />
      </div>
    </PomodoroProvider>
  );
}
