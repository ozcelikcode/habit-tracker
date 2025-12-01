import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Type, Hash, Trash2, Edit } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

type NoteTheme = 'default' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';

interface NoteItem {
  id: string;
  title: string;
  category: string;
  theme: NoteTheme;
  content: any;
  plainText: string;
  createdAt: string;
  charCount: number;
  sentenceCount: number;
}

// Zarif, koyu tonlu tema renkleri
const THEME_STYLES: Record<NoteTheme, { bg: string; border: string; accent: string; isDynamic?: boolean }> = {
  default: {
    bg: '',
    border: '',
    accent: 'var(--color-primary)',
    isDynamic: true
  },
  emerald: { 
    bg: 'bg-emerald-950/40 dark:bg-emerald-950/50', 
    border: 'border-emerald-800/50',
    accent: '#059669'
  },
  blue: { 
    bg: 'bg-sky-950/40 dark:bg-sky-950/50', 
    border: 'border-sky-800/50',
    accent: '#0284c7'
  },
  amber: { 
    bg: 'bg-amber-950/40 dark:bg-amber-950/50', 
    border: 'border-amber-800/50',
    accent: '#d97706'
  },
  rose: { 
    bg: 'bg-rose-950/40 dark:bg-rose-950/50', 
    border: 'border-rose-800/50',
    accent: '#e11d48'
  },
  slate: { 
    bg: 'bg-slate-800/40 dark:bg-slate-800/50', 
    border: 'border-slate-700/50',
    accent: '#475569'
  },
};

// Editor.js bloklarını HTML'e dönüştür
function renderBlocks(blocks: any[]): React.ReactNode[] {
  if (!blocks || !Array.isArray(blocks)) return [];
  
  return blocks.map((block, index) => {
    const key = `block-${index}`;
    
    switch (block.type) {
      case 'header': {
        const level = block.data?.level || 2;
        const text = block.data?.text || '';
        const alignment = block.tunes?.alignment?.alignment || 'left';
        const style = { textAlign: alignment as 'left' | 'center' | 'right' };
        
        if (level === 1) return <h1 key={key} style={style} className="text-3xl font-bold text-gray-900 dark:text-white mb-4" dangerouslySetInnerHTML={{ __html: text }} />;
        if (level === 2) return <h2 key={key} style={style} className="text-2xl font-bold text-gray-900 dark:text-white mb-3" dangerouslySetInnerHTML={{ __html: text }} />;
        return <h3 key={key} style={style} className="text-xl font-semibold text-gray-900 dark:text-white mb-3" dangerouslySetInnerHTML={{ __html: text }} />;
      }
      
      case 'paragraph': {
        const text = block.data?.text || '';
        const alignment = block.tunes?.alignment?.alignment || 'left';
        if (!text.trim()) return <div key={key} className="h-4" />;
        return (
          <p 
            key={key} 
            style={{ textAlign: alignment as 'left' | 'center' | 'right' }}
            className="text-gray-700 dark:text-white/80 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      
      case 'list': {
        const items = block.data?.items || [];
        const listStyle = block.data?.style || 'unordered';
        const ListTag = listStyle === 'ordered' ? 'ol' : 'ul';
        const listClass = listStyle === 'ordered' 
          ? 'list-decimal list-inside space-y-1 mb-3 text-gray-700 dark:text-white/80'
          : 'list-disc list-inside space-y-1 mb-3 text-gray-700 dark:text-white/80';
        
        return (
          <ListTag key={key} className={listClass}>
            {items.map((item: any, i: number) => {
              const content = typeof item === 'string' ? item : item?.content || '';
              return <li key={i} dangerouslySetInnerHTML={{ __html: content }} />;
            })}
          </ListTag>
        );
      }
      
      case 'quote': {
        const text = block.data?.text || '';
        const caption = block.data?.caption || '';
        return (
          <blockquote key={key} className="border-l-4 border-primary pl-4 py-2 mb-3 bg-white/5 rounded-r-lg">
            <p className="text-gray-700 dark:text-white/80 italic" dangerouslySetInnerHTML={{ __html: text }} />
            {caption && <cite className="text-sm text-gray-500 dark:text-white/50 mt-1 block">— {caption}</cite>}
          </blockquote>
        );
      }
      
      case 'delimiter':
        return <hr key={key} className="my-6 border-gray-300 dark:border-white/20" />;
      
      default:
        return null;
    }
  }).filter(Boolean);
}

export default function ViewNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('custom-notes');
    if (stored) {
      try {
        const notes: NoteItem[] = JSON.parse(stored);
        const found = notes.find((n) => n.id === id);
        setNote(found || null);
      } catch {
        setNote(null);
      }
    }
    setLoading(false);
  }, [id]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!note) return;
    const stored = localStorage.getItem('custom-notes');
    if (stored) {
      const notes: NoteItem[] = JSON.parse(stored);
      const updated = notes.filter((n) => n.id !== note.id);
      localStorage.setItem('custom-notes', JSON.stringify(updated));
      navigate('/notes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Not bulunamadı</h2>
          <p className="text-gray-600 dark:text-white/60 mb-6">Bu not silinmiş veya mevcut değil.</p>
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white dark:text-background-dark rounded-lg font-medium hover:opacity-90"
          >
            <ArrowLeft size={18} />
            Notlara Dön
          </Link>
        </div>
      </div>
    );
  }

  const themeStyle = THEME_STYLES[note.theme] || THEME_STYLES.default;
  const blocks = note.content?.blocks || [];
  const isDynamicTheme = themeStyle.isDynamic;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/notes')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white/70"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <Link
            to={`/notes/${id}/edit`}
            className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
            title="Düzenle"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
            title="Sil"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Note Card */}
      <div 
        className={`rounded-2xl border p-6 md:p-8 ${
          isDynamicTheme 
            ? 'border-[var(--color-border-dark)]' 
            : `${themeStyle.bg} ${themeStyle.border}`
        }`}
        style={isDynamicTheme ? {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
        } : undefined}
      >
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {note.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-500 dark:text-white/50">
          {note.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5">
              <Hash size={14} />
              {note.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {note.createdAt}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Type size={14} />
            {note.charCount} karakter
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-white/10 mb-6" />

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {blocks.length > 0 ? (
            renderBlocks(blocks)
          ) : (
            <p className="text-gray-500 dark:text-white/50 italic">Bu notta içerik bulunmuyor.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Notu Sil"
        message="Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        variant="danger"
      />
    </div>
  );
}
