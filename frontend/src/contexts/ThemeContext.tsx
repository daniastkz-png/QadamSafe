import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'dark' | 'light' | 'violet';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    themes: { id: ThemeType; name: string; icon: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES = [
    { id: 'dark' as ThemeType, name: 'Dark (Cyber)', icon: '🌑' },
    { id: 'light' as ThemeType, name: 'Light', icon: '☀️' },
    { id: 'violet' as ThemeType, name: 'Violet', icon: '🟣' },
];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>(() => {
        // Get saved theme from localStorage or default to 'dark'
        const saved = localStorage.getItem('theme');
        // Migrate old 'midnight' to 'violet'
        if (saved === 'midnight') return 'violet';
        if (saved && ['dark', 'light', 'violet'].includes(saved)) return saved as ThemeType;
        return 'dark';
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
