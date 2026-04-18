'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    // On mount: read saved preference or system preference
    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') {
            setTheme(saved);
            applyTheme(saved);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            applyTheme('dark');
        }
    }, []);

    function applyTheme(t: Theme) {
        const root = document.documentElement;
        if (t === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }

    function toggleTheme() {
        const next: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        applyTheme(next);
        localStorage.setItem('theme', next);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}


