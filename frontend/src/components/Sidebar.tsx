import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, TrendingUp, Award, CreditCard, LogOut, Shield, Settings } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    const navItems = [
        { to: '/welcome', icon: Shield, label: t('sidebar.welcome') },
        { to: '/training', icon: BookOpen, label: t('sidebar.training') },
        { to: '/progress', icon: TrendingUp, label: t('sidebar.progress') },
        { to: '/achievements', icon: Award, label: t('sidebar.achievements') },
        { to: '/subscription', icon: CreditCard, label: t('sidebar.subscription') },
        { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    ];

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <h1 className="flex items-center gap-3">
                    <img src="/logo-new.jpg" alt="QadamSafe" className="w-9 h-9 rounded-lg border border-cyber-green/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]" />
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-blue drop-shadow-[0_0_5px_rgba(0,255,65,0.3)]">
                        {t('common.appName')}
                    </span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive
                                ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Language Switcher */}
            <div className="p-4 border-t border-border space-y-4">
                <LanguageSwitcher />

                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user?.name || user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('subscription.' + user?.subscriptionTier.toLowerCase())}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-muted-foreground hover:text-cyber-red transition-colors"
                        title={t('common.logout')}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
