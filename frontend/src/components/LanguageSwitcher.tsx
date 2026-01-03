import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { firebaseAuthAPI } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
    direction?: 'up' | 'down';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ direction = 'up' }) => {
    const { i18n } = useTranslation();
    const { user, updateUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'ru', label: 'Русский', flag: '🇷🇺', short: 'RU' },
        { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
        { code: 'kk', label: 'Қазақша', flag: '🇰🇿', short: 'KZ' },
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const handleLanguageChange = async (langCode: string) => {
        // Update i18n
        await i18n.changeLanguage(langCode);
        localStorage.setItem('language', langCode);

        // Update backend if user is logged in
        if (user) {
            try {
                const updatedUser = await firebaseAuthAPI.updateLanguage(langCode);
                updateUser(updatedUser as any);
            } catch (error) {
                console.error('Failed to update language on backend:', error);
            }
        }

        setIsOpen(false);
    };

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

    const dropdownPosition = direction === 'up'
        ? 'bottom-full mb-2'
        : 'top-full mt-2';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current Language Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-200 group"
                title="Сменить язык"
            >
                <Globe className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-medium hidden sm:inline">{currentLanguage.flag}</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute left-0 ${dropdownPosition} w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-[100]`}
                    style={{
                        animation: 'dropdownFadeIn 0.2s ease-out forwards'
                    }}
                >
                    <div className="p-1.5">
                        {languages.map((lang, index) => {
                            const isActive = lang.code === i18n.language;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary/15 text-primary'
                                            : 'hover:bg-muted text-foreground'
                                        }`}
                                    style={{
                                        animation: `dropdownItemSlide 0.2s ease-out ${index * 0.05}s forwards`,
                                        opacity: 0,
                                        transform: 'translateX(-10px)'
                                    }}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="text-sm font-medium flex-1 text-left">{lang.label}</span>
                                    {isActive && (
                                        <Check className="w-4 h-4 text-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes dropdownFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(${direction === 'up' ? '10px' : '-10px'});
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes dropdownItemSlide {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};
