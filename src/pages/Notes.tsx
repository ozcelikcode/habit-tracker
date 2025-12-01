import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
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
  default: { className: 'text-gray-800 dark:text-white', isDynamic: true },
  emerald: { className: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-white' },
  blue: { className: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/40 text-sky-900 dark:text-white' },
  amber: { className: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-white' },
  rose: { className: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-white' },
  slate: { className: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/40 text-slate-900 dark:text-white' },
};

function NoteCard({ note, onDelete, onNavigate, isOverlay = false, dragProps }: { note: NoteItem; onDelete?: (id: string) => void; onNavigate?: (id: string) => void; isOverlay?: boolean; dragProps?: any }) {
  const themeConfig = THEME_STYLES[note.theme] || THEME_STYLES.default;
  const isDynamicTheme = themeConfig.isDynamic;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isOverlay || !onNavigate) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-navigate]')) {
      return;
    }
    onNavigate(note.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-2xl border p-4 shadow-sm transition-all cursor-pointer group 
        ${isDynamicTheme ? 'bg-white dark:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] border-border-light dark:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]' : themeConfig.className}
        ${themeConfig.className}
        ${isOverlay ? 'shadow-xl scale-105 cursor-grabbing' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {note.category && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${isDynamicTheme ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white/80' : 'bg-black/5 dark:bg-white/10'}`}>
              <Tag size={14} />
              {note.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" data-no-navigate>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500"
              title="Sil"
              data-no-navigate
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            className={`p-1.5 rounded-lg ${isOverlay ? 'cursor-grabbing' : 'cursor-grab'} hover:bg-black/5 dark:hover:bg-white/10`}
            {...dragProps}
            data-no-navigate
          >
            <GripVertical size={16} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 text-lg font-semibold line-clamp-2">{note.title || 'Başlıksız'}</h3>
      <p className="mt-2 text-sm opacity-70 line-clamp-3">
        {note.plainText || 'İçerik yok'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs opacity-50">
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

function SortableNoteCard({ note, onDelete, onNavigate }: { note: NoteItem; onDelete: (id: string) => void; onNavigate: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <NoteCard 
        note={note} 
        onDelete={onDelete} 
        onNavigate={onNavigate} 
        dragProps={{ ...attributes, ...listeners }}
      />
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
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
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

  const activeNote = activeId ? notes.find(n => n.id === activeId) : null;

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
        <div className="rounded-2xl border border-dashed border-border-light dark:border-[#32675a] bg-white/60 dark:bg-white/5 p-16 text-center">
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
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
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
          <DragOverlay>
            {activeNote ? (
              <NoteCard note={activeNote} isOverlay />
            ) : null}
          </DragOverlay>
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
