'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Product } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { X, Share2, ShoppingCart, Heart, RefreshCw, Star } from 'lucide-react';

export default function WishlistPage() {
    const { wishlistIds, removeFromWishlist } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.getProducts({ page: 1, limit: 200 });
                const wishlisted = res.data.filter((p) => wishlistIds.includes(p.id));
                setProducts(wishlisted);

                // Real Recently Viewed
                const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const viewedProducts = viewedIds
                    .map((id: number) => res.data.find(p => p.id === id))
                    .filter(Boolean)
                    .slice(0, 12) as Product[];
                setRecentlyViewed(viewedProducts);
            } catch (err) {
                console.error('Failed to fetch wishlist products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [wishlistIds]);

    const getStockLabel = (product: Product) => {
        if (product.stock === 0) return { text: 'Rupture de stock', color: 'text-slate-400' };
        if (product.stock <= 5) return { text: `Plus que ${product.stock} !`, color: 'text-[#E65100]' };
        return { text: 'En Stock', color: 'text-[#2E7D32]' };
    };

    return (
        <div className="flex-1 flex flex-col bg-[#F7F8FA]">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Ma Liste de Souhaits</h1>
                        <p className="text-[15px] text-slate-500 mt-1">
                            Vous avez <span className="font-bold text-slate-700">{wishlistIds.length} articles</span> enregistrés
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                            <Share2 size={15} strokeWidth={2.5} />
                            Partager la liste
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#BF1737] text-white rounded-lg text-[13px] font-bold hover:bg-[#9B122D] transition-colors shadow-sm">
                            <ShoppingCart size={15} strokeWidth={2.5} />
                            Tout ajouter au panier
                        </button>
                    </div>
                </div>

                {/* ── Product Grid ───────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 animate-pulse shadow-sm overflow-hidden">
                                <div className="aspect-[5/4] w-full bg-slate-100" />
                                <div className="p-3">
                                    <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
                                    <div className="h-4 w-3/4 bg-slate-100 rounded mb-3" />
                                    <div className="h-4 w-1/3 bg-slate-100 rounded mb-3" />
                                    <div className="h-9 w-full bg-slate-100 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-[#FEF0F2] flex items-center justify-center mb-6">
                            <ShoppingCart size={36} className="text-[#BF1737] opacity-40" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Votre liste de souhaits est vide</h3>
                        <p className="text-slate-500 font-medium mb-6 max-w-md">
                            Explorez nos produits et cliquez sur le cœur pour ajouter des articles à votre liste de souhaits.
                        </p>
                        <Link
                            href="/products"
                            className="px-6 py-2.5 bg-[#BF1737] text-white font-bold rounded-lg shadow-sm hover:bg-[#9B122D] transition-all"
                        >
                            Découvrir nos produits
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((product) => {
                                const price = Number(product.price);
                                const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
                                const isSale = product.onSale || (oldPrice !== null && oldPrice > price);

                                return (
                                    <div key={product.id} className="group flex flex-col rounded-[8px] bg-white p-3 border border-gray-200 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative">
                                        {/* Remove Button (Top-Right) */}
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-400 border border-slate-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                            title="Retirer"
                                        >
                                            <X size={14} strokeWidth={2.5} />
                                        </button>

                                        {/* Product Image Wrapper */}
                                        <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden rounded-[12px] mb-4 flex items-center justify-center">
                                            {product.imageUrl ? (
                                                <img
                                                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-200">
                                                    <ShoppingCart size={40} strokeWidth={1.5} className="opacity-10" />
                                                </div>
                                            )}

                                            {/* Action Buttons (Hover) */}
                                            <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
                                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D1636] text-white shadow-md hover:bg-[#BF1737] transition-colors">
                                                    <RefreshCw size={16} strokeWidth={2} />
                                                </button>
                                            </div>

                                            {isSale && (
                                                <span className="absolute top-3 left-3 rounded-md bg-[#00D16E] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                                                    -{Math.round(((oldPrice || price * 1.3) - price) / (oldPrice || price * 1.3) * 100)}%
                                                </span>
                                            )}
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex flex-1 flex-col">
                                            <Link href={`/products/${product.id}`}>
                                                <h3 className="text-[14px] font-medium text-slate-900 leading-tight line-clamp-2 mb-2 group-hover:text-[#BF1737] transition-colors">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center gap-1 mb-3">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className="fill-slate-200 text-slate-200" strokeWidth={1} />
                                                    ))}
                                                </div>
                                                <span className="text-[12px] font-medium text-slate-400">0 Avis</span>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-bold text-[#BF1737]">
                                                        {price.toFixed(2).replace('.', ',')} MAD
                                                    </span>
                                                    {isSale && (
                                                        <span className="text-[12px] font-medium text-slate-400 line-through">
                                                            {(oldPrice || price * 1.3).toFixed(2).replace('.', ',')} MAD
                                                        </span>
                                                    )}
                                                </div>

                                                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#FEF0F2] text-[#BF1737] transition-all hover:bg-[#BF1737] hover:text-white" title="Ajouter au panier">
                                                    <ShoppingCart size={18} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* View More Items */}
                        <div className="flex justify-center mt-10">
                            <Link
                                href="/products"
                                className="px-8 py-3 border border-slate-200 rounded-lg text-[14px] font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                Voir plus d&apos;articles
                            </Link>
                        </div>
                    </>
                )}

                {/* ── Recently Viewed ────────────────────────────────────── */}
                {recentlyViewed.length > 0 && (
                    <div className="mt-16">
                        <div className="border-t border-slate-200 pt-10">
                            <h2 className="text-[22px] font-black text-slate-900 mb-6">Consultés Récemment</h2>
                            <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
                                {recentlyViewed.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="shrink-0 w-[160px] group flex flex-col"
                                    >
                                        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-100 mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:-translate-y-1">
                                            {product.imageUrl ? (
                                                <img
                                                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-200">
                                                    <ShoppingCart size={32} strokeWidth={1} className="opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="text-[13px] font-bold text-slate-900 leading-tight line-clamp-2 mb-1 group-hover:text-[#BF1737] transition-colors h-[32px]">
                                            {product.name}
                                        </h4>
                                        <span className="text-[14px] font-black text-[#BF1737]">
                                            {Number(product.price).toFixed(2).replace('.', ',')} MAD
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


