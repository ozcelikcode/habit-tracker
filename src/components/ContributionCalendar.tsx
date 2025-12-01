import { useMemo, useState } from 'react';
import { StickyNote } from 'lucide-react';

interface CalendarProps {
  data: { completed_date: string; completed_count: number; total_count?: number }[];
  totalHabits: number;
  year: number;
  noteDates?: string[];
  onDayClick?: (info: { date: string; count: number; total: number; hasNote: boolean }) => void;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ContributionCalendar({ data, totalHabits, year, noteDates = [], onDayClick }: CalendarProps) {
  const noteDatesSet = useMemo(() => new Set(noteDates), [noteDates]);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  // Takvim verilerini oluştur
  const calendarCells = useMemo(() => {
    const cells: { date: string; level: number; count: number; total: number }[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Veriyi map'e çevir
    const dataMap = new Map<string, { completed: number; total: number }>();
    data.forEach((d) => {
      dataMap.set(d.completed_date, { completed: d.completed_count, total: d.total_count || totalHabits });
    });

    // Her gün için hücre oluştur
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = formatDate(current);
      const dayData = dataMap.get(dateStr) || { completed: 0, total: totalHabits };
      const count = dayData.completed;
      const total = dayData.total;

      // Seviye hesapla (0-10) - Sabit ölçek
      let level = 0;
      if (count > 0) {
        // 1-10 arası ölçeklendirme
        // Eğer total 0 ise (imkansız ama) 0 al
        if (total > 0) {
          const ratio = count / total;
          // 10 seviyeli ölçek: 0.1 -> 1, 1.0 -> 10
          level = Math.ceil(ratio * 10);
        } else {
          // Total yoksa eski mantık (max 4 gibi düşünelim ama burada 10'a map edelim)
          level = Math.min(10, count); 
        }
      }

      cells.push({ date: dateStr, level, count, total });
      current.setDate(current.getDate() + 1);
    }

    return cells;
  }, [data, totalHabits, year]);

  // Haftanın ilk gününe göre boş hücreler ekle
  const firstDayOffset = useMemo(() => {
    const firstDay = new Date(year, 0, 1).getDay();
    return firstDay;
  }, [year]);

  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; total: number; x: number; y: number } | null>(null);

  // Renk seviyeleri - dinamik CSS değişkenleri kullanır
  // 1-10 arası opacity ile
  const getLevelStyle = (level: number) => {
    if (level === 0) return {}; // Boş
    // Opacity 0.1'den 1.0'a kadar
    const opacity = Math.min(1, Math.max(0.1, level / 10));
    return {
      backgroundColor: `color-mix(in srgb, var(--color-primary) ${opacity * 100}%, transparent)`,
      borderColor: `color-mix(in srgb, var(--color-primary) ${Math.min(1, opacity + 0.2) * 100}%, transparent)`
    };
  };

  // Haftaları hesapla (53 hafta)
  const weeks = useMemo(() => {
    const result: { date: string; level: number; count: number; total: number }[][] = [];
    let currentWeek: { date: string; level: number; count: number; total: number }[] = [];
    
    // İlk hafta için boş günler ekle
    for (let i = 0; i < firstDayOffset; i++) {
      currentWeek.push({ date: '', level: -1, count: 0, total: 0 });
    }
    
    calendarCells.forEach((cell) => {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Son haftayı ekle
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', level: -1, count: 0, total: 0 });
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [calendarCells, firstDayOffset]);

  return (
    <div 
      className="p-3 sm:p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 rounded-xl overflow-x-auto"
      style={{ borderColor: 'var(--color-border-dark)' }}
    >
      {/* Ay isimleri */}
      <div className="flex text-[10px] sm:text-xs text-gray-500 dark:text-white/50 mb-2 min-w-[600px]">
        <div className="w-6 sm:w-8 flex-shrink-0" /> {/* Boşluk için */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
          {months.map((month, i) => {
            const monthStart = Math.floor((i * weeks.length) / 12);
            return (
              <span 
                key={month} 
                style={{ gridColumnStart: monthStart + 1 }}
                className="text-left"
              >
                {month}
              </span>
            );
          })}
        </div>
      </div>

      {/* Takvim grid */}
      <div className="flex min-w-[600px]">
        {/* Gün isimleri */}
        <div className="flex flex-col justify-around text-[10px] sm:text-xs text-gray-500 dark:text-white/50 pr-1 sm:pr-2 w-6 sm:w-8 flex-shrink-0">
          <span></span>
          <span>Pzt</span>
          <span></span>
          <span>Çar</span>
          <span></span>
          <span>Cum</span>
          <span></span>
        </div>
        
        {/* Hücreler */}
        <div className="flex-1 grid gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-[2px] sm:gap-[3px]">
              {week.map((cell, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`aspect-square rounded-[2px] sm:rounded-sm cursor-pointer transition-all hover:ring-1 sm:hover:ring-2 hover:ring-gray-400 dark:hover:ring-white/50 relative ${
                    cell.level === -1 ? 'bg-transparent cursor-default' : cell.level === 0 ? 'bg-gray-300 dark:bg-white/10' : ''
                  }`}
                  style={cell.level > 0 ? getLevelStyle(cell.level) : undefined}
                  onMouseEnter={(e) => {
                    if (cell.date) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({ date: cell.date, count: cell.count, total: cell.total, x: rect.left, y: rect.top });
                    }
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => {
                    if (cell.date) {
                      // Tooltip için seçili hücreyi sabitle
                      setHoveredCell(
                        hoveredCell?.date === cell.date
                          ? null
                          : { date: cell.date, count: cell.count, total: cell.total, x: 0, y: 0 }
                      );

                      // Parent bileşene tıklanan günü bildir
                      onDayClick?.({
                        date: cell.date,
                        count: cell.count,
                        total: cell.total,
                        hasNote: noteDatesSet.has(cell.date),
                      });
                    }
                  }}
                >
                  {/* Not göstergesi */}
                  {cell.date && noteDatesSet.has(cell.date) && (
                    <div className="absolute -top-0.5 -right-0.5 size-1.5 sm:size-2 bg-amber-400 rounded-full border border-white dark:border-background-dark" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between sm:justify-end items-center gap-2 mt-4 text-[10px] sm:text-xs text-gray-600 dark:text-white/50">
        <span>Az</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="size-2.5 sm:size-3 rounded-sm bg-gray-300 dark:bg-white/10" />
          {[2, 4, 6, 8, 10].map(level => (
             <div key={level} className="size-2.5 sm:size-3 rounded-sm" style={getLevelStyle(level)} />
          ))}
        </div>
        <span>Çok</span>
      </div>

      {/* Hover/Click Tooltip */}
      {hoveredCell && (
        <div 
          className="fixed z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg pointer-events-none max-w-[200px]"
          style={{ 
            left: Math.min(hoveredCell.x + 20, window.innerWidth - 220), 
            top: hoveredCell.y - 10,
          }}
        >
          <div className="font-medium">{new Date(hoveredCell.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="text-gray-300">
            {hoveredCell.count}/{hoveredCell.total} görev tamamlandı
          </div>
          {noteDatesSet.has(hoveredCell.date) && (
            <div className="flex items-center gap-1 text-amber-400 mt-1">
              <StickyNote size={12} />
              <span>1 not bırakıldı</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
