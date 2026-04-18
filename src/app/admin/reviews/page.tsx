'use client';

import React, { useState, useEffect } from 'react';
import { api, Review } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

export default function AdminReviewsPage() {
    const { showToast } = useNotification();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        loadReviews();
    }, [activeTab]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await api.getAllReviews(activeTab);
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            showToast('Erreur lors du chargement des avis.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
        try {
            await api.updateReviewStatus(id, status);
            showToast(`Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès.`, 'success');
            loadReviews(); // reload to reflect the tab's strict filtering
        } catch (error) {
            showToast('Erreur lors de la mise à jour du statut.', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis définitivement ?')) return;
        try {
            await api.deleteReview(id);
            showToast('Avis supprimé définitivement.', 'success');
            setReviews(reviews.filter((r) => r.id !== id));
        } catch (error) {
            showToast('Erreur lors de la suppression.', 'error');
        }
    };

    const tabs = [
        { key: 'pending', label: 'En attente', icon: 'hourglass_empty', count: reviews.length },
        { key: 'approved', label: 'Approuvés', icon: 'check_circle' },
        { key: 'rejected', label: 'Rejetés', icon: 'cancel' },
    ] as const;

    if (loading && reviews.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-20">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px]">reviews</span>
                        Avis Clients
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Gérez, approuvez ou rejetez les avis laissés par vos clients.
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0">
                <div className="max-w-[1200px] mx-auto">
                    
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-[13px] uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.key && tab.key === 'pending' && reviews.length > 0 && (
                                    <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px]">
                                        {reviews.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Review List */}
                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all hover:shadow-md">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{review.name}</h3>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: review.rating >= s ? '#FBBF24' : '#E2E8F0' }}>
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-[12px] text-slate-400 font-medium">({new Date(review.createdAt).toLocaleDateString('fr-FR')})</span>
                                        </div>
                                        <p className="text-[14px] text-slate-600 dark:text-slate-300 italic max-w-3xl leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                        <div className="mt-3 inline-block bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                            ID Produit: {review.product?.name || review.productId}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 justify-center md:justify-end">
                                        {activeTab === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                    className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                    title="Approuver"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                    className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                    title="Rejeter"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'approved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                title="Retirer (Rejeter)"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">block</span>
                                            </button>
                                        )}
                                        {activeTab === 'rejected' && (
                                            <button
                                                onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                title="Restaurer (Approuver)"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Supprimer définitivement"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 mb-6 text-slate-300 dark:text-slate-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[64px]">rate_review</span>
                            </div>
                            <p className="text-[16px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                                {activeTab === 'pending' ? 'Aucun avis en attente de modération.' : `Aucun avis ${activeTab === 'approved' ? 'approuvé' : 'rejeté'}.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

