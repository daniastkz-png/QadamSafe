import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { firebaseAuthAPI } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const { user, updateUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'ru', label: 'RU' },
        { code: 'en', label: 'EN' },
        { code: 'kk', label: 'KZ' },
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
    const otherLanguages = languages.filter(lang => lang.code !== i18n.language);

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

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Current Language Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-background/50 border border-border rounded-md hover:border-cyber-green/50 transition-all text-sm font-medium text-foreground"
            >
                <span>{currentLanguage.label}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full mb-1 left-0 w-full bg-card border border-border rounded-md shadow-lg overflow-hidden z-50">
                    {otherLanguages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className="w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-cyber-green/10 transition-colors text-left"
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
