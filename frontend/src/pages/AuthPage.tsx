import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, X } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface LastAccount {
    email: string;
    name: string;
}

export const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastAccount, setLastAccount] = useState<LastAccount | null>(null);
    const [showQuickLogin, setShowQuickLogin] = useState(true);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Load last account from localStorage
    useEffect(() => {
        const savedAccount = localStorage.getItem('lastAccount');
        if (savedAccount) {
            try {
                const account = JSON.parse(savedAccount);
                setLastAccount(account);
            } catch (e) {
                localStorage.removeItem('lastAccount');
            }
        }
    }, []);

    const handleQuickLogin = () => {
        if (lastAccount) {
            setEmail(lastAccount.email);
            setShowQuickLogin(false);
            // Focus on password field
            setTimeout(() => {
                passwordRef.current?.focus();
            }, 100);
        }
    };

    const handleDismissQuickLogin = () => {
        setShowQuickLogin(false);
    };

    const handleClearLastAccount = () => {
        localStorage.removeItem('lastAccount');
        setLastAccount(null);
        setShowQuickLogin(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name || undefined);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || t(`auth.${isLogin ? 'loginError' : 'registerError'}`));
        } finally {
            setLoading(false);
        }
    };

    // Get initials for avatar
    const getInitials = (name: string, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email[0].toUpperCase();
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
            {/* Language Switcher - Top Right */}
            <div className="absolute top-6 right-6 w-48">
                <LanguageSwitcher />
            </div>

            <div className="w-full max-w-md">
                {/* Logo and Product Description */}
                <div className="text-center mb-6">
                    <div className="inline-block cyber-border rounded-lg p-4 mb-4">
                        <Shield className="w-16 h-16 text-cyber-green" />
                    </div>
                    <h1 className="text-3xl font-bold text-cyber-green mb-3">{t('common.appName')}</h1>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        {t('auth.tagline')}
                    </p>
                </div>

                {/* Value Propositions - Compact inline format */}
                <div className="mb-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        {t('auth.valuePoint1')} · {t('auth.valuePoint2')} · {t('auth.valuePoint3')}
                    </p>
                </div>

                {/* Quick Login Card - Only show on login tab when there's a saved account */}
                {isLogin && lastAccount && showQuickLogin && (
                    <div className="mb-4 cyber-card border-2 border-cyber-green/30 bg-cyber-green/5 relative overflow-hidden">
                        {/* Dismiss button */}
                        <button
                            onClick={handleDismissQuickLogin}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1"
                            aria-label={t('common.close')}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <p className="text-xs text-cyber-green mb-3 font-medium">
                            {t('auth.quickLogin', 'Быстрый вход')}
                        </p>

                        <button
                            onClick={handleQuickLogin}
                            className="w-full flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-cyber-green/20 hover:border-cyber-green/50 hover:bg-cyber-green/10 transition-all group"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                                {getInitials(lastAccount.name, lastAccount.email)}
                            </div>

                            {/* Account Info */}
                            <div className="flex-1 text-left min-w-0">
                                {lastAccount.name && (
                                    <p className="text-foreground font-medium truncate">
                                        {lastAccount.name}
                                    </p>
                                )}
                                <p className="text-muted-foreground text-sm truncate">
                                    {lastAccount.email}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="text-cyber-green opacity-50 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        {/* Not you? link */}
                        <button
                            onClick={handleClearLastAccount}
                            className="mt-2 text-xs text-muted-foreground hover:text-cyber-red transition-colors"
                        >
                            {t('auth.notYou', 'Не вы?')} {t('auth.useAnotherAccount', 'Использовать другой аккаунт')}
                        </button>
                    </div>
                )}

                {/* Auth Form */}
                <div className="cyber-card">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 font-semibold transition-all ${isLogin
                                ? 'text-cyber-green border-b-2 border-cyber-green'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('auth.login')}
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 font-semibold transition-all ${!isLogin
                                ? 'text-cyber-green border-b-2 border-cyber-green'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('auth.register')}
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('auth.name')}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="cyber-input pl-10"
                                        placeholder={t('auth.name')}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {t('auth.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="cyber-input pl-10"
                                    placeholder={t('auth.email')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    ref={passwordRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="cyber-input pl-10"
                                    placeholder={t('auth.password')}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="cyber-border-red bg-cyber-red/10 text-cyber-red p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Registration Benefit - Only shown on register tab */}
                        {!isLogin && (
                            <div className="text-center text-xs text-muted-foreground">
                                {t('auth.registrationBenefit')}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('common.loading')
                                : isLogin
                                    ? t('auth.loginButton')
                                    : t('auth.registerButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
