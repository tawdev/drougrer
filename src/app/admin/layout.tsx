'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Products', href: '/admin/products', icon: 'inventory_2' },
    { label: 'Categories', href: '/admin/categories', icon: 'category' },
    { label: 'Orders', href: '/admin/orders', icon: 'shopping_cart' },
    { label: 'Inventory', href: '/admin/inventory', icon: 'inventory' },
    { label: 'Blog', href: '/admin/blog', icon: 'article' },
    { label: 'Marques', href: '/admin/brands', icon: 'verified' },
    { label: 'Avis Clients', href: '/admin/reviews', icon: 'reviews' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { settings } = useSettings();

    // Initials for the avatar
    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'AD';

    // Force light mode on mount/pathname change
    useEffect(() => {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, [pathname]);

    return (
        <div className="light bg-[#F8FAFC] text-slate-900 antialiased min-h-screen" style={{ '--primary': '#BF1737' } as React.CSSProperties}>
            <div className="flex h-screen overflow-hidden">
                {/* Fixed Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-30">
                    <div className="p-6 border-b border-slate-100">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="relative shrink-0" style={{ width: 130, height: 52 }}>
                                <img
                                    src={settings?.logoUrl || "/mol.jpeg"}
                                    alt={settings?.storeName || "MOL Droguerie Admin"}
                                    className="w-full h-full object-contain"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Link>
                        <p className="text-slate-500 text-xs font-medium mt-1 pl-1">Management Portal</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? 'fill-1' : 'group-hover:text-primary'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(191,23,55,0.4)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 mt-auto border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {initials}
                            </div>
                            <div className="flex flex-col overflow-hidden max-w-[100px]">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                    {user?.fullName || 'Admin User'}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate lowercase">
                                    {user?.role || 'manager'}
                                </span>
                            </div>
                            <button 
                                onClick={logout}
                                className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                title="Se déconnecter"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {children}
                </div>
            </div>
        </div>
    );
}


