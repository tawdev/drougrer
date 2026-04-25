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
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

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
                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Drawer */}
                <aside className={`fixed lg:static inset-y-0 left-0 w-72 lg:w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-[50] transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="relative shrink-0" style={{ width: 120, height: 48 }}>
                                <img
                                    src={settings?.logoUrl || "/mol.jpeg"}
                                    alt={settings?.storeName || "MOL Droguerie Admin"}
                                    className="w-full h-full object-contain"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Link>
                        {/* Mobile close button */}
                        <button 
                            className="lg:hidden text-slate-400 hover:text-slate-900"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[24px] transition-colors ${isActive ? 'fill-1' : 'group-hover:text-primary'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
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
                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                {initials}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-slate-900 truncate">
                                    {user?.fullName || 'Admin User'}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate lowercase">
                                    {user?.role || 'manager'}
                                </span>
                            </div>
                            <button 
                                onClick={logout}
                                className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                title="Se déconnecter"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Mobile Header Toggle */}
                    <div className="lg:hidden h-14 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 z-40">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span className="ml-3 font-bold text-slate-900">Admin Panel</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}


