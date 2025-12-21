import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, TrendingUp, Award, CreditCard, LogOut, Shield, Settings, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const TopNavBar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/welcome', icon: Shield, label: t('sidebar.welcome') },
        { to: '/training', icon: BookOpen, label: t('sidebar.training') },
        { to: '/progress', icon: TrendingUp, label: t('sidebar.progress') },
        { to: '/achievements', icon: Award, label: t('sidebar.achievements') },
        { to: '/subscription', icon: CreditCard, label: t('sidebar.subscription') },
        { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 md:w-7 md:h-7 text-cyber-green" />
                            <h1 className="text-lg md:text-xl font-bold text-cyber-green">
                                {t('common.appName')}
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${isActive
                                            ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Desktop User Info & Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <LanguageSwitcher />

                            <div className="flex items-center gap-3 pl-4 border-l border-border">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">
                                        {user?.name || user?.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('subscription.' + user?.subscriptionTier.toLowerCase())}
                                    </p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-muted-foreground hover:text-cyber-red transition-colors rounded-md hover:bg-muted"
                                    title={t('common.logout')}
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-card">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
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
                        </div>

                        {/* Mobile User Info */}
                        <div className="px-4 py-3 border-t border-border space-y-3">
                            <LanguageSwitcher />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
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
                )}
            </nav>
        </>
    );
};
