'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface WishlistContextType {
    wishlistIds: number[];
    addToWishlist: (id: number) => void;
    removeFromWishlist: (id: number) => void;
    toggleWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'droguerie_wishlist';

function loadWishlist(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);

    // Hydrate from localStorage after mount
    useEffect(() => {
        setWishlistIds(loadWishlist());
    }, []);

    // Persist to localStorage whenever the list changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
        }
    }, [wishlistIds]);

    const addToWishlist = useCallback((id: number) => {
        setWishlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const removeFromWishlist = useCallback((id: number) => {
        setWishlistIds((prev) => prev.filter((x) => x !== id));
    }, []);

    const toggleWishlist = useCallback((id: number) => {
        setWishlistIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const isInWishlist = useCallback(
        (id: number) => wishlistIds.includes(id),
        [wishlistIds]
    );

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                count: wishlistIds.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
    return ctx;
}


