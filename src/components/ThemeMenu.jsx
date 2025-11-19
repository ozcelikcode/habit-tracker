import { useTheme } from '../providers/ThemeProvider.jsx';

function ThemeMenu({ showLabel = false }) {
  const { mode, toggleMode, themeId, themes, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      {showLabel && <span className="hidden text-xs uppercase tracking-[0.3em] sm:inline">Tema</span>}
      <select
        value={themeId}
        onChange={(event) => setTheme(event.target.value)}
        className="rounded-full border border-border/70 bg-card-deep/60 px-3 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id} className="bg-background-alt text-foreground">
            {theme.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleMode}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card-deep/50 text-base text-foreground transition hover:border-primary hover:text-primary"
        aria-label="Tema modunu değiştir"
      >
        {mode === 'dark' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}

export default ThemeMenu;
