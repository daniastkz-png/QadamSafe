import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    User,
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
    ChevronUp,
    Bell,
    Download,
    Calendar,
    Clock,
    Flame,
    Volume2,
    VolumeX,
    Vibrate,
    Keyboard,
    Link2,
    FileText,
    Trophy,
    TrendingUp,
    Settings,
    Sparkles,
    Check,
    Camera,
    Palette
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { firebaseProgressAPI } from '../services/firebase';

// Avatar options as emojis
const avatarEmojis = ['🛡️', '🔐', '🎯', '⚡', '🚀', '💎', '🔥', '🌟', '🎮', '👤'];

export const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Profile state
    const [username, setUsername] = useState(user?.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(() => {
        return localStorage.getItem('userAvatar') || '🛡️';
    });
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // UI state
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Progress state
    const [completedScenarios, setCompletedScenarios] = useState(0);
    const [totalScenarios, setTotalScenarios] = useState(5);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [loading, setLoading] = useState(true);

    // Notification preferences - load from localStorage
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notificationPrefs');
        return saved ? JSON.parse(saved) : {
            email: true,
            push: false,
            weeklyReport: true,
            reminders: false
        };
    });

    // Sound & Haptics - load from localStorage
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('soundEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [vibrationEnabled, setVibrationEnabled] = useState(() => {
        const saved = localStorage.getItem('vibrationEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Stats
    const accountCreatedDate = user?.createdAt ? new Date(user.createdAt.seconds * 1000) : new Date();
    const daysSinceJoin = Math.floor((Date.now() - accountCreatedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Save notifications to localStorage when changed
    useEffect(() => {
        localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
    }, [notifications]);

    // Save sound/vibration to localStorage when changed
    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('vibrationEnabled', JSON.stringify(vibrationEnabled));
    }, [vibrationEnabled]);

    // Save avatar to localStorage when changed
    useEffect(() => {
        localStorage.setItem('userAvatar', selectedAvatar);
    }, [selectedAvatar]);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const stats = await firebaseProgressAPI.getStats();

                const completed = stats.completed;
                setCompletedScenarios(completed);
                setTotalScenarios(stats.total);
                setCurrentLevel(completed);
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    const handleSaveProfile = () => {
        localStorage.setItem('userName', username);
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

    const handleExportData = async (format: 'pdf' | 'json') => {
        const exportData = {
            user: { email: user?.email, name: username, tier, rank: currentRank },
            stats: { completedScenarios, totalScenarios, daysSinceJoin },
            settings: { notifications, soundEnabled, vibrationEnabled },
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qadamsafe-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // For PDF, create a simple text export
            const text = `QadamSafe - ${t('settings.export.title')}\n\n` +
                `Email: ${user?.email}\n` +
                `${t('settings.stats.scenarios')}: ${completedScenarios}/${totalScenarios}\n` +
                `${t('settings.stats.level')}: ${currentLevel}\n` +
                `${t('settings.stats.daysWithUs')}: ${daysSinceJoin}\n` +
                `\n${t('settings.export.title')}: ${new Date().toLocaleDateString(i18n.language)}`;

            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qadamsafe-data-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const tier = user?.subscriptionTier || 'FREE';
    const currentRank = user?.rank || 1;
    const rankNames = [t('ranks.rank1'), t('ranks.rank2'), t('ranks.rank3'), t('ranks.rank4')];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 md:p-8">

                    {/* Page Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyber-green/30 blur-xl animate-pulse" />
                            <Settings className="relative h-10 w-10 text-cyber-green" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {t('settings.title')}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('settings.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Toast Notifications */}
                    {showSaveSuccess && (
                        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="flex items-center gap-3 bg-cyber-green/20 border border-cyber-green/50 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm">
                                <Check className="w-5 h-5 text-cyber-green" />
                                <span className="text-cyber-green font-medium">{t('settings.profile.saveSuccess')}</span>
                            </div>
                        </div>
                    )}

                    {showPasswordModal && (
                        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm">
                                <Info className="w-5 h-5 text-yellow-400" />
                                <span className="text-yellow-400 font-medium">{t('settings.security.passwordChangePlaceholder')}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">

                        {/* 1. USER PROFILE WITH AVATAR */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <User className="w-6 h-6 text-cyber-green" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.profile.title')}
                                    </h2>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyber-green/20 to-emerald-600/20 border-2 border-cyber-green/50 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,255,65,0.2)] transition-all duration-300 group-hover:scale-105">
                                                {selectedAvatar}
                                            </div>
                                            <button
                                                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyber-green text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Avatar Picker */}
                                        {showAvatarPicker && (
                                            <div className="mt-4 p-3 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {avatarEmojis.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => {
                                                                setSelectedAvatar(emoji);
                                                                setShowAvatarPicker(false);
                                                            }}
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110 ${selectedAvatar === emoji
                                                                ? 'bg-cyber-green/30 border border-cyber-green'
                                                                : 'bg-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rank Badge */}
                                        <div className={`mt-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentRank === 4 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                            currentRank === 3 ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' :
                                                currentRank === 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
                                                    'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                            }`}>
                                            {rankNames[currentRank - 1]}
                                        </div>
                                    </div>

                                    {/* Profile Form */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('settings.profile.username')}
                                            </label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('settings.profile.email')}
                                            </label>
                                            <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-400">{user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    {t('settings.profile.tier')}
                                                </label>
                                                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                                                    <CreditCard className="w-4 h-4 text-cyber-green" />
                                                    <span className="text-cyber-green font-semibold">{tier}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    {t('settings.profile.memberSince')}
                                                </label>
                                                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-400">
                                                        {accountCreatedDate.toLocaleDateString(i18n.language)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveProfile}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-green/20 border border-cyber-green/50 rounded-xl text-cyber-green font-medium hover:bg-cyber-green/30 transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]"
                                        >
                                            <Save className="w-4 h-4" />
                                            {t('settings.profile.save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. PERSONALIZATION - THEME & LANGUAGE */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Palette className="w-6 h-6 text-purple-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.personalization.title')}
                                    </h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        {t('settings.personalization.language')}
                                    </label>
                                    <LanguageSwitcher />
                                </div>

                                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    {t('settings.personalization.autoSave')}
                                </p>
                            </div>
                        </section>

                        {/* 3. NOTIFICATIONS */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Bell className="w-6 h-6 text-blue-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.notifications.title')}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Email notifications */}
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.notifications.email')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.notifications.emailDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications.email ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.email ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Push notifications */}
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.notifications.push')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.notifications.pushDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications.push ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.push ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Weekly report */}
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.notifications.weeklyReport')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.notifications.weeklyReportDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications.weeklyReport ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.weeklyReport ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Reminders */}
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.notifications.reminders')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.notifications.remindersDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, reminders: !notifications.reminders })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications.reminders ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.reminders ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. ACCOUNT STATISTICS */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                                        <h2 className="text-xl font-bold text-foreground">
                                            {t('settings.stats.title')}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => navigate('/progress')}
                                        className="text-sm text-cyber-green hover:underline"
                                    >
                                        {t('settings.progress.viewDetails')} →
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                                            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-foreground">{completedScenarios}/{totalScenarios}</p>
                                            <p className="text-xs text-muted-foreground">{t('settings.stats.scenarios')}</p>
                                        </div>

                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                                            <Award className="w-6 h-6 text-cyber-green mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-foreground">{currentLevel}</p>
                                            <p className="text-xs text-muted-foreground">{t('settings.stats.level')}</p>
                                        </div>

                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                                            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-foreground">0</p>
                                            <p className="text-xs text-muted-foreground">{t('settings.stats.streak')}</p>
                                        </div>

                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                                            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-foreground">{daysSinceJoin}</p>
                                            <p className="text-xs text-muted-foreground">{t('settings.stats.daysWithUs')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 5. EXPORT DATA */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Download className="w-6 h-6 text-cyan-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.export.title')}
                                    </h2>
                                </div>

                                <p className="text-muted-foreground text-sm mb-4">
                                    {t('settings.export.description')}
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleExportData('pdf')}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-foreground hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                                    >
                                        <FileText className="w-4 h-4 text-cyan-400" />
                                        {t('settings.export.pdf')}
                                    </button>
                                    <button
                                        onClick={() => handleExportData('json')}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-foreground hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                                    >
                                        <Download className="w-4 h-4 text-cyan-400" />
                                        {t('settings.export.json')}
                                    </button>
                                    <button
                                        onClick={() => handleExportData('pdf')}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-foreground hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all"
                                    >
                                        <Trophy className="w-4 h-4 text-yellow-400" />
                                        {t('settings.export.certificate')}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 6. CONNECTED ACCOUNTS */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Link2 className="w-6 h-6 text-indigo-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.accounts.title')}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Email</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyber-green/20 text-cyber-green border border-cyber-green/30">
                                            {t('settings.accounts.connected')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Google</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.accounts.notConnected')}</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors">
                                            {t('settings.accounts.connect')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 7. SOUND & HAPTICS */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Volume2 className="w-6 h-6 text-pink-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.sounds.title')}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.sounds.effects')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.sounds.effectsDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSoundEnabled(!soundEnabled)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Vibrate className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-foreground">{t('settings.sounds.haptics')}</p>
                                                <p className="text-xs text-muted-foreground">{t('settings.sounds.hapticsDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setVibrationEnabled(!vibrationEnabled)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${vibrationEnabled ? 'bg-cyber-green' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${vibrationEnabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. KEYBOARD SHORTCUTS */}
                        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                            <button
                                onClick={() => toggleSection('shortcuts')}
                                className="w-full relative p-6 text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Keyboard className="w-6 h-6 text-amber-400" />
                                        <h2 className="text-xl font-bold text-foreground">
                                            {t('settings.shortcuts.title')}
                                        </h2>
                                    </div>
                                    {activeSection === 'shortcuts' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>

                            {activeSection === 'shortcuts' && (
                                <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                        <span className="text-muted-foreground">{t('settings.shortcuts.nextStep')}</span>
                                        <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-foreground">Enter</kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                        <span className="text-muted-foreground">{t('settings.shortcuts.prevStep')}</span>
                                        <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-foreground">Backspace</kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                        <span className="text-muted-foreground">{t('settings.shortcuts.selectOption')}</span>
                                        <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-foreground">1-4</kbd>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 9. SECURITY */}
                        <section className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-gray-900/90 backdrop-blur-sm">
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="w-6 h-6 text-yellow-400" />
                                    <h2 className="text-xl font-bold text-foreground">
                                        {t('settings.security.title')}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handlePasswordChange}
                                        className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl text-foreground hover:border-yellow-500/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-yellow-400" />
                                            <span>{t('settings.security.changePassword')}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                    </button>

                                    <button
                                        className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl text-foreground hover:border-yellow-500/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-yellow-400" />
                                            <span>{t('settings.security.changeEmail')}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                    </button>

                                    <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
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
                            </div>
                        </section>

                        {/* 10. DANGER ZONE */}
                        <section className="relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/20 to-gray-900/90 backdrop-blur-sm">
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                    <h2 className="text-xl font-bold text-red-400">
                                        {t('settings.dangerZone.title')}
                                    </h2>
                                </div>

                                <p className="text-sm text-gray-400 mb-4">
                                    {t('settings.dangerZone.logoutWarning')}
                                </p>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border-2 border-red-500/40 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('settings.security.logout')}
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{t('settings.service.version')}</span>
                                <span className="text-gray-400 font-mono">v1.0.0</span>
                            </div>

                            <div className="flex gap-4">
                                <button className="text-cyber-green hover:underline text-sm">
                                    {t('settings.service.privacy')}
                                </button>
                                <button className="text-cyber-green hover:underline text-sm">
                                    {t('settings.service.terms')}
                                </button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {t('settings.service.disclaimer')}
                                </p>
                            </div>

                            <div className="text-center text-xs text-gray-600 pt-4">
                                © 2026 QadamSafe
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
