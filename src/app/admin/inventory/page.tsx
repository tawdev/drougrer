'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type Product } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />;
}


export default function AdminInventoryPage() {
    const { showToast } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'in-stock'>('all');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch products for inventory management
            const response = await api.getProducts({ page: 1, limit: 100 });
            setProducts(response.data);
        } catch {
            setError('Failed to load inventory data. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            let matchesFilter = true;
            if (stockFilter === 'low') matchesFilter = p.stock <= 10;
            else if (stockFilter === 'in-stock') matchesFilter = p.stock > 10;

            return matchesSearch && matchesFilter;
        });
    }, [products, searchQuery, stockFilter]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, stockFilter]);

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

    const handleUpdateStock = async (id: number, currentStock: number, delta: number) => {
        const newStock = Math.max(0, currentStock + delta);
        if (newStock === currentStock) return;

        try {
            setUpdatingId(id);
            await api.updateProduct(id, { stock: newStock });

            // Update local state
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
            showToast('Stock mis à jour avec succès !', 'success');
        } catch (err) {
            showToast('Échec de la mise à jour du stock', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleManualStockUpdate = async (id: number, val: string) => {
        const newStock = parseInt(val);
        if (isNaN(newStock) || newStock < 0) return;

        try {
            setUpdatingId(id);
            await api.updateProduct(id, { stock: newStock });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
            showToast('Stock mis à jour avec succès !', 'success');
        } catch (err) {
            showToast('Échec de la mise à jour du stock', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-[15px]">Monitor and manage your product stock levels.</p>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                            placeholder="Search by product name or SKU..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                        {[
                            { id: 'all', label: 'All Products', icon: 'list' },
                            { id: 'low', label: 'Low Stock', icon: 'warning' },
                            { id: 'in-stock', label: 'In Stock', icon: 'check_circle' }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setStockFilter(filter.id as any)}
                                className={`px-4 py-2 rounded-lg font-bold text-[13px] flex items-center gap-2 transition-all ${stockFilter === filter.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/10'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">Product Info</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5">Current Stock</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Quick Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {loading && products.length === 0 ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="size-12 rounded-lg" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-40" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-10 w-32 ml-auto rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-5xl opacity-20">inventory</span>
                                                <p className="font-semibold text-[15px]">No products found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                                                        ) : (
                                                            <div className="size-full flex items-center justify-center text-slate-400">
                                                                <span className="material-symbols-outlined text-[20px]">image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="max-w-[180px]">
                                                        <p className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-2" title={product.name}>{product.name}</p>
                                                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">SKU: {product.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[12px] font-bold capitalize">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[15px] font-black ${product.stock <= 10 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                                        {product.stock}
                                                    </span>
                                                    {product.stock <= 10 && (
                                                        <span className="material-symbols-outlined text-rose-500 text-[18px] animate-pulse">warning</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {product.stock === 0 ? (
                                                    <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold uppercase tracking-tight">Out of Stock</span>
                                                ) : product.stock <= 10 ? (
                                                    <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-tight">Low Stock</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-tight">In Stock</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                                                        <button
                                                            disabled={updatingId === product.id || product.stock === 0}
                                                            onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                                                            className="size-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all disabled:opacity-30"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">remove</span>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            className="w-12 text-center bg-transparent border-none text-[13px] font-bold text-slate-900 dark:text-white focus:ring-0 p-0"
                                                            value={updatingId === product.id ? '...' : product.stock}
                                                            onBlur={(e) => handleManualStockUpdate(product.id, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleManualStockUpdate(product.id, (e.target as HTMLInputElement).value);
                                                                    (e.target as HTMLInputElement).blur();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            disabled={updatingId === product.id}
                                                            onClick={() => handleUpdateStock(product.id, product.stock, 1)}
                                                            className="size-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all disabled:opacity-30"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="px-8 py-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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

            {/* Global notification system handles toasts now */}
        </main>
    );
}


