'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { api, type StoreSettings } from '../../lib/api';

export default function AdminSettingsPage() {
    const { showToast } = useNotification();
    const { refreshSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [settings, setSettings] = useState<StoreSettings>({
        id: 0,
        storeName: '',
        supportEmail: '',
        phoneNumber: '',
        address: '',
        logoUrl: null,
        description: '',
        updatedAt: ''
    });
    const [initialSettings, setInitialSettings] = useState<StoreSettings | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getSettings();
            
            // Process logoUrl to ensure it's absolute if relative
            if (data.logoUrl && data.logoUrl.startsWith('/')) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
                data.logoUrl = `${apiBase}${data.logoUrl}`;
            }
            
            setSettings(data);
            setInitialSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
            showToast('Erreur lors du chargement des paramètres', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updatedData = await api.updateSettings(settings);
            
            // Sync with server response
            setSettings(updatedData);
            setInitialSettings(updatedData);
            
            await refreshSettings();
            showToast('Paramètres enregistrés avec succès !', 'success');
        } catch (error) {
            showToast('Erreur lors de l\'enregistrement', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (initialSettings) {
            setSettings(initialSettings);
            showToast('Modifications annulées.', 'info');
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const result = await api.uploadImage(file);
            
            // The result.url from backend is now relative (/uploads/...)
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            const absoluteLogoUrl = result.url.startsWith('/') ? `${apiBase}${result.url}` : result.url;

            // Update settings state - this makes it dirty so save buttons appear
            setSettings(prev => ({ ...prev, logoUrl: absoluteLogoUrl }));
            
            showToast('Logo téléchargé. Cliquez sur Enregistrer pour confirmer.', 'info');
        } catch (err) {
            console.error('Logo upload error:', err);
            showToast('Échec du téléchargement du logo', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveLogo = () => {
        setSettings(prev => ({ ...prev, logoUrl: null }));
        showToast('Logo retiré. Cliquez sur Enregistrer pour confirmer.', 'info');
    };

    const isDirty = initialSettings && JSON.stringify(settings) !== JSON.stringify(initialSettings);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500">Chargement des paramètres...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Settings</h1>
                </div>
            </header>

            <div className="p-10 max-w-5xl mx-auto pb-32">
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Store Information Card */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-[18px] font-black text-slate-800 mb-6">Store Information</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-600">Store Name</label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-600">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-600">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={settings.phoneNumber}
                                        onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[13px] font-bold text-slate-600">Address</label>
                                <textarea
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[13px] font-bold text-slate-600">Store Description (Footer)</label>
                                <textarea
                                    value={settings.description || ''}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    rows={4}
                                    placeholder="Enter a brief description of your store for the footer..."
                                    className="w-full p-4 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            <div className="pt-8 mb-4 border-t border-slate-100">
                                <h4 className="text-[13px] font-bold text-slate-600 mb-4">Store Logo</h4>
                                <div className="flex items-start gap-4">
                                    {/* Logo Preview */}
                                    <div className="size-[88px] rounded-xl bg-[#2a303c] flex items-center justify-center border border-slate-800 overflow-hidden shrink-0 mt-1 relative group">
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined text-[#10B981] text-2xl mb-1">spa</span>
                                                <span className="text-[6px] font-bold text-slate-300 tracking-wider uppercase">Droguerie</span>
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="h-9 px-6 rounded-lg bg-primary hover:opacity-90 text-white text-[13px] font-bold transition-opacity disabled:opacity-50"
                                                >
                                                    {isUploading ? 'Uploading...' : 'Change Logo'}
                                                </button>
                                                <input 
                                                    ref={fileInputRef}
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={handleLogoChange}
                                                />
                                            </div>
                                            {settings.logoUrl && (
                                                <button 
                                                    onClick={handleRemoveLogo}
                                                    disabled={isUploading}
                                                    className="h-9 px-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-bold transition-colors disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-400">JPG, PNG or SVG. Max size 2MB. Recommended: 512×512px</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Footer - Only shown if changes exist */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 md:px-10 z-30 flex items-center justify-end gap-4 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-5 duration-300">
                    <button 
                        onClick={handleDiscard}
                        className="h-12 px-6 rounded-xl font-black text-[14px] text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 rounded-xl bg-primary hover:opacity-90 text-white font-black text-[14px] transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving && <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
        </main>
    );
}


