import { useToast } from '../../context/ToastContext.tsx';

const typeStyles = {
  success: 'border-l-verified-500 bg-verified-50 text-verified-800',
  error: 'border-l-error-500 bg-error-50 text-error-800',
  info: 'border-l-primary-500 bg-primary-50 text-primary-800',
};

const typeIcons = {
  success: '\u2713',
  error: '\u2716',
  info: '\u2139',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-elevated animate-slide-up ${typeStyles[toast.type]}`}
        >
          <span className="text-sm font-bold shrink-0">{typeIcons[toast.type]}</span>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 text-current opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
