import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NoteForm from '../components/NoteForm';
import type { NoteTheme } from '../utils/noteThemes';

interface NoteItem {
  id: string;
  title: string;
  category: string;
  theme: NoteTheme;
  content: any;
}

export default function NewNote() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<NoteItem | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem('custom-notes');
      if (stored) {
        try {
          const notes: NoteItem[] = JSON.parse(stored);
          const note = notes.find(n => n.id === id);
          if (note) {
            setInitialData(note);
          }
        } catch (e) {
          console.error('Not yüklenirken hata:', e);
        }
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-white/50">Yükleniyor...</div>
      </div>
    );
  }

  return <NoteForm initialData={initialData} />;
}
