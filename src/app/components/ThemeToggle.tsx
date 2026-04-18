'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-in-out
        ${isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300'
                    : 'bg-secondary hover:bg-slate-200 text-slate-600'
                }
      `}
        >
            {/* Sun icon – visible in light mode */}
            <span
                className={`
          material-symbols-outlined absolute transition-all duration-300
          ${isDark ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}
        `}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
                light_mode
            </span>

            {/* Moon icon – visible in dark mode */}
            <span
                className={`
          material-symbols-outlined absolute transition-all duration-300
          ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}
        `}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
                dark_mode
            </span>
        </button>
    );
}


