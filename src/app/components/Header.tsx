'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api, type Category, type Product } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Search, Heart, GitCompare, ShoppingBag, ChevronDown, Mail, MessageCircle, X, Menu } from 'lucide-react';

export default function Header() {
    const { settings, loading: settingsLoading } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const { count: wishlistCount } = useWishlist();
    const { count: compareCount } = useCompare();
    const { totalItems } = useCart();
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        api.getCategories().then(setCategories).catch(console.error);
    }, []);

    // Flatten categories for the dropdown
    const flatCategories = categories.reduce((acc: Category[], cat) => {
        acc.push(cat);
        if (cat.children) {
            cat.children.forEach(child => acc.push(child));
        }
        return acc;
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live search suggestions effect
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestedProducts([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await api.getProducts({
                    search: searchQuery,
                    limit: 5,
                    categoryId: selectedCategory?.id
                });
                setSuggestedProducts(res.data);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory]);

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="text-[#BF1737] font-bold">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (selectedCategory) params.append('categoryId', selectedCategory.id.toString());

        setShowSuggestions(false);
        setIsMobileSearchOpen(false);
        router.push(`/products?${params.toString()}`);
    };

    return (
        <header className="w-full bg-white sticky top-0 md:relative z-[100] md:z-auto shadow-sm md:shadow-none">
            {/* Top Bar - Hidden on small mobile */}
            <div className="border-b border-slate-200 py-2.5 hidden sm:block">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="text-[13px] sm:text-[14px] font-medium text-slate-600 truncate">
                        {settingsLoading ? (
                            <div className="w-32 h-4 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            settings?.storeName || 'Droguerie Maroc'
                        )}
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/contact" className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold text-slate-700 hover:text-[#BF1737] transition-colors">
                            <Mail size={16} className="text-[#BF1737]" /> <span>Contact</span>
                        </Link>
                        <a 
                            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || settings?.phoneNumber || '').replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold text-slate-700 hover:text-[#BF1737] transition-colors"
                        >
                            <MessageCircle size={16} className="text-[#BF1737]" /> <span>Besoin d&apos;aide ?</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="py-2.5 sm:py-3 relative">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 md:gap-10">
                    
                    {/* Mobile Menu Trigger & Logo */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button - Displayed on mobile only */}
                        <button 
                            className="md:hidden p-2 -ml-2 text-slate-700 hover:text-[#BF1737] transition-colors"
                            onClick={() => {
                                // Trigger custom event for Navbar to open
                                document.dispatchEvent(new CustomEvent('open-mobile-menu'));
                            }}
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="shrink-0 group">
                            <div className="relative w-[110px] h-[48px] sm:w-[140px] sm:h-[56px] md:w-[160px] md:h-[64px]">
                                {settingsLoading ? (
                                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
                                ) : (
                                        <Image
                                            src={settings?.logoUrl || "/mol2.jpeg"}
                                            alt={settings?.storeName || "MOL Droguerie – Meilleur Prix"}
                                            fill
                                            style={{ objectFit: 'contain', mixBlendMode: settings?.logoUrl ? 'normal' : 'multiply' }}
                                            priority
                                            unoptimized={true}
                                            sizes="(max-width: 640px) 110px, (max-width: 1024px) 140px, 160px"
                                        />
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Search Bar - Hidden on mobile, shown on md+ */}
                    <div className="hidden md:flex flex-1 max-w-[720px] relative" ref={searchContainerRef}>
                        {/* Backdrop for focus */}
                        {showSuggestions && (
                            <div className="fixed inset-0 bg-black/5 z-[80]" onClick={() => setShowSuggestions(false)} />
                        )}

                        <div className={`flex w-full items-center rounded-[7px] bg-[#F2F4F7] border border-[#E5E7EB] h-[46px] group transition-all relative z-[90] ${showSuggestions ? 'bg-white ring-8 ring-black/5 border-[#BF1737]/20' : 'focus-within:bg-white focus-within:border-[#BF1737]/30'}`}>
                            <input
                                type="text"
                                placeholder="Rechercher des produits"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full bg-transparent h-full pl-6 pr-3 text-[14px] font-medium outline-none text-slate-600 placeholder:text-slate-400 border-none"
                            />

                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSuggestedProducts([]);
                                    }}
                                    className="p-2 text-slate-400 hover:text-[#BF1737] transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}

                            <div className="flex items-center h-full pr-1.5 gap-2">
                                <div className="relative h-[32px]" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="flex items-center gap-2 px-4 h-full text-[13px] font-semibold text-slate-700 bg-[#E2E8F0] rounded-[7px] hover:bg-[#D8DEE6] transition-colors whitespace-nowrap min-w-[160px] justify-between"
                                    >
                                        <span className="truncate">{selectedCategory ? selectedCategory.name : 'Toutes Les Catégories'}</span>
                                        <ChevronDown size={14} strokeWidth={2.5} className={`text-slate-500 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCategoryOpen && (
                                        <div className="absolute top-[calc(100%+12px)] right-0 z-[100] min-w-[240px] bg-white rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-200 py-2 animate-in fade-in zoom-in duration-200 origin-top">
                                            {/* Arrow Pointer */}
                                            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45"></div>

                                            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(null);
                                                        setIsCategoryOpen(false);
                                                    }}
                                                    className="w-full text-left px-5 py-2.5 text-[14px] font-medium text-slate-400/80 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                                >
                                                    Toutes les catég...
                                                </button>
                                                {flatCategories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedCategory(cat);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className={`w-full text-left px-5 py-3 text-[14px] font-medium transition-colors hover:bg-slate-50 ${selectedCategory?.id === cat.id ? 'text-[#BF1737] bg-slate-50' : 'text-slate-800'} ${cat.parentId ? 'pl-8 text-[13px] border-l-2 border-transparent' : ''}`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center bg-[#BF1737] text-white rounded-[7px] transition-all hover:bg-[#A1132F] active:scale-95 shadow-sm"
                                >
                                    <Search size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Search Suggestions Panel */}
                        {showSuggestions && searchQuery.length >= 2 && (
                            <div className="absolute top-[calc(100%+1px)] left-0 right-0 z-[100] bg-white rounded-b-[12px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-[500px] overflow-y-auto custom-scrollbar pb-2">

                                    {/* Category Suggestions */}
                                    <div className="mt-2">
                                        <div className="flex items-center gap-3 px-6 py-2 bg-slate-50/50">
                                            <div className="w-1.5 h-6 bg-[#BF1737] rounded-full"></div>
                                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Suggestions de catégories</span>
                                        </div>
                                        <div className="mt-1">
                                            {flatCategories
                                                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .slice(0, 3)
                                                .map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedCategory(cat);
                                                            handleSearch();
                                                        }}
                                                        className="w-full text-left px-10 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-[#BF1737] transition-colors"
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))
                                            }
                                            {flatCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                <div className="px-10 py-3 text-[13px] text-slate-400 italic">Aucune catégorie trouvée</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Suggestions */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-3 px-6 py-2 bg-slate-50/50">
                                            <div className="w-1.5 h-6 bg-[#BF1737] rounded-full"></div>
                                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Suggestions de produits</span>
                                        </div>
                                        <div className="mt-2 px-6 space-y-1">
                                            {suggestedProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        router.push(`/products/${product.id}`);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors group text-left"
                                                >
                                                    <div className="w-12 h-12 rounded-md bg-white border border-slate-200 flex-shrink-0 overflow-hidden">
                                                        <img
                                                            src={product.imageUrl || '/placeholder-product.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[14px] font-medium text-slate-700 truncate group-hover:text-[#BF1737] transition-colors">
                                                            {highlightText(product.name, searchQuery)}
                                                        </span>
                                                        <span className="text-[13px] font-bold text-[#BF1737] mt-0.5">
                                                            {product.price.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                            {!isLoading && suggestedProducts.length === 0 && (
                                                <div className="px-4 py-3 text-[13px] text-slate-400 italic">Aucun produit trouvé</div>
                                            )}
                                            {isLoading && (
                                                <div className="px-4 py-3 flex items-center gap-2 text-[13px] text-slate-400">
                                                    <div className="w-4 h-4 border-2 border-[#BF1737] border-t-transparent rounded-full animate-spin"></div>
                                                    Recherche en cours...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSearch}
                                        className="w-full mt-4 py-3 border-t border-slate-50 text-[13px] font-bold text-[#BF1737] hover:bg-slate-50 transition-colors uppercase tracking-widest"
                                    >
                                        Voir tous les résultats
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Icons & Mobile Search Trigger */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                        {/* Mobile Search Button */}
                        <button 
                            className="md:hidden p-2 text-slate-700 hover:text-[#BF1737] transition-colors"
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        >
                            {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
                        </button>

                        <Link href="/compare" className="group relative transition-all p-1 sm:p-0">
                            <GitCompare size={22} strokeWidth={1.5} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#BF1737] text-[9px] sm:text-[10px] font-black text-white ring-2 ring-white">
                                {mounted ? compareCount : 0}
                            </span>
                        </Link>
                        <Link href="/wishlist" className="group relative transition-all p-1 sm:p-0">
                            <Heart size={22} strokeWidth={1.5} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#BF1737] text-[9px] sm:text-[10px] font-black text-white ring-2 ring-white">{mounted ? wishlistCount : 0}</span>
                        </Link>
                        <Link href="/cart" className="group relative transition-all p-1 sm:p-0">
                            <ShoppingBag size={22} strokeWidth={1.5} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#BF1737] text-[9px] sm:text-[10px] font-black text-white ring-2 ring-white">
                                {mounted ? totalItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Bar - Collapsible */}
                {isMobileSearchOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl z-[110] animate-in slide-in-from-top duration-300">
                        <div className="relative flex items-center" ref={searchContainerRef}>
                            <div className="flex flex-1 items-center rounded-[7px] bg-[#F2F4F7] border border-[#E5E7EB] h-[46px] group transition-all relative">
                                <Search size={18} className="ml-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher des produits..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full bg-transparent h-full px-3 text-[14px] font-medium outline-none text-slate-600 placeholder:text-slate-400 border-none"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-2 mr-1 text-slate-400 hover:text-[#BF1737]"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={handleSearch}
                                className="ml-2 h-[46px] px-5 bg-[#BF1737] text-white rounded-[7px] font-bold text-sm"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
