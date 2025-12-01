import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, CalendarClock, GripVertical, Tag, StickyNote, Trash2 } from 'lucide-react';
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

// Zarif, koyu tonlu tema renkleri - tüm kart boyancak
const THEME_STYLES: Record<NoteTheme, { className: string; isDynamic?: boolean }> = {
  default: { className: '', isDynamic: true },
  emerald: { className: 'bg-emerald-950/60 border-emerald-800/40 hover:border-emerald-700/60' },
  blue: { className: 'bg-sky-950/60 border-sky-800/40 hover:border-sky-700/60' },
  amber: { className: 'bg-amber-950/60 border-amber-800/40 hover:border-amber-700/60' },
  rose: { className: 'bg-rose-950/60 border-rose-800/40 hover:border-rose-700/60' },
  slate: { className: 'bg-slate-900/60 border-slate-700/40 hover:border-slate-600/60' },
};

function SortableNoteCard({ note, onDelete, onNavigate }: { note: NoteItem; onDelete: (id: string) => void; onNavigate: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });
  
  const themeConfig = THEME_STYLES[note.theme] || THEME_STYLES.default;
  const isDynamicTheme = themeConfig.isDynamic;
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDynamicTheme ? {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
      borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
    } : {})
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Eğer sürükleme butonuna veya silme butonuna tıklandıysa navigate etme
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-navigate]')) {
      return;
    }
    onNavigate(note.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={`rounded-2xl border p-4 shadow-sm transition-all cursor-pointer group 
        ${isDynamicTheme ? '' : themeConfig.className}
        ${isDragging ? 'opacity-50 scale-105' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {note.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white/80">
              <Tag size={14} />
              {note.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" data-no-navigate>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all"
            title="Sil"
            data-no-navigate
          >
            <Trash2 size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 cursor-grab"
            {...attributes}
            {...listeners}
            data-no-navigate
          >
            <GripVertical size={16} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-white line-clamp-2">{note.title || 'Başlıksız'}</h3>
      <p className="mt-2 text-sm text-white/60 line-clamp-3">
        {note.plainText || 'İçerik yok'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/40">
        <span className="inline-flex items-center gap-1">
          <CalendarClock size={14} />
          {note.createdAt}
        </span>
        <span>|</span>
        <span>{note.charCount} karakter</span>
        <span>|</span>
        <span>{note.sentenceCount} cümle</span>
      </div>
    </div>
  );
}

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem('custom-notes');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; noteId: string | null }>({
    isOpen: false,
    noteId: null
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save to localStorage only after initialization and when notes change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('custom-notes', JSON.stringify(notes));
    }
  }, [notes, isInitialized]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setNotes((items) => {
      const oldIndex = items.findIndex((n) => n.id === active.id);
      const newIndex = items.findIndex((n) => n.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleDeleteNote = (id: string) => {
    setDeleteModal({ isOpen: true, noteId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.noteId) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteModal.noteId));
    }
    setDeleteModal({ isOpen: false, noteId: null });
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, noteId: null });
  };

  const handleNavigateToNote = (id: string) => {
    navigate(`/notes/${id}`);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-gray-800 dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">
            Notlar
          </h1>
          <p className="text-gray-600 dark:text-white/60 mt-2">
            Notlarını kategorize et ve sürükleyerek yeniden sırala.
          </p>
        </div>
        <Link
          to="/notes/new"
          className="flex items-center gap-2 bg-primary text-white dark:text-background-dark font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Not Ekle
        </Link>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#32675a] bg-white/60 dark:bg-white/5 p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <StickyNote size={32} className="text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Henüz not eklenmemiş
          </h3>
          <p className="text-gray-600 dark:text-white/60 mb-6">
            İlk notunu ekleyerek başla.
          </p>
          <Link
            to="/notes/new"
            className="inline-flex items-center gap-2 bg-primary text-white dark:text-background-dark font-semibold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Not Ekle
          </Link>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <SortableNoteCard 
                  key={note.id} 
                  note={note} 
                  onDelete={handleDeleteNote}
                  onNavigate={handleNavigateToNote}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Notu Sil"
        message="Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
}
