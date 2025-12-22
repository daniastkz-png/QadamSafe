import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, X, AlertTriangle, Check } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Link } from 'react-router-dom';

interface LastAccount {
    email: string;
    name: string;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

export const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [acceptMarketing, setAcceptMarketing] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastAccount, setLastAccount] = useState<LastAccount | null>(null);
    const [showQuickLogin, setShowQuickLogin] = useState(true);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Password requirements
    const passwordRequirements: PasswordRequirement[] = [
        { label: t('auth.password8Chars', '8+ символов'), test: (pwd) => pwd.length >= 8 },
        { label: t('auth.passwordUppercase', 'Заглавная буква'), test: (pwd) => /[A-Z]/.test(pwd) },
        { label: t('auth.passwordLowercase', 'Строчная буква'), test: (pwd) => /[a-z]/.test(pwd) },
        { label: t('auth.passwordNumber', 'Цифра'), test: (pwd) => /[0-9]/.test(pwd) },
        { label: t('auth.passwordSpecial', 'Специальный символ'), test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
    ];

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

        if (!isLogin) {
            // Validation for registration
            if (!acceptTerms || !acceptPrivacy) {
                setError(t('auth.mustAcceptTerms', 'Необходимо принять Условия использования и Политику конфиденциальности'));
                return;
            }

            if (password !== confirmPassword) {
                setError(t('auth.passwordMismatch', 'Пароли не совпадают'));
                return;
            }

            const allRequirementsMet = passwordRequirements.every(req => req.test(password));
            if (!allRequirementsMet) {
                setError(t('auth.passwordRequirementsNotMet', 'Пароль не соответствует требованиям'));
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, firstName || username || undefined);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || t(`auth.${isLogin ? 'loginError' : 'registerError'}`));
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email[0].toUpperCase();
    };

    const switchToRegister = () => {
        setIsLogin(false);
        setError('');
    };

    const switchToLogin = () => {
        setIsLogin(true);
        setError('');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Language Switcher - Top Right */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
                <LanguageSwitcher />
            </div>

            {/* Left Column - Welcome Section (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-background via-background to-cyber-green/5 relative overflow-hidden">
                {/* Animated Background Icons */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <Shield className="absolute top-20 left-10 w-16 h-16 text-cyber-green animate-float" style={{ animationDelay: '0s' }} />
                    <Lock className="absolute top-40 right-20 w-12 h-12 text-cyber-green animate-float" style={{ animationDelay: '1s' }} />
                    <AlertTriangle className="absolute bottom-40 left-20 w-14 h-14 text-cyber-green animate-float" style={{ animationDelay: '2s' }} />
                    <Shield className="absolute bottom-20 right-10 w-20 h-20 text-cyber-green animate-float" style={{ animationDelay: '1.5s' }} />
                </div>

                {/* Glow Effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-green/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-start pt-20 px-12 xl:px-16 w-full">
                    <div className="space-y-8 animate-fade-in-up max-w-xl">
                        {/* Logo */}
                        <div className="inline-flex items-center gap-3">
                            <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
                                <Shield className="w-10 h-10 text-cyber-green" />
                            </div>
                            <span className="text-2xl font-bold text-cyber-green">QadamSafe</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                            {t('auth.welcomeTitle', 'Добро пожаловать в QadamSafe')}
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-cyber-green font-medium leading-relaxed">
                            {t('auth.welcomeSubtitleNew', 'Платформа для практического обучения кибербезопасности')}
                        </p>

                        {/* Description */}
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {t('auth.welcomeDescriptionNew', 'Изучайте цифровые угрозы через реальные сценарии. Принимайте решения, анализируйте ошибки и формируйте навыки, которые действительно защищают.')}
                        </p>

                        {/* Feature Points */}
                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint1')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint2')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint3')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center px-4 py-8 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Mobile Welcome Block (Only visible on mobile) */}
                    <div className="lg:hidden mb-8">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
                                <Shield className="w-10 h-10 text-cyber-green" />
                            </div>
                            <span className="text-2xl font-bold text-cyber-green">QadamSafe</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                            {t('auth.welcomeTitle', 'Добро пожаловать в QadamSafe')}
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg text-cyber-green font-medium mb-4 leading-relaxed">
                            {t('auth.welcomeSubtitleNew', 'Платформа для практического обучения кибербезопасности')}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {t('auth.welcomeDescriptionNew', 'Изучайте цифровые угрозы через реальные сценарии. Принимайте решения, анализируйте ошибки и формируйте навыки, которые действительно защищают.')}
                        </p>

                        {/* Feature Points */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint1')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint2')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0" />
                                <span className="text-sm text-foreground">{t('auth.valuePoint3')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Login Card - Only show on login tab when there's a saved account */}
                    {isLogin && lastAccount && showQuickLogin && (
                        <div className="mb-4 cyber-card border-2 border-cyber-green/30 bg-cyber-green/5 relative overflow-hidden">
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
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                                    {getInitials(lastAccount.name, lastAccount.email)}
                                </div>

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

                                <div className="text-cyber-green opacity-50 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>

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
                        {/* Login Form */}
                        {isLogin ? (
                            <>
                                <h2 className="text-2xl font-bold text-foreground mb-6">{t('auth.login', 'Вход')}</h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? t('common.loading') : t('auth.loginButton', 'Войти')}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={switchToRegister}
                                            className="text-sm text-cyber-green hover:underline"
                                        >
                                            {t('auth.noAccount', 'Нет аккаунта?')} {t('auth.createAccount', 'Создать')}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Registration Form */}
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    {t('auth.createAccountTitle', 'Создайте аккаунт')}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {t('auth.createAccountSubtitle', 'Присоединяйтесь к платформе для развития навыков кибербезопасности')}
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('auth.firstName', 'Имя')}
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="cyber-input pl-10"
                                                placeholder={t('auth.firstName', 'Имя')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('auth.username', 'Имя пользователя')}
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="cyber-input"
                                            placeholder={t('auth.username', 'Имя пользователя')}
                                            required
                                        />
                                    </div>

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

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('auth.confirmPassword', 'Подтвердите пароль')}
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="cyber-input pl-10"
                                                placeholder={t('auth.confirmPassword', 'Подтвердите пароль')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Requirements */}
                                    {password && (
                                        <div className="bg-background-secondary p-3 rounded-md space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                {t('auth.passwordRequirements', 'Требования к паролю')}:
                                            </p>
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    {req.test(password) ? (
                                                        <Check className="w-4 h-4 text-cyber-green" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                                    )}
                                                    <span className={`text-xs ${req.test(password) ? 'text-cyber-green' : 'text-muted-foreground'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Checkboxes */}
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-cyber-green/30 text-cyber-green focus:ring-cyber-green"
                                            />
                                            <span className="text-sm text-foreground">
                                                {t('auth.acceptTerms', 'Я принимаю')} <a href="#" className="text-cyber-green hover:underline">{t('auth.termsOfUse', 'Условия использования')}</a> *
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptPrivacy}
                                                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-cyber-green/30 text-cyber-green focus:ring-cyber-green"
                                            />
                                            <span className="text-sm text-foreground">
                                                {t('auth.acceptPrivacy', 'Я принимаю')} <a href="#" className="text-cyber-green hover:underline">{t('auth.privacyPolicy', 'Политику конфиденциальности')}</a> *
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptMarketing}
                                                onChange={(e) => setAcceptMarketing(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-cyber-green/30 text-cyber-green focus:ring-cyber-green"
                                            />
                                            <span className="text-sm text-foreground">
                                                {t('auth.acceptMarketing', 'Я хочу получать образовательные материалы и уведомления')}
                                            </span>
                                        </label>
                                    </div>

                                    {error && (
                                        <div className="cyber-border-red bg-cyber-red/10 text-cyber-red p-3 rounded-md text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? t('common.loading') : t('auth.createAccountButton', 'Создать аккаунт')}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={switchToLogin}
                                            className="text-sm text-cyber-green hover:underline"
                                        >
                                            {t('auth.haveAccount', 'Уже есть аккаунт?')} {t('auth.signIn', 'Войти')}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* B2B Link */}
                        <div className="mt-6 pt-6 border-t border-cyber-green/10">
                            <Link
                                to="/partners"
                                className="text-sm text-muted-foreground hover:text-cyber-green transition-colors flex items-center justify-center gap-2"
                            >
                                {t('auth.forOrganizations', 'Для организаций и партнёров')} →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                }
                
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
