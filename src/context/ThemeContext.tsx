import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hoppang-theme';

/**
 * Get the system's preferred color scheme
 */
const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Get the initial theme from localStorage or default to 'system'
 */
const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }
    return 'system';
};

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeMode;
}

/**
 * ThemeProvider - Provides theme context for dark mode support
 *
 * @param children - Child components
 * @param defaultTheme - Default theme mode (default: 'system')
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultTheme = 'system'
}) => {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return (stored as ThemeMode) || defaultTheme;
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        const initialTheme = getInitialTheme();
        return initialTheme === 'system' ? getSystemTheme() : initialTheme;
    });

    // Apply theme to document
    const applyTheme = useCallback((resolved: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', resolved);

        // Also update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
        }
    }, []);

    // Handle system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                const newResolved = getSystemTheme();
                setResolvedTheme(newResolved);
                applyTheme(newResolved);
            }
        };

        // Modern browsers
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [theme, applyTheme]);

    // Update resolved theme when theme setting changes
    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, [theme, applyTheme]);

    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => {
            // Cycle through: system -> light -> dark -> system
            const nextTheme: ThemeMode = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            return nextTheme;
        });
    }, []);

    const value: ThemeContextType = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * useTheme hook for accessing theme context
 */
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export { ThemeContext };
export type { ThemeMode, ThemeContextType };
