import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, Check, Plus } from 'lucide-react';

type NoteTheme = 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';

// Editor container ref ile bağlanacak

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

const THEME_CLASSES: Record<NoteTheme, { bg: string; name: string }> = {
  emerald: { bg: '#10B981', name: 'Zümrüt' },
  blue: { bg: '#0EA5E9', name: 'Mavi' },
  amber: { bg: '#F59E0B', name: 'Amber' },
  rose: { bg: '#F43F5E', name: 'Gül' },
  slate: { bg: '#475569', name: 'Gri' },
};

function formatDateHuman(date: Date) {
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countSentences(text: string) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;
  const parts = cleaned.split(/[.!?]+/).filter(Boolean);
  return parts.length;
}

function extractPlainText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  const texts: string[] = [];
  
  for (const block of blocks) {
    if (!block || !block.data) continue;
    
    // Paragraph ve Header blokları
    if (block.data.text) {
      const text = String(block.data.text).replace(/<[^>]*>/g, '').trim();
      if (text) texts.push(text);
    }
    
    // List blokları
    if (block.data.items && Array.isArray(block.data.items)) {
      for (const item of block.data.items) {
        let itemText = '';
        if (typeof item === 'string') {
          itemText = item;
        } else if (item && item.content) {
          itemText = String(item.content);
        }
        const cleaned = itemText.replace(/<[^>]*>/g, '').trim();
        if (cleaned) texts.push(cleaned);
      }
    }
    
    // Quote blokları - hem text hem caption
    if (block.data.text && block.type === 'quote') {
      const quoteText = String(block.data.text).replace(/<[^>]*>/g, '').trim();
      if (quoteText) texts.push(quoteText);
    }
    if (block.data.caption) {
      const caption = String(block.data.caption).replace(/<[^>]*>/g, '').trim();
      if (caption) texts.push(caption);
    }
  }
  
  return texts.join(' ').trim();
}

export default function NewNote() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(['Kişisel', 'İş', 'Sağlık', 'Hobi']);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [theme, setTheme] = useState<NoteTheme>('emerald');
  const [saving, setSaving] = useState(false);
  
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInitialized = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load categories from localStorage
  useEffect(() => {
    const storedCategories = localStorage.getItem('custom-note-categories');
    if (storedCategories) {
      try {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed)) {
          setCategories(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('custom-note-categories', JSON.stringify(categories));
  }, [categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
        setShowNewCategoryInput(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Editor.js - only once and using element holder
  useEffect(() => {
    if (editorInitialized.current) return;
    const container = editorContainerRef.current;
    if (!container) return;

    // Temizle ve başlat
    container.innerHTML = '';
    editorInitialized.current = true;
    let editorInstance: any = null;
    let isMounted = true;

    (async () => {
      try {
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Quote = (await import('@editorjs/quote')).default;
        const Marker = (await import('@editorjs/marker')).default;
        const Underline = (await import('@editorjs/underline')).default;
        const Delimiter = (await import('@editorjs/delimiter')).default;
        const AlignmentTuneTool = (await import('editorjs-text-alignment-blocktune')).default;

        if (!isMounted) return;

        editorInstance = new EditorJS({
          holder: container,
          autofocus: true,
          placeholder: 'Notunuzu yazmaya başlayın...',
          tools: {
            header: {
              class: Header,
              inlineToolbar: ['bold', 'italic'],
              config: { levels: [1, 2, 3], defaultLevel: 2 },
              tunes: ['alignment'],
            },
            list: {
              class: List,
              inlineToolbar: true,
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
            },
            marker: Marker,
            underline: Underline,
            delimiter: Delimiter,
            alignment: {
              class: AlignmentTuneTool,
              config: {
                default: 'left',
                blocks: {
                  header: 'center',
                  paragraph: 'left',
                },
              },
            },
          },
          inlineToolbar: ['bold', 'italic', 'underline', 'marker'],
        } as any);

        await editorInstance.isReady;
        if (isMounted) {
          editorRef.current = editorInstance;
        }
      } catch (error) {
        console.error('Editor.js başlatma hatası:', error);
      }
    })();

    return () => {
      isMounted = false;
      if (editorInstance && typeof editorInstance.destroy === 'function') {
        try {
          editorInstance.destroy();
        } catch {}
      }
      editorRef.current = null;
      editorInitialized.current = false;
    };
  }, []);

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
    }
    setCategory(name);
    setNewCategory('');
    setShowNewCategoryInput(false);
    setShowCategoryDropdown(false);
  };

  async function handleSaveNote() {
    if (saving) return;
    
    setSaving(true);
    
    try {
      let savedData = { blocks: [] };
      
      // Editor varsa içeriği al
      if (editorRef.current) {
        try {
          await editorRef.current.isReady;
          savedData = await editorRef.current.save();
        } catch (e) {
          console.warn('Editor save hatası:', e);
        }
      }
      
      console.log('Editor saved data:', savedData); // Debug için
      
      const plainText = extractPlainText(savedData.blocks);
      console.log('Extracted plain text:', plainText); // Debug için
      
      const charCount = plainText.length;
      const sentenceCount = countSentences(plainText);
      const createdAt = formatDateHuman(new Date());

      const newNote: NoteItem = {
        id: crypto.randomUUID(),
        title: title.trim() || 'Başlıksız',
        category: category.trim(),
        theme,
        content: savedData,
        plainText: plainText.trim(),
        createdAt,
        charCount,
        sentenceCount,
      };

      // Load existing notes and add new one
      const stored = localStorage.getItem('custom-notes');
      const existingNotes: NoteItem[] = stored ? JSON.parse(stored) : [];
      const updatedNotes = [newNote, ...existingNotes];
      localStorage.setItem('custom-notes', JSON.stringify(updatedNotes));

      // Navigate back to notes list
      navigate('/notes');
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notes')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white/70"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-gray-800 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Yeni Not
            </h1>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-1">
              Zengin metin editörü ile notunu oluştur
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSaveNote}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white dark:text-background-dark font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <Save size={18} />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 dark:border-[#32675a] bg-white dark:bg-white/5 p-6 shadow-sm">
        {/* Title & Category & Theme Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Başlık
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-[#32675a] bg-white dark:bg-white/5 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Örn: Haftalık hedefler"
            />
          </div>

          {/* Category - Custom Dropdown */}
          <div ref={dropdownRef}>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Kategori
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowNewCategoryInput(false);
                }}
                className="w-full flex items-center justify-between rounded-xl border border-gray-300 dark:border-[#32675a] bg-white dark:bg-white/5 px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <span className={category ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-white/30'}>
                  {category || 'Kategori seç'}
                </span>
                <ChevronDown size={16} className={`text-gray-400 dark:text-white/40 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 dark:border-[#32675a] bg-white dark:bg-[#1a3830] shadow-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {/* Clear selection */}
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('');
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      Kategori seçilmedi
                    </button>
                    
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-between"
                      >
                        {cat}
                        {category === cat && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                  
                  {/* Add new category */}
                  <div className="border-t border-gray-200 dark:border-[#32675a]">
                    {showNewCategoryInput ? (
                      <div className="p-3 flex gap-2">
                        <input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          className="flex-1 rounded-lg border border-gray-300 dark:border-[#32675a] bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Yeni kategori adı"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-2 rounded-lg bg-primary text-white dark:text-background-dark text-sm font-medium hover:opacity-90"
                        >
                          Ekle
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(true)}
                        className="w-full px-4 py-3 text-left text-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Yeni kategori ekle
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
              Tema Rengi
            </label>
            <div className="flex gap-2 items-center h-[46px]">
              {(Object.keys(THEME_CLASSES) as NoteTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    theme === t 
                      ? 'scale-110 border-primary ring-2 ring-primary/30' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: THEME_CLASSES[t].bg }}
                  title={THEME_CLASSES[t].name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2 block">
            İçerik
          </label>
          <div
            ref={editorContainerRef}
            className="min-h-[400px] rounded-xl border border-gray-200 dark:border-[#32675a] bg-white dark:bg-white/5 p-4"
          />
        </div>

        {/* Tips */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-white/50">
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">H1/H2/H3</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">Kalın</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">İtalik</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">Vurgu</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">Altı çizili</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">Liste</span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">Alıntı</span>
        </div>
      </div>
    </div>
  );
}
