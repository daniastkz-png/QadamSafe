import React, { createContext, useContext, useEffect, ReactNode } from 'react';

export type ThemeType = 'dark';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    themes: { id: ThemeType; name: string; icon: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES = [{ id: 'dark' as ThemeType, name: 'Dark (Cyber)', icon: '🌑' }];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const theme: ThemeType = 'dark';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, []);

    const setTheme = () => {};

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
