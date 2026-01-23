import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, TrendingUp, Award, CreditCard, LogOut, Shield, Settings, FileCheck, GraduationCap, Phone, Gamepad2, Target } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    const navItems = [
        { to: '/welcome', icon: Shield, label: t('sidebar.welcome') },
        { to: '/training', icon: BookOpen, label: t('sidebar.training') },
        { to: '/call-simulator', icon: Phone, label: t('sidebar.callSimulator', 'Симулятор звонков'), tier: 'PRO' },
        { to: '/cyber-defense', icon: Gamepad2, label: t('sidebar.cyberDefense', 'Cyber Defense'), tier: 'PRO' },
        { to: '/team-challenges', icon: Target, label: t('sidebar.teamChallenges', 'Челленджи'), tier: 'BUSINESS' },
        { to: '/progress', icon: TrendingUp, label: t('sidebar.progress') },
        { to: '/achievements', icon: Award, label: t('sidebar.achievements') },
        { to: '/certificates', icon: FileCheck, label: t('sidebar.certificates', 'Сертификаты'), tier: 'BUSINESS' },
        { to: '/teacher', icon: GraduationCap, label: t('sidebar.teacher', 'Учителям'), tier: 'BUSINESS' },
        { to: '/subscription', icon: CreditCard, label: t('sidebar.subscription') },
        { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    ];

    const hasAccess = (requiredTier?: string) => {
        if (!requiredTier) return true;
        if (user?.subscriptionTier === 'BUSINESS') return true;
        if (requiredTier === 'PRO' && user?.subscriptionTier === 'PRO') return true;
        return false;
    };

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-bold text-cyber-green flex items-center gap-2">
                    <Shield className="w-8 h-8" />
                    {t('common.appName')}
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems
                    .filter((item) => hasAccess(item.tier))
                    .map((item) => (
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
                            <span className="font-medium flex-1">{item.label}</span>
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
