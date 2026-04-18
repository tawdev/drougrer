'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface CompareContextType {
    compareIds: number[];
    addToCompare: (id: number) => void;
    removeFromCompare: (id: number) => void;
    toggleCompare: (id: number) => void;
    isInCompare: (id: number) => boolean;
    count: number;
    clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = 'droguerie_compare';
const MAX_COMPARE = 4;

function loadCompare(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareIds, setCompareIds] = useState<number[]>([]);

    useEffect(() => {
        setCompareIds(loadCompare());
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
        }
    }, [compareIds]);

    const addToCompare = useCallback((id: number) => {
        setCompareIds((prev) => {
            if (prev.includes(id)) return prev;
            if (prev.length >= MAX_COMPARE) {
                // Remove first item and add the new one, or just alert?
                // Let's just keep it at MAX_COMPARE and ignore new ones.
                // Alternatively, we can let user know.
                return prev;
            }
            return [...prev, id];
        });
    }, []);

    const removeFromCompare = useCallback((id: number) => {
        setCompareIds((prev) => prev.filter((x) => x !== id));
    }, []);

    const toggleCompare = useCallback((id: number) => {
        setCompareIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            }
            if (prev.length >= MAX_COMPARE) {
                return prev;
            }
            return [...prev, id];
        });
    }, []);

    const isInCompare = useCallback(
        (id: number) => compareIds.includes(id),
        [compareIds]
    );

    const clearCompare = useCallback(() => {
        setCompareIds([]);
    }, []);

    return (
        <CompareContext.Provider
            value={{
                compareIds,
                addToCompare,
                removeFromCompare,
                toggleCompare,
                isInCompare,
                count: compareIds.length,
                clearCompare,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error('useCompare must be used within a CompareProvider');
    return ctx;
}
