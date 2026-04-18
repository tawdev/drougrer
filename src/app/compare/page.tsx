'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Product } from '../lib/api';
import { useCompare } from '../context/CompareContext';
import {
    GitCompare, X, ShoppingCart, ArrowLeft, Trash2,
    CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Star,
    Plus, HelpCircle, Tag
} from 'lucide-react';

export default function ComparePage() {
    const { compareIds, removeFromCompare, clearCompare, count } = useCompare();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const MAX_ITEMS = 4;

    useEffect(() => {
        const fetchCompareProducts = async () => {
            if (compareIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const fetchedProducts = await Promise.all(
                    compareIds.map(id => api.getProductById(id).catch(() => null))
                );
                setProducts(fetchedProducts.filter((p): p is Product => p !== null));
            } catch (error) {
                console.error('Failed to fetch comparison products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompareProducts();
    }, [compareIds]);

    if (loading) {
        return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white mt-10">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#BF1737] rounded-full animate-spin"></div>
                    <GitCompare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#BF1737]" size={24} />
                </div>
                <p className="mt-6 text-slate-500 font-bold animate-pulse">Chargement de la comparaison...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-20">
                <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-[32px] border border-slate-100 shadow-xl">
                    <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mb-8 group transition-transform hover:scale-110">
                        <GitCompare size={48} className="text-slate-200 group-hover:text-[#BF1737] transition-colors" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Votre liste de comparaison est vide</h2>
                    <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
                        Vous n'avez pas encore ajouté de produits à comparer. Parcourez notre catalogue et cliquez sur l'icône de comparaison pour voir les produits côte à côte.
                    </p>
                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-10 py-4 bg-[#BF1737] text-white font-black rounded-2xl shadow-[0_8px_30px_rgb(191,23,55,0.25)] hover:shadow-[0_8px_35px_rgb(191,23,55,0.35)] hover:-translate-y-1 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                        Retourner à la boutique
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare slots (actual products + max ONE placeholder)
    const slots = [...products];
    if (slots.length < MAX_ITEMS) {
        slots.push(null as any);
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 mb-10">
                    <Link href="/" className="hover:text-[#BF1737] transition-colors">Accueil</Link>
                    <span className="text-slate-300">›</span>
                    <span className="text-slate-900 font-bold">Comparer les produits</span>
                </nav>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-[42px] font-black text-[#1D1636] tracking-tight leading-tight mb-4">
                        Comparer les <span className="text-[#BF1737]">Produits</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-[15px] font-medium leading-relaxed">
                        Comparez les caractéristiques techniques et les prix pour trouver la solution écologique idéale pour votre foyer.
                    </p>
                </div>

                {/* Comparison Main Table */}
                <div className="relative overflow-hidden mb-16">
                    <div className="overflow-x-auto scrollbar-hide pb-4">
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead>
                                <tr>
                                    {/* Characteristics Label Column - Header Part */}
                                    <th className="sticky left-0 z-30 bg-white min-w-[240px] p-0 border-b border-transparent">
                                        <div className="h-full flex flex-col justify-end pb-8">
                                            <h3 className="text-lg font-black text-[#1D1636]">Caractéristiques</h3>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Basé sur vos sélections</p>
                                        </div>
                                    </th>

                                    {/* Product Cards Row */}
                                    {slots.map((product, idx) => (
                                        <th key={product ? product.id : `empty-${idx}`} className="p-4 pt-0 w-1/4 min-w-[280px] align-top">
                                            {product ? (
                                                <div className="relative group p-6 rounded-3xl transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] items-center flex flex-col text-center">
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeFromCompare(product.id)}
                                                        className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 z-10 border border-slate-100"
                                                    >
                                                        <X size={14} strokeWidth={2.5} />
                                                    </button>

                                                    {/* Image Box */}
                                                    <div className="relative aspect-square w-32 mb-6 bg-[#F8F9FA] rounded-2xl p-4 flex items-center justify-center transition-transform group-hover:scale-105">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                        ) : (
                                                            <GitCompare size={32} className="text-slate-200" />
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <h4 className="text-[15px] font-bold text-[#1D1636] leading-tight mb-2 line-clamp-2 min-h-[40px]">
                                                        {product.name}
                                                    </h4>

                                                    {/* Price */}
                                                    <div className="text-[17px] font-black text-[#BF1737] mb-6">
                                                        {Number(product.price).toFixed(2).replace('.', ',')} €
                                                    </div>

                                                    {/* Add to Cart */}
                                                    <button className="w-full py-3 px-4 bg-[#BF1737] text-white font-black text-[13px] rounded-xl hover:bg-[#A0132E] transition-all shadow-[0_4px_12px_rgba(191,23,55,0.15)] active:scale-95 flex items-center justify-center gap-2">
                                                        Ajouter au panier
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="group h-full flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all">
                                                    <Link href="/products" className="flex flex-col items-center gap-4 text-center">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#BF1737]/10 group-hover:text-[#BF1737] transition-all">
                                                            <Plus size={24} />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Ajouter un produit</span>
                                                    </Link>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="mt-8">
                                {/* Category Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Catégorie</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.category?.name || 'Entretien Maison') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Brand Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Marque</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.brand?.name || 'EcoHome') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Volume Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Poids/Volume</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.sku?.includes('L') ? '1 L' : '750 ml') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Base Material Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Matériau / Base</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? 'Citron & Vinaigre blanc' : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Stock Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Disponibilité</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4">
                                            {product ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E6F9F0] text-[#00D16E] text-[12px] font-bold">
                                                    En stock
                                                </span>
                                            ) : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Rating Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Évaluation</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4">
                                            {product ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className="fill-current" />
                                                        ))}
                                                    </div>
                                                    <span className="text-[12px] font-bold text-slate-400">({Math.floor(Math.random() * 400 + 50)})</span>
                                                </div>
                                            ) : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Labels Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Labels</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[13px] font-medium text-slate-500">
                                            {product ? 'Ecocert, Vegan' : '—'}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-20">
                    {/* Help Card */}
                    <div className="bg-[#FFF5F6] rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                        <div className="relative z-10 max-w-[70%]">
                            <h3 className="text-2xl font-black text-[#1D1636] mb-3">Besoin d'aide ?</h3>
                            <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                                Consultez notre guide d'achat pour les produits ménagers écologiques.
                            </p>
                            <Link href="/blog" className="inline-flex items-center gap-2 text-[#BF1737] font-black group-hover:gap-3 transition-all">
                                Lire le guide
                                <ArrowLeft className="rotate-180" size={18} />
                            </Link>
                        </div>
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-24 h-24 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-200">
                            <span className="text-[60px] font-black opacity-10">?</span>
                        </div>
                    </div>

                    {/* Special Offer Card */}
                    <div className="bg-[#1D1636] rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white mb-3">Offre Spéciale</h3>
                            <p className="text-white/60 font-medium mb-8 leading-relaxed max-w-[80%]">
                                -20% sur votre première commande avec le code <span className="text-[#BF1737] font-black">BIO20</span>
                            </p>
                            <button className="bg-white text-[#1D1636] px-8 py-3 rounded-xl font-bold hover:bg-[#A0132E] hover:text-white transition-all active:scale-95 shadow-lg">
                                En profiter
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 rotate-12 translate-x-1/4 translate-y-1/4">
                            <Tag size={160} className="text-white fill-current" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
