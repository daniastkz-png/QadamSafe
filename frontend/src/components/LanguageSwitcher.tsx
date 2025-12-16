import React from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, updateUser } = useAuth();

    const languages = [
        { code: 'ru', label: t('language.ru') },
        { code: 'en', label: t('language.en') },
        { code: 'kk', label: t('language.kk') },
    ];

    const handleLanguageChange = async (langCode: string) => {
        // Update i18n
        await i18n.changeLanguage(langCode);
        localStorage.setItem('language', langCode);

        // Update backend if user is logged in
        if (user) {
            try {
                const updatedUser = await authAPI.updateLanguage(langCode);
                updateUser(updatedUser);
            } catch (error) {
                console.error('Failed to update language on backend:', error);
            }
        }
    };

    return (
        <div className="relative">
            <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
