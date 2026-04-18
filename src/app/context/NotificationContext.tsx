'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: NotificationType;
}

interface ConfirmOptions {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'primary' | 'danger';
}

interface NotificationContextType {
    showToast: (message: string, type?: NotificationType) => void;
    showConfirm: (options: ConfirmOptions) => void;
    
    // Internal state for the Overlay component
    toasts: Toast[];
    removeToast: (id: string) => void;
    activeConfirm: ConfirmOptions | null;
    closeConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeConfirm, setActiveConfirm] = useState<ConfirmOptions | null>(null);
    const toastTimeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (toastTimeoutRefs.current[id]) {
            clearTimeout(toastTimeoutRefs.current[id]);
            delete toastTimeoutRefs.current[id];
        }
    }, []);

    const showToast = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        toastTimeoutRefs.current[id] = setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        setActiveConfirm(options);
    }, []);

    const closeConfirm = useCallback(() => {
        setActiveConfirm(null);
    }, []);

    const handleConfirm = useCallback(() => {
        if (activeConfirm) {
            activeConfirm.onConfirm();
            closeConfirm();
        }
    }, [activeConfirm, closeConfirm]);

    const handleCancel = useCallback(() => {
        if (activeConfirm?.onCancel) {
            activeConfirm.onCancel();
        }
        closeConfirm();
    }, [activeConfirm, closeConfirm]);

    return (
        <NotificationContext.Provider value={{ 
            showToast, 
            showConfirm, 
            toasts, 
            removeToast, 
            activeConfirm, 
            closeConfirm 
        }}>
            {children}
            
            {/* The actual Modal/Toast rendering will happen in a separate component 
                that we'll place in layout.tsx using this context. */}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
