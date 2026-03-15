import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
                  toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                  'bg-blue-50 border-blue-200 text-blue-800'}
              `}>
                {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-600" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-red-600" />}
                {toast.type === 'info' && <Info size={18} className="text-blue-600" />}
                
                <p className="text-xs font-bold uppercase tracking-wider flex-1">{toast.message}</p>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/5 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
