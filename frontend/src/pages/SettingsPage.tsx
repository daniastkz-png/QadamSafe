import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Globe,
    Shield,
    LogOut,
    Save,
    Award,
    Info,
    Lock,
    Mail,
    CreditCard,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TopNavBar } from '../components/TopNavBar';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { firebaseProgressAPI, firebaseScenariosAPI } from '../services/firebase';

export const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [username, setUsername] = useState(user?.name || '');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [completedScenarios, setCompletedScenarios] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showProgressDetails, setShowProgressDetails] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const [progress, scenarios] = await Promise.all([
                    firebaseProgressAPI.getProgress(),
                    firebaseScenariosAPI.getAll()
                ]) as [any[], any[]];

                const completed = progress.filter((p: any) => p.completed).length;
                setCompletedScenarios(completed);

                const completedIds = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.scenarioId));
                const nextScenario = scenarios
                    .sort((a: any, b: any) => a.order - b.order)
                    .find((s: any) => !completedIds.has(s.id));

                setCurrentLevel(nextScenario ? nextScenario.order : scenarios.length);
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    const handleSaveProfile = () => {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };



    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePasswordChange = () => {
        setShowPasswordModal(true);
        setTimeout(() => setShowPasswordModal(false), 3000);
    };

    const tier = 'Free';

    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

            <div className="max-w-7xl mx-auto p-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {t('settings.title')}
                    </h1>
                    <p className="text-gray-400">
                        {t('settings.subtitle')}
                    </p>
                </div>

                {/* Success Message */}
                {showSaveSuccess && (
                    <div className="bg-cyber-green/10 border border-cyber-green/30 rounded-lg p-4 mb-6">
                        <p className="text-cyber-green text-sm">
                            ✓ {t('settings.profile.saveSuccess')}
                        </p>
                    </div>
                )}

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 mb-6">
                        <p className="text-cyber-yellow text-sm">
                            ℹ {t('settings.security.passwordChangePlaceholder')}
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* 1. ACCOUNT MANAGEMENT */}
                    <section className="cyber-card">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-cyber-green" />
                            <h2 className="text-xl font-bold text-white">
                                {t('settings.profile.title')}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('settings.profile.username')}
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyber-green transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('settings.profile.email')}
                                </label>
                                <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-4 py-2.5">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">{user?.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('settings.profile.tier')}
                                </label>
                                <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-4 py-2.5">
                                    <CreditCard className="w-4 h-4 text-cyber-green" />
                                    <span className="text-cyber-green font-semibold">{tier}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                className="cyber-button inline-flex items-center gap-2 mt-2"
                            >
                                <Save className="w-4 h-4" />
                                {t('settings.profile.save')}
                            </button>
                        </div>
                    </section>

                    {/* 2. SECURITY - PROMINENT */}
                    <section className="cyber-card border-2 border-cyber-yellow/40 bg-cyber-yellow/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-6 h-6 text-cyber-yellow" />
                            <h2 className="text-xl font-bold text-white">
                                {t('settings.security.title')}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handlePasswordChange}
                                className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg text-gray-300 hover:border-cyber-yellow transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span>{t('settings.security.changePassword')}</span>
                                </div>
                            </button>

                            <div className="bg-background/50 border border-border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-300 font-medium">
                                            {t('settings.security.infoTitle')}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('settings.security.infoText')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. PERSONALIZATION */}
                    <section className="cyber-card">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-6 h-6 text-cyber-green" />
                            <h2 className="text-xl font-bold text-white">
                                {t('settings.personalization.title')}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('settings.personalization.language')}
                                </label>
                                <LanguageSwitcher />
                                <p className="text-xs text-gray-500 mt-2">
                                    {t('settings.personalization.autoSave')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('settings.personalization.theme')}
                                </label>
                                <div className="bg-background/50 border border-border rounded-lg px-4 py-2.5">
                                    <span className="text-gray-400">Cyber Dark</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. DANGER ZONE - LOGOUT SEPARATED */}
                    <section className="cyber-card border-2 border-cyber-red/40 bg-cyber-red/5">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-cyber-red" />
                            <h2 className="text-xl font-bold text-cyber-red">
                                {t('settings.dangerZone.title')}
                            </h2>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            {t('settings.dangerZone.logoutWarning')}
                        </p>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyber-red/10 border-2 border-cyber-red/40 rounded-lg text-cyber-red hover:bg-cyber-red/20 transition-colors font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('settings.security.logout')}
                        </button>
                    </section>

                    {/* 5. PROGRESS SUMMARY - MINIMIZED AT BOTTOM */}
                    <section className="cyber-card bg-muted/20 border-border/50">
                        <button
                            onClick={() => setShowProgressDetails(!showProgressDetails)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-300">
                                    {t('settings.progress.title')}
                                </h2>
                            </div>
                            {showProgressDetails ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {showProgressDetails && (
                            <div className="mt-4 pt-4 border-t border-border">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-background/50 border border-border rounded-lg p-4">
                                                <p className="text-sm text-gray-400 mb-1">
                                                    {t('settings.progress.completed')}
                                                </p>
                                                <p className="text-2xl font-bold text-cyber-green">
                                                    {completedScenarios}
                                                </p>
                                            </div>
                                            <div className="bg-background/50 border border-border rounded-lg p-4">
                                                <p className="text-sm text-gray-400 mb-1">
                                                    {t('settings.progress.level')}
                                                </p>
                                                <p className="text-2xl font-bold text-cyber-green">
                                                    {t('common.level')} {currentLevel}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate('/progress')}
                                            className="text-sm text-cyber-green hover:underline"
                                        >
                                            {t('settings.progress.viewDetails')} →
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* FOOTER - SERVICE INFO & PHILOSOPHY */}
                <div className="mt-12 pt-8 border-t border-border/30">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{t('settings.service.version')}</span>
                            <span className="text-gray-400 font-mono">v1.0.0</span>
                        </div>

                        <button className="text-cyber-green hover:underline text-sm">
                            {t('settings.service.privacy')}
                        </button>

                        <div className="bg-muted/20 border border-border/50 rounded-lg p-4 mt-4">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                QadamSafe — симулятор для обучения кибербезопасности. Все сценарии являются учебными. Мы не храним реальные персональные данные и не требуем доступа к вашим аккаунтам.
                            </p>
                        </div>

                        <div className="text-center text-xs text-gray-600 pt-4">
                            © 2025 QadamSafe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
