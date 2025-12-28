import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const duration = toast.duration || 5000;
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onClose]);

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
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${bgColors[toast.type]} animate-fade-in shadow-lg min-w-[300px] max-w-md`}
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
    );
};

export const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({
    toasts,
    onClose,
}) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onClose={onClose} />
                </div>
            ))}
        </div>
    );
};

