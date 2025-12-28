import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const duration = toast.duration || (toast.type === 'error' ? 7000 : 5000);
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, toast.type, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-cyber-green" />,
        error: <XCircle className="w-5 h-5 text-cyber-red" />,
        warning: <AlertTriangle className="w-5 h-5 text-cyber-yellow" />,
        info: <Info className="w-5 h-5 text-cyber-blue" />,
    };

    const bgColors = {
        success: 'bg-cyber-green/10 border-cyber-green/30',
        error: 'bg-cyber-red/10 border-cyber-red/30',
        warning: 'bg-cyber-yellow/10 border-cyber-yellow/30',
        info: 'bg-cyber-blue/10 border-cyber-blue/30',
    };

    return (
        <div className="pointer-events-auto animate-fade-in">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg min-w-[300px] max-w-md ${bgColors[toast.type]}`}
                role="alert"
            >
                {icons[toast.type]}
                <p className="flex-1 text-sm text-foreground">{toast.message}</p>
                <button
                    onClick={() => onClose(toast.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration || 7000);
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

