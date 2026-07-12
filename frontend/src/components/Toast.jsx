import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TONE_CLASSES = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-brand',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex animate-toastIn items-start gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 shadow-popover"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${TONE_CLASSES[t.type]}`} />
              <p className="flex-1 text-sm text-text">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-text-secondary hover:text-text">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
