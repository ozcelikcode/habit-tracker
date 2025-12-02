export type NoteTheme = 'default' | 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';

export interface ThemeDefinition {
  id: NoteTheme;
  label: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string; // For icons/buttons
    hover: string; // For interactive elements
  };
}

export const NOTE_THEMES: Record<NoteTheme, ThemeDefinition> = {
  default: {
    id: 'default',
    label: 'Varsayılan',
    colors: {
      bg: 'bg-primary/5 dark:bg-primary/5',
      border: 'border-primary/20 dark:border-primary/20',
      text: 'text-gray-900 dark:text-gray-100',
      textMuted: 'text-gray-500 dark:text-gray-400',
      accent: 'text-primary',
      hover: 'hover:bg-primary/10 dark:hover:bg-primary/10',
    },
  },
  emerald: {
    id: 'emerald',
    label: 'Doğa',
    colors: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
      border: 'border-emerald-200/60 dark:border-emerald-800/50',
      text: 'text-emerald-900 dark:text-emerald-100',
      textMuted: 'text-emerald-600/80 dark:text-emerald-400/80',
      accent: 'text-emerald-600 dark:text-emerald-400',
      hover: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30',
    },
  },
  blue: {
    id: 'blue',
    label: 'Okyanus',
    colors: {
      bg: 'bg-sky-50/80 dark:bg-sky-950/30',
      border: 'border-sky-200/60 dark:border-sky-800/50',
      text: 'text-sky-900 dark:text-sky-100',
      textMuted: 'text-sky-600/80 dark:text-sky-400/80',
      accent: 'text-sky-600 dark:text-sky-400',
      hover: 'hover:bg-sky-100/50 dark:hover:bg-sky-900/30',
    },
  },
  amber: {
    id: 'amber',
    label: 'Güneş',
    colors: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/30',
      border: 'border-amber-200/60 dark:border-amber-800/50',
      text: 'text-amber-900 dark:text-amber-100',
      textMuted: 'text-amber-700/80 dark:text-amber-400/80',
      accent: 'text-amber-600 dark:text-amber-400',
      hover: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
    },
  },
  rose: {
    id: 'rose',
    label: 'Kiraz',
    colors: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/30',
      border: 'border-rose-200/60 dark:border-rose-800/50',
      text: 'text-rose-900 dark:text-rose-100',
      textMuted: 'text-rose-700/80 dark:text-rose-400/80',
      accent: 'text-rose-600 dark:text-rose-400',
      hover: 'hover:bg-rose-100/50 dark:hover:bg-rose-900/30',
    },
  },
  violet: {
    id: 'violet',
    label: 'Lavanta',
    colors: {
      bg: 'bg-violet-50/80 dark:bg-violet-950/30',
      border: 'border-violet-200/60 dark:border-violet-800/50',
      text: 'text-violet-900 dark:text-violet-100',
      textMuted: 'text-violet-600/80 dark:text-violet-400/80',
      accent: 'text-violet-600 dark:text-violet-400',
      hover: 'hover:bg-violet-100/50 dark:hover:bg-violet-900/30',
    },
  },
};
