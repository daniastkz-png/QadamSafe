import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, X, Check, Eye, EyeOff } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Footer } from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';

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
    const { login, register, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [lastAccount, setLastAccount] = useState<LastAccount | null>(null);
    const [showQuickLogin, setShowQuickLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            // If user is already logged in (has active Firebase session), redirect to dashboard
            if (user && user.email === lastAccount.email) {
                navigate('/progress');
            } else {
                // Otherwise, fill email and focus password field
                setEmail(lastAccount.email);
                setShowQuickLogin(false);
                setTimeout(() => {
                    passwordRef.current?.focus();
                }, 100);
            }
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
                setError(t('auth.passwordRequirementsNotMet', 'Этот пароль легко подобрать. Усильте защиту аккаунта'));
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, username || undefined);
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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Language Switcher - Top Right */}
            <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[100]">
                <LanguageSwitcher direction="down" align="right" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">

                {/* Left Column - Welcome Section (Hidden on mobile) */}
                <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-background via-background to-cyber-green/5 relative overflow-hidden">
                    {/* Subtle gradient background only */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cyber-green/3" />

                    {/* Minimal grid pattern (like landing page) */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: `linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />

                    {/* Floating decorative icons - positioned in empty corners */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <Lock className="absolute top-8 right-8 w-10 h-10 text-cyber-green/15 animate-float" />
                        <Shield className="absolute bottom-12 right-12 w-14 h-14 text-cyber-green/10 animate-float-delayed" />
                    </div>

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
                                {t('auth.heroTitle', 'Научитесь защищаться')}{' '}
                                <span className="text-cyber-green">{t('auth.heroTitleHighlight', 'от цифрового мошенничества')}</span>
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
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0 mt-2" />
                                    <div>
                                        <span className="text-sm font-medium text-foreground">{t('landing.features.threat.title')}</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t('landing.features.threat.desc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0 mt-2" />
                                    <div>
                                        <span className="text-sm font-medium text-foreground">{t('landing.features.simulation.title')}</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t('landing.features.simulation.desc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-cyber-green rounded-full flex-shrink-0 mt-2" />
                                    <div>
                                        <span className="text-sm font-medium text-foreground">{t('landing.features.ai.title')}</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t('landing.features.ai.desc')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-cyber-green/10">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-cyber-green" />
                                    <span className="text-xs text-muted-foreground">{t('auth.trustDataProtected', 'Данные защищены')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyber-green" />
                                    <span className="text-xs text-muted-foreground">{t('auth.trustFreeStart', 'Бесплатный старт')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🇰🇿</span>
                                    <span className="text-xs text-muted-foreground">{t('auth.trustMadeInKZ', 'Сделано в Казахстане')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-cyber-green" />
                                    <span className="text-xs text-muted-foreground">{t('auth.trustEducational', 'Для обучения')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Auth Form */}
                <div className="w-full lg:w-[55%] flex items-center justify-center px-4 py-8 lg:px-8">
                    <div className="w-full max-w-md">
                        {/* Mobile Welcome Block - Minimal (Only visible on mobile) */}
                        <div className="lg:hidden mb-6">
                            {/* Logo + Title in one line */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
                                    <Shield className="w-8 h-8 text-cyber-green" />
                                </div>
                                <span className="text-xl font-bold text-cyber-green">QadamSafe</span>
                            </div>

                            {/* Short tagline */}
                            <p className="text-sm text-muted-foreground">
                                {t('auth.mobileTagline', 'Защита от цифрового мошенничества')}
                            </p>
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

                        {/* Create Account Panel - Show below Quick Login */}
                        {isLogin && (
                            <div className="mb-4 cyber-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {t('auth.noAccount', 'Нет аккаунта?')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={switchToRegister}
                                        className="relative group px-6 py-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        {/* Animated gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-green bg-[length:200%_100%] animate-gradient-shift" />

                                        {/* Glow effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute inset-0 bg-cyber-green/20 blur-xl" />
                                        </div>

                                        {/* Button text */}
                                        <span className="relative z-10 font-semibold text-black text-sm">
                                            {t('auth.createAccount', 'Создать')}
                                        </span>

                                        {/* Shine effect */}
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Auth Form */}
                        <div className="cyber-card">
                            {/* Top Switch Panel - Only for Registration */}
                            {!isLogin && (
                                <div className="mb-6 pb-6 border-b border-cyber-green/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {t('auth.haveAccount', 'Уже есть аккаунт?')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={switchToLogin}
                                            className="relative group px-6 py-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
                                        >
                                            {/* Animated gradient background */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-green bg-[length:200%_100%] animate-gradient-shift" />

                                            {/* Glow effect */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="absolute inset-0 bg-cyber-green/20 blur-xl" />
                                            </div>

                                            {/* Button text */}
                                            <span className="relative z-10 font-semibold text-black text-sm">
                                                {t('auth.signIn', 'Войти')}
                                            </span>

                                            {/* Shine effect */}
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            {isLogin ? (
                                <>
                                    <h2 className="text-2xl font-bold text-foreground mb-6">{t('auth.login', 'Вход')}</h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('auth.emailOrUsername', 'Email или имя пользователя')}
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="cyber-input pl-10"
                                                    placeholder={t('auth.emailOrUsername', 'Email или имя пользователя')}
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
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="cyber-input pl-10 pr-10"
                                                    placeholder={t('auth.password')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="cyber-border-red bg-cyber-red/10 text-cyber-red p-3 rounded-md text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || googleLoading}
                                            className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? t('common.loading') : t('auth.loginButton', 'Войти')}
                                        </button>

                                        {/* Divider */}
                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-card text-muted-foreground">
                                                    {t('auth.orContinueWith', 'или')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Google Sign In Button */}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setError('');
                                                setGoogleLoading(true);
                                                try {
                                                    await loginWithGoogle();
                                                } catch (err: any) {
                                                    setError(err.message || t('auth.googleError', 'Ошибка входа через Google'));
                                                } finally {
                                                    setGoogleLoading(false);
                                                }
                                            }}
                                            disabled={loading || googleLoading}
                                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-lg hover:border-cyber-green/50 hover:bg-cyber-green/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {/* Google Icon */}
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-foreground font-medium">
                                                {googleLoading ? t('common.loading') : t('auth.continueWithGoogle', 'Продолжить с Google')}
                                            </span>
                                        </button>
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
                                                {t('auth.username', 'Имя пользователя')}
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="cyber-input pl-10"
                                                    placeholder={t('auth.username', 'Имя пользователя')}
                                                    required
                                                />
                                            </div>
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
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="cyber-input pl-10 pr-10"
                                                    placeholder={t('auth.password')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('auth.confirmPassword', 'Подтвердите пароль')}
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="cyber-input pl-10 pr-10"
                                                    placeholder={t('auth.confirmPassword', 'Подтвердите пароль')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
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
                                        </div>

                                        {error && (
                                            <div className="cyber-border-red bg-cyber-red/10 text-cyber-red p-3 rounded-md text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || googleLoading}
                                            className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? t('common.loading') : t('auth.createAccountButton', 'Создать аккаунт')}
                                        </button>

                                        {/* Divider */}
                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-card text-muted-foreground">
                                                    {t('auth.orContinueWith', 'или')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Google Sign Up Button */}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setError('');
                                                setGoogleLoading(true);
                                                try {
                                                    await loginWithGoogle();
                                                } catch (err: any) {
                                                    setError(err.message || t('auth.googleError', 'Ошибка регистрации через Google'));
                                                } finally {
                                                    setGoogleLoading(false);
                                                }
                                            }}
                                            disabled={loading || googleLoading}
                                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-lg hover:border-cyber-green/50 hover:bg-cyber-green/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {/* Google Icon */}
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-foreground font-medium">
                                                {googleLoading ? t('common.loading') : t('auth.registerWithGoogle', 'Зарегистрироваться через Google')}
                                            </span>
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* Security Notice */}
                            <div className="mt-6 p-4 bg-cyber-green/5 border border-cyber-green/10 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {t('auth.securityNotice', 'Мы не храним реальные персональные данные — все сценарии исключительно учебные. Ваши данные защищены и не передаются третьим лицам.')}
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                
                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                
                .animate-gradient-shift {
                    animation: gradient-shift 3s ease infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }

                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(15px) rotate(-5deg); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 7s ease-in-out infinite;
                }
            `}</style>
            </div>
            {/* End Main Content */}

            <Footer />
        </div>
    );
};
