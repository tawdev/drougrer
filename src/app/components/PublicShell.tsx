'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const shouldHideShell = pathname?.startsWith('/admin') || pathname?.startsWith('/portal');

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-20 bg-white animate-pulse" />}>
                    <Header />
                </Suspense>
            )}
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-10 bg-white animate-pulse" />}>
                    <Navbar />
                </Suspense>
            )}
            <main className="flex-grow">
                {children}
            </main>
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-40 bg-white animate-pulse" />}>
                    <Footer />
                </Suspense>
            )}
        </div>
    );
}
