'use client';

import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Check, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export default function NotificationOverlay() {
    const { toasts, removeToast, activeConfirm, closeConfirm } = useNotification();

    return (
        <>
            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 max-w-md w-full sm:w-auto">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className={`group relative flex items-center gap-4 p-5 rounded-2xl border bg-white shadow-2xl animate-in slide-in-from-right-full fade-in duration-500 hover:scale-[1.02] transition-all cursor-pointer ${
                            toast.type === 'success' ? 'border-emerald-100 text-emerald-900' :
                            toast.type === 'error' ? 'border-red-100 text-red-900' :
                            'border-slate-200 text-slate-900'
                        }`}
                        onClick={() => removeToast(toast.id)}
                    >
                        {/* Icon Badge */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                            toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                            toast.type === 'error' ? 'bg-[#BF1737] text-white shadow-[#BF1737]/20' :
                            'bg-slate-500 text-white shadow-slate-500/20'
                        }`}>
                            {toast.type === 'success' && <Check size={18} strokeWidth={3} />}
                            {toast.type === 'error' && <AlertCircle size={18} strokeWidth={3} />}
                            {toast.type === 'info' && <Info size={18} strokeWidth={3} />}
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-[14px] font-black uppercase tracking-tight leading-tight mb-0.5">
                                {toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Erreur' : 'Information'}
                            </p>
                            <p className="text-[14px] font-medium opacity-60 leading-snug line-clamp-2">
                                {toast.message}
                            </p>
                        </div>

                        <button 
                            className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                        >
                            <X size={16} />
                        </button>
                        
                        {/* Progress Bar (Simulated) */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-10 rounded-b-2xl animate-toast-progress`} />
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {activeConfirm && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md bg-black/40">
                    <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        {/* Modal Header/Icon */}
                        <div className="bg-[#0D0D0D] p-10 text-center relative overflow-hidden">
                             {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#BF1737] opacity-[0.08] rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            
                            <div className="relative z-10">
                                <div className="h-20 w-20 rounded-full bg-[#BF1737]/10 flex items-center justify-center text-[#BF1737] mx-auto mb-6 border border-[#BF1737]/20 shadow-xl shadow-[#BF1737]/5">
                                    <AlertTriangle size={32} strokeWidth={2.5} className="animate-bounce-slow" />
                                </div>
                                <h3 className="text-[24px] font-black text-white uppercase tracking-tight leading-tight italic">
                                    {activeConfirm.title || 'Attention'}
                                </h3>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 text-center">
                            <p className="text-[17px] font-medium text-slate-500 leading-relaxed mb-10">
                                {activeConfirm.message}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <button 
                                    onClick={() => {
                                        activeConfirm.onConfirm();
                                        closeConfirm();
                                    }}
                                    className={`flex-1 rounded-2xl py-4 text-[13px] font-black text-white uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl ${
                                        activeConfirm.variant === 'danger' 
                                            ? 'bg-[#BF1737] hover:bg-[#D41C3D] shadow-[#BF1737]/20' 
                                            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                                    }`}
                                >
                                    {activeConfirm.confirmText || 'Confirmer'}
                                </button>
                                <button 
                                    onClick={() => {
                                        if (activeConfirm.onCancel) activeConfirm.onCancel();
                                        closeConfirm();
                                    }}
                                    className="flex-1 rounded-2xl bg-slate-100 py-4.5 text-[13px] font-black text-slate-600 uppercase tracking-[0.2em] transition-all hover:bg-slate-200 hover:text-slate-900"
                                >
                                    {activeConfirm.cancelText || 'Annuler'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
