import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
