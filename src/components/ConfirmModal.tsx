import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
    },
    warning: {
      icon: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500'
    },
    info: {
      icon: 'text-[var(--color-primary)]',
      button: 'bg-[var(--color-primary)] hover:opacity-90 focus:ring-[var(--color-primary)]'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-[var(--color-primary)]/10'
          }`}>
            <AlertTriangle className={styles.icon} size={24} />
          </div>

          {/* Content */}
          <h3 
            id="modal-title" 
            className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium
                bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200
                hover:bg-gray-200 dark:hover:bg-zinc-600
                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-800
                transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-800
                transition-colors ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
