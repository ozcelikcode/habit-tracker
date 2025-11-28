import { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string; // "HH:MM" format
  onChange: (value: string) => void;
  onClose: () => void;
  title?: string;
}

export default function TimePicker({ value, onChange, onClose, title = 'Saat Seçin' }: TimePickerProps) {
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [selectingHours, setSelectingHours] = useState(true);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  const handleConfirm = () => {
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onChange(timeStr);
    onClose();
  };

  // Dakika seçenekleri
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleClockClick = (num: number) => {
    if (selectingHours) {
      setHours(num);
      setTimeout(() => setSelectingHours(false), 200);
    } else {
      setMinutes(num);
    }
  };

  // Saat için açı hesapla (12 saatlik kadran, 0-11 ve 12-23)
  const getHourAngle = (hour: number) => {
    const h = hour % 12;
    return (h * 30) - 90;
  };

  // Dakika için açı hesapla
  const getMinuteAngle = (minute: number) => {
    return (minute / 60) * 360 - 90;
  };

  const selectedAngle = selectingHours 
    ? getHourAngle(hours)
    : getMinuteAngle(minutes);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-[340px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{title}</p>
        
        {/* Time Display */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <button
            onClick={() => setSelectingHours(true)}
            className={`text-5xl font-light px-4 py-2 rounded-xl transition-colors ${
              selectingHours 
                ? 'bg-primary text-white' 
                : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {hours.toString().padStart(2, '0')}
          </button>
          <span className="text-5xl font-light text-gray-800 dark:text-white">:</span>
          <button
            onClick={() => setSelectingHours(false)}
            className={`text-5xl font-light px-4 py-2 rounded-xl transition-colors ${
              !selectingHours 
                ? 'bg-primary text-white' 
                : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {minutes.toString().padStart(2, '0')}
          </button>
        </div>

        {/* Clock Face */}
        <div className="relative w-[260px] h-[260px] mx-auto mb-6">
          {/* Clock background */}
          <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700" />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-20" />
          
          {/* Clock hand */}
          <div 
            className="absolute top-1/2 left-1/2 origin-left h-0.5 bg-primary z-10"
            style={{
              width: selectingHours ? (hours >= 12 ? '60px' : '85px') : '85px',
              transform: `rotate(${selectedAngle}deg)`,
              transformOrigin: '0 50%',
            }}
          />
          
          {/* Selected indicator dot */}
          <div 
            className="absolute w-10 h-10 bg-primary rounded-full z-10 flex items-center justify-center"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${selectedAngle}deg) translateX(${selectingHours ? (hours >= 12 ? 60 : 85) : 85}px) rotate(${-selectedAngle}deg)`,
            }}
          >
            <span className="text-white text-sm font-medium">
              {selectingHours ? hours : minutes.toString().padStart(2, '0')}
            </span>
          </div>

          {selectingHours ? (
            <>
              {/* Outer ring: 0-11 */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
                const angle = (num * 30) - 90;
                const isSelected = hours === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleClockClick(num)}
                    className={`absolute w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors z-15 ${
                      isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'
                    }`}
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(100px) rotate(${-angle}deg)`,
                    }}
                  >
                    {num === 0 ? '00' : num}
                  </button>
                );
              })}
              {/* Inner ring: 12-23 */}
              {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((num) => {
                const angle = ((num - 12) * 30) - 90;
                const isSelected = hours === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleClockClick(num)}
                    className={`absolute w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors z-15 ${
                      isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'
                    }`}
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(65px) rotate(${-angle}deg)`,
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </>
          ) : (
            /* Minutes */
            minuteNumbers.map((num, index) => {
              const angle = (index * 30) - 90;
              const isSelected = minutes === num;
              return (
                <button
                  key={num}
                  onClick={() => handleClockClick(num)}
                  className={`absolute w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors z-15 ${
                    isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'
                  }`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(100px) rotate(${-angle}deg)`,
                  }}
                >
                  {num.toString().padStart(2, '0')}
                </button>
              );
            })
          )}
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
