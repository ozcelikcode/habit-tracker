import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, Check, Plus, AlertCircle, Trash2, Edit2, X } from 'lucide-react';
import { NOTE_THEMES, type NoteTheme } from '../utils/noteThemes';

interface NoteFormProps {
  initialData?: {
    id: string;
    title: string;
    category: string;
    theme: NoteTheme;
    content: any;
  };
}

function countSentences(text: string) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;
  const parts = cleaned.split(/[.!?]+/).filter(Boolean);
  return parts.length;
}

function formatDateHuman(date: Date) {
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function extractPlainText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  const texts: string[] = [];
  
  for (const block of blocks) {
    if (!block || !block.data) continue;
    
    if (block.data.text) {
      const text = String(block.data.text).replace(/<[^>]*>/g, '').trim();
      if (text) texts.push(text);
    }
    
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

export default function NoteForm({ initialData }: NoteFormProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem('custom-note-categories');
    return stored ? JSON.parse(stored) : ['Kişisel', 'İş', 'Sağlık', 'Hobi'];
  });
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ index: number; value: string } | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [theme, setTheme] = useState<NoteTheme>(initialData?.theme || 'default');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInitialized = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('custom-note-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
        setShowNewCategoryInput(false);
        setEditingCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editorInitialized.current) return;
    
    const container = editorContainerRef.current;
    if (!container) return;

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
          autofocus: !initialData,
          placeholder: 'Notunuzu yazmaya başlayın...',
          data: initialData?.content || undefined,
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
  }, [initialData]);

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

  const handleDeleteCategory = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const catToDelete = categories[index];
    setCategories(prev => prev.filter((_, i) => i !== index));
    if (category === catToDelete) setCategory('');
  };

  const handleStartEditCategory = (e: React.MouseEvent, index: number, val: string) => {
    e.stopPropagation();
    setEditingCategory({ index, value: val });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    const newName = editingCategory.value.trim();
    if (newName) {
      setCategories(prev => {
        const next = [...prev];
        next[editingCategory.index] = newName;
        return next;
      });
      if (category === categories[editingCategory.index]) {
        setCategory(newName);
      }
    }
    setEditingCategory(null);
  };

  async function handleSaveNote() {
    if (saving) return;
    
    const newErrors: { title?: string; content?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Başlık boş bırakılamaz';
    }
    
    let savedData = { blocks: [] as any[] };
    if (editorRef.current) {
      try {
        await editorRef.current.isReady;
        savedData = await editorRef.current.save();
      } catch (e) {
        console.warn('Editor save hatası:', e);
      }
    }
    
    const plainText = extractPlainText(savedData.blocks);
    
    if (!plainText.trim()) {
      newErrors.content = 'İçerik boş bırakılamaz';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setSaving(true);
    
    try {
      const charCount = plainText.length;
      const sentenceCount = countSentences(plainText);
      const createdAt = formatDateHuman(new Date());

      const stored = localStorage.getItem('custom-notes');
      const existingNotes: any[] = stored ? JSON.parse(stored) : [];
      
      let updatedNotes;
      
      if (initialData?.id) {
        updatedNotes = existingNotes.map(note => {
          if (note.id === initialData.id) {
            return {
              ...note,
              title: title.trim(),
              category: category.trim(),
              theme,
              content: savedData,
              plainText: plainText.trim(),
              charCount,
              sentenceCount,
            };
          }
          return note;
        });
      } else {
        const newNote = {
          id: crypto.randomUUID(),
          title: title.trim(),
          category: category.trim(),
          theme,
          content: savedData,
          plainText: plainText.trim(),
          createdAt,
          charCount,
          sentenceCount,
        };
        updatedNotes = [newNote, ...existingNotes];
      }

      localStorage.setItem('custom-notes', JSON.stringify(updatedNotes));
      navigate('/notes');
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    } finally {
      setSaving(false);
    }
  }

  const currentTheme = NOTE_THEMES[theme];

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
              {initialData ? 'Notu Düzenle' : 'Yeni Not'}
            </h1>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-1">
              Zengin metin editörü ile notunu {initialData ? 'düzenle' : 'oluştur'}
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

      <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${currentTheme.colors.bg} ${currentTheme.colors.border}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={`text-sm font-medium mb-2 block ${currentTheme.colors.textMuted}`}>
              Başlık
            </label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white/50 dark:bg-black/20 ${currentTheme.colors.text} ${currentTheme.colors.border} placeholder-gray-400 dark:placeholder-white/30 ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="Örn: Haftalık hedefler"
            />
            {errors.title && (
              <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs">
                <AlertCircle size={14} />
                {errors.title}
              </div>
            )}
          </div>

          <div ref={dropdownRef}>
            <label className={`text-sm font-medium mb-2 block ${currentTheme.colors.textMuted}`}>
              Kategori <span className="opacity-60 font-normal">(opsiyonel)</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowNewCategoryInput(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white/50 dark:bg-black/20 ${currentTheme.colors.border}`}
              >
                <span className={category ? currentTheme.colors.text : 'text-gray-400 dark:text-white/30'}>
                  {category || 'Kategori seç'}
                </span>
                <ChevronDown size={16} className={`text-gray-400 dark:text-white/40 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <div 
                  className="absolute z-20 mt-2 w-full rounded-xl border bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
                  style={{ borderColor: 'var(--color-border-dark)' }}
                >
                  <div className="max-h-60 overflow-y-auto">
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
                    
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        {editingCategory?.index === index ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              value={editingCategory.value}
                              onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                              className="flex-1 bg-transparent border-b border-primary outline-none text-sm text-gray-800 dark:text-white"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateCategory(); }} className="text-green-500"><Check size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingCategory(null); }} className="text-red-500"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className="flex-1 text-left text-sm text-gray-800 dark:text-white"
                            >
                              {cat}
                            </button>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {category === cat && <Check size={16} className="text-primary mr-2" />}
                              <button onClick={(e) => handleStartEditCategory(e, index, cat)} className="text-gray-400 hover:text-blue-500"><Edit2 size={14} /></button>
                              <button onClick={(e) => handleDeleteCategory(e, index)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className="border-t"
                    style={{ borderColor: 'var(--color-border-dark)' }}
                  >
                    {showNewCategoryInput ? (
                      <div className="p-3 flex gap-2 bg-gray-50 dark:bg-black/20">
                        <input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          className="flex-1 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div>
            <label className={`text-sm font-medium mb-2 block ${currentTheme.colors.textMuted}`}>
              Tema Rengi
            </label>
            <div className="flex gap-2 items-center h-[46px]">
              {(Object.keys(NOTE_THEMES) as NoteTheme[]).map((t) => {
                const themeConfig = NOTE_THEMES[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`h-9 w-9 rounded-full border-2 transition-all relative overflow-hidden ${
                      theme === t 
                        ? 'scale-110 ring-2 ring-offset-2 ring-primary border-transparent' 
                        : 'border-transparent hover:scale-105'
                    } ${themeConfig.colors.bg}`}
                    title={themeConfig.label}
                  >
                    {theme === t && (
                      <Check size={16} className={`absolute inset-0 m-auto ${themeConfig.colors.text}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className={`text-sm font-medium mb-2 block ${currentTheme.colors.textMuted}`}>
            İçerik
          </label>
          <div
            ref={editorContainerRef}
            className={`min-h-[400px] rounded-xl border p-4 transition-colors duration-300 bg-white/50 dark:bg-black/20 ${currentTheme.colors.text} ${currentTheme.colors.border} ${
              errors.content ? 'border-red-500' : ''
            }`}
          />
          {errors.content && (
            <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs">
              <AlertCircle size={14} />
              {errors.content}
            </div>
          )}
        </div>

        <div className={`mt-4 flex flex-wrap gap-2 text-xs ${currentTheme.colors.textMuted}`}>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">H1/H2/H3</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">Kalın</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">İtalik</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">Vurgu</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">Altı çizili</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">Liste</span>
          <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">Alıntı</span>
        </div>
      </div>
    </div>
  );
}
