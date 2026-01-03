import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

interface ThemeSwitcherProps {
    className?: string;
    direction?: 'up' | 'down';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '', direction = 'down' }) => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCurrentTheme = () => themes.find(t => t.id === theme);

    const dropdownPosition = direction === 'up'
        ? 'bottom-full mb-2 left-0'
        : 'top-full mt-2 right-0';

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-200"
                title="Сменить тему"
            >
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm hidden sm:inline">{getCurrentTheme()?.icon}</span>
            </button>

            {isOpen && (
                <div className={`absolute ${dropdownPosition} w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-[100] animate-fade-in`}>
                    <div className="p-2">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${theme === t.id
                                        ? 'bg-primary/20 text-primary'
                                        : 'hover:bg-muted text-foreground'
                                    }`}
                            >
                                <span className="text-lg">{t.icon}</span>
                                <span className="text-sm font-medium">{t.name}</span>
                                {theme === t.id && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
