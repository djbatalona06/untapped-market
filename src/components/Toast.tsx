import { useStore } from '../store/useStore';

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.fading ? ' fading' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
