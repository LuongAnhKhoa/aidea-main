import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);
  const showSuccess = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(dismissToast, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast, dismissToast]);

  const value = useMemo(() => ({ showSuccess }), [showSuccess]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        createPortal(
          <div className="success-toast" key={toast.id} role="status" aria-live="polite">
            <span className="success-toast-icon" aria-hidden="true">✓</span>
            <span>{toast.message}</span>
            <button type="button" onClick={dismissToast} aria-label="Đóng thông báo">×</button>
          </div>,
          document.body,
        )
      )}
    </ToastContext.Provider>
  );
}
