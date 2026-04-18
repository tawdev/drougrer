'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: number) => boolean;
    getQuantity: (productId: number) => number;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'droguerie_cart';

function loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Hydrate from localStorage after mount
    useEffect(() => {
        setCartItems(loadCart());
    }, []);

    // Persist to localStorage whenever cart changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.productId === item.productId);
            if (existing) {
                return prev.map((i) =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...item, price: Number(item.price), quantity }];
        });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            setCartItems((prev) => prev.filter((i) => i.productId !== productId));
            return;
        }
        setCartItems((prev) =>
            prev.map((i) =>
                i.productId === productId ? { ...i, quantity } : i
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const isInCart = useCallback(
        (productId: number) => cartItems.some((i) => i.productId === productId),
        [cartItems]
    );

    const getQuantity = useCallback(
        (productId: number) => cartItems.find((i) => i.productId === productId)?.quantity || 0,
        [cartItems]
    );

    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isInCart,
                getQuantity,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}
