'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type Category } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}



export default function AdminCategoriesPage() {
    const { showToast, showConfirm } = useNotification();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true, parentId: null as number | null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getCategories();
            setCategories(data);
        } catch {
            setError('Failed to load categories. Make sure the backend is running on port 3002.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        );
    }, [categories, searchQuery]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    // Hierarchical Sorting Helper
    const hierarchicalCategories = useMemo(() => {
        const buildTree = (items: Category[], parentId: number | null = null, depth = 0): (Category & { depth: number })[] => {
            return items
                .filter(item => item.parentId === parentId)
                .reduce((acc, item) => {
                    return [
                        ...acc,
                        { ...item, depth },
                        ...buildTree(items, item.id, depth + 1)
                    ];
                }, [] as (Category & { depth: number })[]);
        };

        if (searchQuery) return filteredCategories.map(c => ({ ...c, depth: 0 }));
        return buildTree(categories);
    }, [categories, filteredCategories, searchQuery]);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return hierarchicalCategories.slice(start, start + itemsPerPage);
    }, [hierarchicalCategories, currentPage, itemsPerPage]);

    // Reset to first page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage === 1) return [1, 2, 3];
            if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
            return [currentPage - 1, currentPage, currentPage + 1];
        }
        return pages;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, formData);
                showToast('Catégorie mise à jour avec succès !', 'success');
            } else {
                await api.createCategory(formData);
                showToast('Catégorie créée avec succès !', 'success');
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', isActive: true, parentId: null });
            loadData();
        } catch (err) {
            showToast(`Échec de la ${editingCategory ? 'mise à jour' : 'création'} de la catégorie`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            isActive: category.isActive,
            parentId: category.parentId || null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (categoryId: number) => {
        try {
            setIsDeleting(true);
            await api.deleteCategory(categoryId);
            showToast('Catégorie supprimée avec succès !', 'success');
            loadData();
        } catch (err) {
            showToast('Échec de la suppression de la catégorie. Elle pourrait être utilisée par des produits.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories Management</h2>
                        <p className="text-slate-500 mt-1 font-medium text-[15px]">Organize and manage your product catalog sections.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: '', description: '', isActive: true, parentId: null });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold text-[14px] flex items-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add New Category
                    </button>
                </header>

                {/* Search */}
                <div className="mb-6 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm placeholder:text-slate-400"
                        placeholder="Search categories..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6 animate-in slide-in-from-top-2">
                        <span className="material-symbols-outlined">error</span>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="px-8 py-5">Category Name</th>
                                    <th className="px-8 py-5">Description</th>
                                    <th className="px-8 py-5">Product Count</th>
                                    <th className="px-8 py-5">Created Date</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {loading && categories.length === 0 ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-40" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-60" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                            <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-5xl opacity-20">category</span>
                                                <p className="font-semibold text-[15px]">{searchQuery ? 'No categories matching your search.' : 'No categories found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {[...Array(category.depth)].map((_, i) => (
                                                        <div key={i} className="w-6 border-l-2 border-slate-200 dark:border-slate-800 h-10 -mt-5 ml-2" />
                                                    ))}
                                                    <div className="flex flex-col">
                                                        <span className="text-[15px] font-bold text-slate-900 dark:text-white capitalize">{category.name}</span>
                                                        {category.parent && (
                                                            <span className="text-[11px] font-medium text-slate-400">Child of {category.parent.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 max-w-[250px]">
                                                <p className="text-[14px] text-slate-500 dark:text-slate-400 truncate" title={category.description || ''}>
                                                    {category.description || <em className="text-slate-300 dark:text-slate-600">No description</em>}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[14px] font-medium text-slate-600 dark:text-slate-400">
                                                    {category.products?.length || 0} products
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[14px] font-medium text-slate-400">
                                                    {new Date(category.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    {category.isActive ? (
                                                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-tight">Active</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-bold uppercase tracking-tight">Inactive</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => showConfirm({
                                                            title: 'Supprimer la catégorie',
                                                            message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.',
                                                            confirmText: 'Supprimer',
                                                            variant: 'danger',
                                                            onConfirm: () => handleDelete(category.id)
                                                        })}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    {totalPages > 0 && (
                        <div className="px-8 py-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`size-8 rounded-lg font-bold text-[13px] transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Configure your category details and status.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Category Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-[14px]"
                                        placeholder="e.g. Antibiotics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-medium text-[14px]"
                                        placeholder="Describe the category..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Parent Category (Optional)</label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-[14px] appearance-none"
                                    >
                                        <option value="">No Parent (Top Level)</option>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id) // Prevent self-referencing
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-900 dark:text-white">Active Status</p>
                                        <p className="text-[12px] text-slate-500">Visible on the storefront if active.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                                >Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {isSubmitting ? 'Processing...' : (editingCategory ? 'Update Category' : 'Create Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* The global NotificationOverlay handles toasts and confirms now */}
        </main>
    );
}


