import { useState, useEffect } from 'react';

interface DurationPickerProps {
  value: number; // minutes
  onChange: (value: number) => void;
  onClose: () => void;
}

export default function DurationPicker({ value, onChange, onClose }: DurationPickerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (value) {
      setHours(Math.floor(value / 60));
      setMinutes(value % 60);
    }
  }, [value]);

  const handleConfirm = () => {
    onChange(hours * 60 + minutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-[320px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Süre Seçin</p>
        
        {/* Duration Display */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-5xl font-light text-gray-800 dark:text-white px-4 py-2 bg-primary/20 rounded-xl text-primary">
              {hours.toString().padStart(2, '0')}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Saat</span>
          </div>
          <span className="text-5xl font-light text-gray-800 dark:text-white">:</span>
          <div className="text-center">
            <div className="text-5xl font-light text-gray-800 dark:text-white px-4 py-2 bg-primary/20 rounded-xl text-primary">
              {minutes.toString().padStart(2, '0')}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Dakika</span>
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[15, 30, 45, 60, 90, 120].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setHours(Math.floor(mins / 60));
                setMinutes(mins % 60);
              }}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                hours * 60 + minutes === mins
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mins >= 60 ? `${mins / 60} sa` : `${mins} dk`}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Saat: {hours}</label>
            <input
              type="range"
              min="0"
              max="12"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Dakika: {minutes}</label>
            <input
              type="range"
              min="0"
              max="55"
              step="5"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-primary font-medium hover:opacity-80 transition-opacity"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
