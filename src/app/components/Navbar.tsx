'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Menu, Home, Store, ShieldCheck, Info, Mail, ChevronRight, X, Heart, GitCompare, ShoppingBag, Newspaper, ChevronDown } from 'lucide-react';
import { api, type Category } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    
    const pathname = usePathname();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileExpandedCat, setMobileExpandedCat] = useState<number | null>(null);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [hoveredSubCatId, setHoveredSubCatId] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const { count: wishlistCount } = useWishlist();
    const { count: compareCount } = useCompare();
    const { totalItems } = useCart();
    
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        
        const handleOpenMenu = () => setIsMobileMenuOpen(true);
        document.addEventListener('open-mobile-menu', handleOpenMenu);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('open-mobile-menu', handleOpenMenu);
        };
    }, []);

    useEffect(() => {
        api.getCategories(true).then(setCategories).catch(console.error);
    }, []);

    const categoryTree = useMemo(() => {
        const buildTree = (items: Category[], parentId: number | null = null): Category[] => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };
        return buildTree(categories);
    }, [categories]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setHoveredCatId(null);
                setHoveredSubCatId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hoveredCategory = categoryTree.find(c => c.id === hoveredCatId);
    const hoveredSubCategory = hoveredCategory?.children?.find(c => c.id === hoveredSubCatId);

    const navItems = [
        { name: 'Accueil', href: '/', icon: <Home size={18} /> },
        { name: 'Boutique', href: '/products', icon: <Store size={18} /> },
        { name: 'Nos Marques', href: '/marques', icon: <ShieldCheck size={18} /> },
        { name: 'À Propos', href: '/about', icon: <Info size={18} /> },
        { name: 'Contact', href: '/contact', icon: <Mail size={18} /> },
        { name: 'Blog', href: '/blog', icon: <Newspaper size={18} /> },
    ];

    return (
        <nav className="w-full sticky top-[64px] sm:top-[76px] md:top-0 z-40 bg-transparent py-2 sm:py-3" suppressHydrationWarning>
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                {/* Desktop Navbar */}
                <div className="hidden md:flex h-[76px] items-center rounded-2xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/20 p-3 pr-6 transition-all duration-300 backdrop-blur-xl">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen);
                                setHoveredCatId(null);
                                setHoveredSubCatId(null);
                            }}
                            className="flex items-center justify-between gap-4 bg-[#BF1737] px-5 h-[50px] text-white font-bold text-[13px] uppercase tracking-wider rounded-[8px] hover:bg-opacity-95 transition-all group min-w-[240px]"
                        >
                            TOUTES LES CATÉGO...
                            {isMenuOpen ? (
                                <X size={18} className="transition-transform" />
                            ) : (
                                <Menu size={18} className="group-hover:scale-110 transition-transform" />
                            )}
                        </button>

                        {/* Mega Menu Dropdown */}
                        {isMenuOpen && (
                            <div
                                className="absolute top-[calc(100%+14px)] left-0 z-[100] flex animate-in fade-in slide-in-from-top-2 duration-200"
                                onMouseLeave={() => {
                                    setIsMenuOpen(false);
                                    setHoveredCatId(null);
                                    setHoveredSubCatId(null);
                                }}
                            >
                                <div className="relative w-[250px] h-fit bg-white rounded-2xl shadow-sm py-4 flex flex-col z-30">
                                    <div className="absolute -top-[10px] left-10 w-5 h-5 bg-white rotate-45 rounded-[3px] shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)] z-0"></div>
                                    <div className="relative z-10">
                                        {categoryTree.map((cat) => {
                                            const hasChildren = cat.children && cat.children.length > 0;
                                            const isHovered = hoveredCatId === cat.id;
                                            return (
                                                <Link
                                                    key={cat.id}
                                                    href={`/products?categoryId=${cat.id}`}
                                                    onMouseEnter={() => {
                                                        setTimeout(() => {
                                                            setHoveredCatId(cat.id);
                                                            setHoveredSubCatId(null);
                                                        }, 100);
                                                    }}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`relative flex items-center justify-between px-6 py-[12px] text-[15px] transition-all duration-200 ${isHovered
                                                        ? 'text-[#BF1737] font-semibold bg-slate-50/40'
                                                        : 'text-[#333] font-medium hover:text-[#BF1737]'
                                                        }`}
                                                >
                                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-7 rounded-r-full transition-all duration-200 ${isHovered ? 'bg-[#BF1737] opacity-100' : 'bg-transparent opacity-0'}`}></div>
                                                    <div className="flex items-center gap-4">
                                                        <span>{cat.name}</span>
                                                    </div>
                                                    {hasChildren && (
                                                        <ChevronRight size={16} strokeWidth={isHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isHovered ? 'text-[#BF1737]' : 'text-[#ccc]'}`} />
                                                    )}
                                                </Link>
                                            );
                                        })}

                                        <div className="border-t border-slate-200 my-2 mx-6"></div>

                                        <Link
                                            href="/products?sort=newest"
                                            onClick={() => setIsMenuOpen(false)}
                                            onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                            className="flex items-center px-12 py-[12px] text-[15px] font-semibold text-[#333] hover:text-[#BF1737] bg-transparent hover:bg-slate-50/40 transition-colors"
                                        >
                                            Nouveautés
                                        </Link>
                                        <Link
                                            href="/products?onSale=true"
                                            onClick={() => setIsMenuOpen(false)}
                                            onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                            className="flex items-center px-12 py-[12px] text-[15px] font-semibold text-[#333] hover:text-[#BF1737] bg-transparent hover:bg-slate-50/40 transition-colors"
                                        >
                                            Promotions
                                        </Link>
                                    </div>
                                </div>

                                {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 && (
                                    <div className="relative z-20 w-[270px] h-fit bg-white rounded-md shadow-md py-2 border-l border-slate-200 flex flex-col animate-in fade-in slide-in-from-left-6 duration-300 ease-out fill-mode-both mr-[15px] mt-[20px]">
                                        {hoveredCategory.children.map((sub) => {
                                            const hasGrandChildren = sub.children && sub.children.length > 0;
                                            const isSubHovered = hoveredSubCatId === sub.id;
                                            return (
                                                <Link
                                                    key={sub.id}
                                                    href={`/products?categoryId=${sub.id}`}
                                                    onMouseEnter={() => {
                                                        setTimeout(() => {
                                                            setHoveredSubCatId(sub.id);
                                                        }, 100);
                                                    }}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`flex items-center justify-between px-6 py-[12px] text-[13px] transition-all duration-200 ${isSubHovered
                                                        ? 'text-[#BF1737] font-semibold bg-slate-50/60 rounded-r-lg'
                                                        : 'text-[#5A626A] font-medium hover:text-[#BF1737] hover:bg-slate-50/30'
                                                        }`}
                                                >
                                                    <span>{sub.name}</span>
                                                    {hasGrandChildren && (
                                                        <ChevronRight size={16} strokeWidth={isSubHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isSubHovered ? 'text-[#BF1737]' : 'text-transparent'}`} />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {hoveredSubCategory && hoveredSubCategory.children && hoveredSubCategory.children.length > 0 && (
                                    <div className="relative z-10 w-[260px] h-fit bg-white rounded-r-2xl shadow-[8px_12px_40px_rgba(0,0,0,0.06)] py-4 -ml-4 pl-4 border-l border-slate-200 flex flex-col animate-in fade-in slide-in-from-left-6 duration-300 ease-out fill-mode-both">
                                        {hoveredSubCategory.children.map((grandChild) => (
                                            <Link
                                                key={grandChild.id}
                                                href={`/products?categoryId=${grandChild.id}`}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center px-6 py-[12px] text-[15px] transition-all duration-200 text-[#5A626A] font-medium hover:text-[#BF1737] hover:bg-slate-50/60 rounded-r-lg"
                                            >
                                                {grandChild.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center ml-6 gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-2.5 px-4 py-2 text-[14px] font-semibold transition-all rounded-lg
                                        ${isActive ? 'text-[#BF1737]' : 'text-slate-800 hover:text-[#BF1737] hover:bg-slate-50'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navHeaderActive"
                                            className="absolute inset-0 bg-slate-50 rounded-lg z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? 'text-[#BF1737]' : 'text-slate-900'} transition-colors opacity-90`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Scroll-triggered Action Icons */}
                    <div className={`flex items-center gap-6 ml-auto mr-4 transition-all duration-200 ease-out ${isScrolled ? 'opacity-100 translate-x-0 pointer-events-auto delay-700' : 'opacity-0 translate-x-8 pointer-events-none delay-500'}`}>
                        <Link href="/compare" className="group relative transition-all">
                            <GitCompare size={20} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#BF1737] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? compareCount : 0}
                            </span>
                        </Link>
                        <Link href="/wishlist" className="group relative transition-all">
                            <Heart size={20} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#BF1737] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? wishlistCount : 0}
                            </span>
                        </Link>
                        <Link href="/cart" className="group relative transition-all">
                            <ShoppingBag size={20} className="text-slate-900 transition-colors group-hover:text-[#BF1737]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#BF1737] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? totalItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Backdrop */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Menu Side Drawer */}
                <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[210] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden overflow-y-auto custom-scrollbar ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-[#BF1737] text-white">
                            <h2 className="text-[17px] font-black uppercase tracking-widest">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="p-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all ${isActive ? 'bg-[#BF1737]/10 text-[#BF1737]' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive ? 'text-[#BF1737]' : 'text-slate-400'}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="h-[1px] w-full bg-slate-200 my-4 px-8" />

                        {/* Categories Accordion */}
                        <div className="p-4 pt-0">
                            <h3 className="px-4 py-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Les Catégories</h3>
                            <div className="space-y-1">
                                {categoryTree.map((cat) => {
                                    const isExpanded = mobileExpandedCat === cat.id;
                                    const hasChildren = cat.children && cat.children.length > 0;
                                    
                                    return (
                                        <div key={cat.id} className="overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`/products?categoryId=${cat.id}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex-1 px-4 py-3 text-[14px] font-semibold text-slate-800 hover:text-[#BF1737] transition-colors"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {hasChildren && (
                                                    <button 
                                                        onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                                                        className={`p-3 text-slate-400 hover:text-[#BF1737] transition-all ${isExpanded ? 'rotate-180' : ''}`}
                                                    >
                                                        <ChevronDown size={18} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {hasChildren && (
                                                <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden bg-slate-50/50 rounded-xl ml-4">
                                                        {cat.children!.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                href={`/products?categoryId=${sub.id}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="block px-8 py-2.5 text-[13px] font-medium text-slate-600 hover:text-[#BF1737]"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto p-8 bg-slate-50">
                            <div className="flex items-center gap-4 mb-6">
                                <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="relative flex-1 flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <Heart size={20} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-600">Souhaits</span>
                                    <span className="absolute top-2 right-4 bg-[#BF1737] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{mounted ? wishlistCount : 0}</span>
                                </Link>
                                <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="relative flex-1 flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <GitCompare size={20} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-600">Comparer</span>
                                    <span className="absolute top-2 right-4 bg-[#BF1737] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{mounted ? compareCount : 0}</span>
                                </Link>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium text-center">
                                CDigital © {new Date().getFullYear()} — MOL Droguerie
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
