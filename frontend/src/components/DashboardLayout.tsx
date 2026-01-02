import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
    BookOpen,
    TrendingUp,
    Award,
    CreditCard,
    LogOut,
    Shield,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Bot
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navItems = [
        { to: '/welcome', icon: Shield, label: t('sidebar.welcome') },
        { to: '/training', icon: BookOpen, label: t('sidebar.training') },
        { to: '/assistant', icon: Bot, label: t('sidebar.assistant') },
        { to: '/progress', icon: TrendingUp, label: t('sidebar.progress') },
        { to: '/achievements', icon: Award, label: t('sidebar.achievements') },
        { to: '/subscription', icon: CreditCard, label: t('sidebar.subscription') },
        { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-border flex items-center justify-between min-h-[72px]">
                    {!sidebarCollapsed && (
                        <h1 className="text-xl font-bold text-cyber-green flex items-center gap-2">
                            <Shield className="w-7 h-7" />
                            <span>{t('common.appName')}</span>
                        </h1>
                    )}
                    {sidebarCollapsed && (
                        <Shield className="w-7 h-7 text-cyber-green mx-auto" />
                    )}
                </div>

                {/* Collapse Button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-cyber-green hover:border-cyber-green transition-colors"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${isActive
                                    ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`
                            }
                            title={sidebarCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : ''}`} />
                            {!sidebarCollapsed && (
                                <span className="font-medium truncate">{item.label}</span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Language Switcher */}
                <div className="p-3 border-t border-border space-y-3">
                    {!sidebarCollapsed && <LanguageSwitcher />}

                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('subscription.' + user?.subscriptionTier.toLowerCase())}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className={`p-2 text-muted-foreground hover:text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-all ${sidebarCollapsed ? '' : ''
                                }`}
                            title={t('common.logout')}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
                <div className="flex items-center justify-between px-4 h-16">
                    <h1 className="text-lg font-bold text-cyber-green flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        {t('common.appName')}
                    </h1>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Mobile Menu Drawer (right side) */}
                        <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-2xl z-50 md:hidden flex flex-col animate-slide-in-right">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-bold text-cyber-green flex items-center gap-2">
                                    <Shield className="w-6 h-6" />
                                    {t('common.appName')}
                                </h2>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                                    aria-label="Close menu"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Mobile User Info */}
                            <div className="p-4 border-t border-border space-y-3">
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
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="p-2 text-muted-foreground hover:text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-colors flex-shrink-0"
                                        title={t('common.logout')}
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                    } pt-16 md:pt-0`}
            >
                {children}
            </main>
        </div>
    );
};
