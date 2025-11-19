import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider.jsx';

function ThemeMenu({ showLabel = false }) {
  const { mode, toggleMode, themeId, themes, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      {showLabel && <span className="hidden text-xs uppercase tracking-[0.3em] sm:inline">Tema</span>}
      <div className="flex items-center gap-1 rounded-full border border-border bg-card-deep/60 px-2 py-1">
        {themes.map((theme) => {
          const swatchColor = theme.colors.dark.primary;
          const isActive = themeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={`h-5 w-5 rounded-full border transition ${
                isActive ? 'border-foreground scale-110' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: `rgb(${swatchColor})` }}
              aria-label={`${theme.label} temasını seç`}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={toggleMode}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card-deep/60 text-base text-foreground transition hover:border-primary hover:text-primary"
        aria-label="Tema modunu değiştir"
      >
        {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  );
}

export default ThemeMenu;
