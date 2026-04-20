'use client';

import { useEffect, useState } from 'react';
import { api, type Brand } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

export default function AdminBrandsPage() {
    const { showToast, showConfirm } = useNotification();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({ name: '', logoUrl: '', isActive: true });
    const [uploading, setUploading] = useState(false);

    const loadBrands = async () => {
        setLoading(true);
        try {
            const data = await api.getBrands();
            setBrands(data);
        } catch (err) {
            console.error('Failed to load brands:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBrands(); }, []);

    const resetForm = () => {
        setFormData({ name: '', logoUrl: '', isActive: true });
        setEditingBrand(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBrand) {
                await api.updateBrand(editingBrand.id, formData);
                showToast('Marque mise à jour avec succès !', 'success');
            } else {
                await api.createBrand(formData);
                showToast('Marque ajoutée avec succès !', 'success');
            }
            resetForm();
            loadBrands();
        } catch (err: any) {
            console.error('Failed to save brand:', err);
            showToast(err.message || 'Échec de l\'enregistrement de la marque', 'error');
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({ name: brand.name, logoUrl: brand.logoUrl || '', isActive: brand.isActive });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        showConfirm({
            title: 'Supprimer la marque',
            message: 'Êtes-vous sûr de vouloir supprimer cette marque ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteBrand(id);
                    showToast('Marque supprimée avec succès !', 'success');
                    loadBrands();
                } catch (err: any) {
                    console.error('Failed to delete brand:', err);
                    showToast(err.message || 'Échec de la suppression de la marque', 'error');
                }
            }
        });
    };

    const handleToggleActive = async (brand: Brand) => {
        try {
            await api.updateBrand(brand.id, { isActive: !brand.isActive });
            loadBrands();
        } catch (err) {
            console.error('Failed to toggle brand:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await api.uploadImage(file);
            setFormData((prev) => ({ ...prev, logoUrl: result.url }));
        } catch (err) {
            console.error('Failed to upload image:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-1 h-full min-h-0 flex flex-col overflow-y-auto no-scrollbar p-8 bg-slate-50/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Marques</h1>
                    <p className="text-sm text-slate-500 mt-1">{brands.length} marque(s) enregistrée(s)</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nouvelle Marque
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        {editingBrand ? 'Modifier la Marque' : 'Ajouter une Marque'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom de la marque</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Bosch, Makita..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo</label>
                            <div className="flex items-center gap-4">
                                {formData.logoUrl && (
                                    <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2">
                                        <img
                                            src={formData.logoUrl.startsWith('http') ? formData.logoUrl : `${process.env.NEXT_PUBLIC_API_URL}${formData.logoUrl}`}
                                            alt="Logo preview"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                )}
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">upload</span>
                                    {uploading ? 'Uploading...' : 'Choisir une image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active (visible sur le site)</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
                            >
                                {editingBrand ? 'Mettre à jour' : 'Ajouter'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Brands Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : brands.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2">verified</span>
                    <p className="text-lg font-medium">Aucune marque enregistrée</p>
                    <p className="text-sm">Commencez par ajouter une marque.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((brand) => (
                                <tr key={brand.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden">
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl.startsWith('http') ? brand.logoUrl : `${process.env.NEXT_PUBLIC_API_URL}${brand.logoUrl}`}
                                                    alt={brand.name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-800 text-sm">{brand.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(brand)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${brand.isActive
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


