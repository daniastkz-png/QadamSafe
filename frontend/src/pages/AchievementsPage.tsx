import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { firebaseAchievementsAPI } from '../services/firebase';
import {
    Award, Lock, CheckCircle, Shield, TrendingUp,
    Flame, Target, Star, Users, Calendar, Trophy,
    Zap, BookOpen, Eye, EyeOff, Sparkles, Crown,
    Medal, Gift, Clock, ChevronRight
} from 'lucide-react';
import type { UserAchievement } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Achievement rarity types
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// Category types
type Category = 'all' | 'training' | 'mastery' | 'activity' | 'social';

// Rarity styles configuration
const rarityStyles: Record<Rarity, { bg: string; border: string; text: string; glow: string; badge: string }> = {
    common: {
        bg: 'from-gray-800/80 to-gray-900/80',
        border: 'border-gray-500/30',
        text: 'text-gray-300',
        glow: '',
        badge: 'bg-gray-600/50 text-gray-300'
    },
    rare: {
        bg: 'from-blue-900/40 to-blue-950/60',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        badge: 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
    },
    epic: {
        bg: 'from-purple-900/40 to-purple-950/60',
        border: 'border-purple-500/40',
        text: 'text-purple-400',
        glow: 'shadow-[0_0_25px_rgba(147,51,234,0.2)]',
        badge: 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
    },
    legendary: {
        bg: 'from-yellow-900/30 to-amber-950/50',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        glow: 'shadow-[0_0_30px_rgba(234,179,8,0.25)]',
        badge: 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30'
    }
};

// Icon mapping for different achievement types
const achievementIcons: Record<string, React.ElementType> = {
    first_scenario: BookOpen,
    five_scenarios: Target,
    ten_scenarios: Trophy,
    perfect_score: Star,
    security_expert: Shield,
    streak_7: Flame,
    streak_30: Zap,
    invite_friend: Users,
    share_result: Gift,
    daily_login: Calendar,
    default: Award
};

// Get rarity based on achievement key
const getAchievementRarity = (key: string): Rarity => {
    if (key.includes('expert') || key.includes('master') || key.includes('legend')) return 'legendary';
    if (key.includes('perfect') || key.includes('streak_30') || key.includes('ten')) return 'epic';
    if (key.includes('five') || key.includes('streak_7') || key.includes('invite')) return 'rare';
    return 'common';
};

// Get category based on achievement key
const getAchievementCategory = (key: string): Category => {
    if (key.includes('scenario') || key.includes('complete')) return 'training';
    if (key.includes('perfect') || key.includes('expert') || key.includes('master')) return 'mastery';
    if (key.includes('streak') || key.includes('login') || key.includes('daily')) return 'activity';
    if (key.includes('invite') || key.includes('share') || key.includes('friend')) return 'social';
    return 'training';
};

export const AchievementsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [showSecretAchievements, setShowSecretAchievements] = useState(false);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            const data = await firebaseAchievementsAPI.getUserAchievements() as UserAchievement[];
            setAchievements(data);
        } catch (error) {
            console.error('Failed to load achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    // Statistics calculations
    const stats = useMemo(() => {
        const total = achievements.filter(a => !a.achievement.key.startsWith('rank_')).length;
        const completed = achievements.filter(a => a.completed && !a.achievement.key.startsWith('rank_')).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const latestAchievement = achievements
            .filter(a => a.completed && a.completedAt)
            .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

        return { total, completed, percentage, latestAchievement };
    }, [achievements]);

    // Closest achievements (almost completed)
    const closestAchievements = useMemo(() => {
        return achievements
            .filter(a => !a.completed && !a.achievement.key.startsWith('rank_'))
            .map(a => ({
                ...a,
                progressPercent: (a.progress / a.achievement.requiredValue) * 100
            }))
            .sort((a, b) => b.progressPercent - a.progressPercent)
            .slice(0, 3);
    }, [achievements]);

    // Filtered achievements by category
    const filteredAchievements = useMemo(() => {
        return achievements
            .filter(a => !a.achievement.key.startsWith('rank_'))
            .filter(a => {
                if (activeCategory === 'all') return true;
                return getAchievementCategory(a.achievement.key) === activeCategory;
            });
    }, [achievements, activeCategory]);

    // Secret achievements (locked and not started)
    const secretAchievements = useMemo(() => {
        return achievements.filter(a =>
            !a.completed &&
            a.progress === 0 &&
            !a.achievement.key.startsWith('rank_') &&
            (a.achievement.key.includes('secret') || a.achievement.key.includes('hidden'))
        );
    }, [achievements]);

    const getRankInfo = (rank: number) => {
        return {
            name: t(`ranks.rank${rank}`),
            description: t(`ranks.description${rank}`),
            nextRankProgress: rank < 3 ? t(`ranks.progress.toRank${rank + 1}`) : null,
        };
    };

    const getLocalizedTitle = (achievement: UserAchievement) => {
        if (i18n.language === 'en' && achievement.achievement.titleEn) {
            return achievement.achievement.titleEn;
        }
        if (i18n.language === 'kk' && achievement.achievement.titleKk) {
            return achievement.achievement.titleKk;
        }
        return achievement.achievement.title;
    };

    const getLocalizedDescription = (achievement: UserAchievement) => {
        if (i18n.language === 'en' && achievement.achievement.descriptionEn) {
            return achievement.achievement.descriptionEn;
        }
        if (i18n.language === 'kk' && achievement.achievement.descriptionKk) {
            return achievement.achievement.descriptionKk;
        }
        return achievement.achievement.description;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getAchievementIcon = (key: string) => {
        for (const [pattern, Icon] of Object.entries(achievementIcons)) {
            if (key.includes(pattern)) return Icon;
        }
        return Award;
    };

    const currentRank = user?.rank || 1;
    const rankInfo = getRankInfo(currentRank);
    const rankProgress = currentRank < 4 ? ((currentRank) / 4) * 100 : 100;

    const categories: { key: Category; icon: React.ElementType; label: string }[] = [
        { key: 'all', icon: Trophy, label: t('achievements.categories.all') },
        { key: 'training', icon: BookOpen, label: t('achievements.categories.training') },
        { key: 'mastery', icon: Star, label: t('achievements.categories.mastery') },
        { key: 'activity', icon: Flame, label: t('achievements.categories.activity') },
        { key: 'social', icon: Users, label: t('achievements.categories.social') },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 md:p-8">

                    {/* Header with animated title */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyber-green/30 blur-xl animate-pulse" />
                            <Trophy className="relative h-10 w-10 text-cyber-green" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                {t('achievements.title')}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('achievements.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Total Achievements */}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-4 md:p-6 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Medal className="h-5 w-5 text-cyber-green" />
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                        {t('achievements.stats.total')}
                                    </span>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">
                                    {stats.completed}<span className="text-muted-foreground text-lg">/{stats.total}</span>
                                </p>
                            </div>
                        </div>

                        {/* Completion Percentage */}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-4 md:p-6 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-blue-400" />
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                        {t('achievements.stats.completion')}
                                    </span>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">
                                    {stats.percentage}%
                                </p>
                            </div>
                        </div>

                        {/* Current Streak (placeholder) */}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-4 md:p-6 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="h-5 w-5 text-orange-400" />
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                        {t('achievements.stats.streak')}
                                    </span>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">
                                    0 <span className="text-muted-foreground text-lg">{t('achievements.stats.days')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Latest Achievement */}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-4 md:p-6 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-purple-400" />
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                        {t('achievements.stats.latest')}
                                    </span>
                                </div>
                                <p className="text-sm md:text-base font-medium text-foreground truncate">
                                    {stats.latestAchievement
                                        ? getLocalizedTitle(stats.latestAchievement)
                                        : t('achievements.stats.none')
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Rank Hero Section */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl border border-cyber-green/30 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentRank === 4 ? 'from-yellow-500/10 to-yellow-600/10' :
                            currentRank === 3 ? 'from-cyber-green/10 to-emerald-600/10' :
                                currentRank === 2 ? 'from-cyan-500/10 to-blue-600/10' :
                                    'from-gray-500/10 to-gray-600/10'
                            } opacity-50`} />

                        <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
                            {/* Rank Icon with Glow */}
                            <div className="relative">
                                <div className={`absolute inset-0 blur-2xl opacity-50 ${currentRank === 4 ? 'bg-yellow-500' :
                                    currentRank === 3 ? 'bg-cyber-green' :
                                        currentRank === 2 ? 'bg-cyan-500' :
                                            'bg-gray-500'
                                    }`} />
                                <div className={`relative flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-2xl border-2 bg-black/40 backdrop-blur-sm transition-all duration-500 ${currentRank === 4 ? 'border-yellow-500 text-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)]' :
                                    currentRank === 3 ? 'border-cyber-green text-cyber-green shadow-[0_0_40px_rgba(0,255,65,0.4)]' :
                                        currentRank === 2 ? 'border-cyan-500 text-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.4)]' :
                                            'border-gray-500 text-gray-400 shadow-[0_0_40px_rgba(107,114,128,0.4)]'
                                    }`}>
                                    {currentRank === 4 ? (
                                        <Crown className="h-14 w-14 md:h-16 md:w-16" />
                                    ) : (
                                        <Shield className="h-14 w-14 md:h-16 md:w-16" />
                                    )}
                                </div>
                            </div>

                            {/* Rank Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-2 flex flex-col md:flex-row items-center gap-3">
                                    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('ranks.title')}
                                    </h2>
                                    <span className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${currentRank === 4 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                        currentRank === 3 ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' :
                                            currentRank === 2 ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50' :
                                                'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                        }`}>
                                        {rankInfo.name}
                                    </span>
                                </div>

                                <p className="mb-4 text-base md:text-lg text-gray-300 max-w-2xl">
                                    {rankInfo.description}
                                </p>

                                {/* Rank Progress Bar */}
                                {currentRank < 4 && (
                                    <div className="max-w-md mx-auto md:mx-0">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                            <span>{t('ranks.rank' + currentRank)}</span>
                                            <span>{t('ranks.rank' + (currentRank + 1))}</span>
                                        </div>
                                        <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${currentRank === 3 ? 'bg-gradient-to-r from-cyber-green to-emerald-400' :
                                                    currentRank === 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-400' :
                                                        'bg-gradient-to-r from-gray-500 to-gray-400'
                                                    }`}
                                                style={{ width: `${rankProgress}%` }}
                                            />
                                        </div>
                                        {rankInfo.nextRankProgress && (
                                            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-cyber-green" />
                                                {rankInfo.nextRankProgress}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Closest Achievements Section */}
                    {closestAchievements.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                                {t('achievements.closest.title')}
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {closestAchievements.map((achievement) => {
                                    const rarity = getAchievementRarity(achievement.achievement.key);
                                    const styles = rarityStyles[rarity];
                                    const Icon = getAchievementIcon(achievement.achievement.key);

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`relative overflow-hidden rounded-xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-4 backdrop-blur-sm ${styles.glow} transition-all duration-300 hover:scale-[1.02]`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 ${styles.text}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-foreground truncate">
                                                        {getLocalizedTitle(achievement)}
                                                    </h3>
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                            <span>{t('achievements.progress')}</span>
                                                            <span className={styles.text}>
                                                                {achievement.progress}/{achievement.achievement.requiredValue}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                                                    rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                                                                        rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                                                                            'bg-gradient-to-r from-gray-500 to-gray-400'
                                                                    }`}
                                                                style={{ width: `${achievement.progressPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Tabs */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {categories.map(({ key, icon: Icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === key
                                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50 shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Ranks Overview */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-1">{t('ranks.overview')}</h2>
                                <p className="text-muted-foreground text-sm">{t('ranks.allRanks')}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((rank) => {
                                const isCurrent = currentRank === rank;
                                const isUnlocked = currentRank >= rank;
                                const isLocked = currentRank < rank;

                                const styles = {
                                    1: { color: 'text-gray-400', border: 'border-gray-500', bg: 'from-gray-900', glow: 'shadow-gray-500/20', icon: Shield },
                                    2: { color: 'text-cyan-400', border: 'border-cyan-500', bg: 'from-cyan-950', glow: 'shadow-cyan-500/20', icon: Shield },
                                    3: { color: 'text-green-400', border: 'border-green-500', bg: 'from-green-950', glow: 'shadow-green-500/20', icon: Shield },
                                    4: { color: 'text-yellow-400', border: 'border-yellow-500', bg: 'from-yellow-950', glow: 'shadow-yellow-500/20', icon: Crown },
                                }[rank] || { color: 'text-gray-400', border: 'border-gray-500', bg: 'from-gray-900', glow: 'shadow-gray-500/20', icon: Shield };

                                const IconComponent = styles.icon;

                                return (
                                    <div
                                        key={rank}
                                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${isCurrent ? `border-2 ${styles.border} ${styles.glow} shadow-lg` :
                                            isUnlocked ? 'border-white/10 opacity-80 hover:opacity-100' :
                                                'border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-70'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} to-black opacity-60`} />

                                        <div className="relative p-5 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`rounded-lg p-2.5 bg-black/40 border border-white/10 ${styles.color}`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                {isCurrent && (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full bg-black/40 border border-current ${styles.color} animate-pulse`}>
                                                        {t('subscription.current')}
                                                    </span>
                                                )}
                                                {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                                                {isUnlocked && !isCurrent && <CheckCircle className="w-4 h-4 text-gray-500" />}
                                            </div>

                                            <h3 className={`text-lg font-bold mb-1.5 transition-colors ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {t(`ranks.rank${rank}`)}
                                            </h3>

                                            <p className="text-xs text-gray-400 mb-4 flex-1">
                                                {t(`ranks.description${rank}`)}
                                            </p>

                                            <div className="mt-auto pt-3 border-t border-white/5">
                                                <p className={`text-xs ${isCurrent || isUnlocked ? styles.color : 'text-gray-500'}`}>
                                                    {t(`ranks.requirement${rank}`)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Achievements Grid */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Award className="h-6 w-6 text-cyber-green" />
                            {activeCategory === 'all'
                                ? t('achievements.allAchievements')
                                : t(`achievements.categories.${activeCategory}`)
                            }
                        </h2>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
                                    <span className="text-cyber-green text-xl">{t('common.loading')}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredAchievements.map((achievement, index) => {
                                    const rarity = getAchievementRarity(achievement.achievement.key);
                                    const styles = rarityStyles[rarity];
                                    const Icon = getAchievementIcon(achievement.achievement.key);
                                    const progressPercent = (achievement.progress / achievement.achievement.requiredValue) * 100;
                                    const isNew = achievement.completedAt &&
                                        new Date(achievement.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`group relative overflow-hidden rounded-xl border transition-all duration-500 hover:scale-[1.02] ${achievement.completed
                                                ? `${styles.border} ${styles.glow} bg-gradient-to-br ${styles.bg}`
                                                : 'border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/80 opacity-70 hover:opacity-100'
                                                }`}
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                                animation: 'fadeInUp 0.5s ease-out forwards'
                                            }}
                                        >
                                            {/* Shine effect for new achievements */}
                                            {achievement.completed && isNew && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />
                                            )}

                                            <div className="relative p-5">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${achievement.completed
                                                        ? `bg-black/30 ${styles.text} group-hover:scale-110`
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {achievement.completed ? (
                                                            <Icon className="w-7 h-7" />
                                                        ) : (
                                                            <Lock className="w-7 h-7" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {achievement.completed && (
                                                            <CheckCircle className={`w-5 h-5 ${styles.text}`} />
                                                        )}
                                                        {/* Rarity badge */}
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${styles.badge}`}>
                                                            {t(`achievements.rarity.${rarity}`)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title & Description */}
                                                <h3 className={`text-lg font-bold mb-2 transition-colors ${achievement.completed ? 'text-foreground' : 'text-gray-400'
                                                    }`}>
                                                    {getLocalizedTitle(achievement)}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                    {getLocalizedDescription(achievement)}
                                                </p>

                                                {/* Progress Bar */}
                                                {!achievement.completed && (
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                                            <span>{t('achievements.progress')}</span>
                                                            <span>
                                                                {achievement.progress} / {achievement.achievement.requiredValue}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-cyber-green to-emerald-400 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Completion Date */}
                                                {achievement.completed && achievement.completedAt && (
                                                    <div className={`flex items-center gap-2 text-sm ${styles.text}`}>
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(achievement.completedAt)}
                                                        {isNew && (
                                                            <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-cyber-green/20 text-cyber-green rounded-full border border-cyber-green/30">
                                                                {t('achievements.new')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Secret Achievements Section */}
                    {secretAchievements.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <button
                                onClick={() => setShowSecretAchievements(!showSecretAchievements)}
                                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-6"
                            >
                                {showSecretAchievements ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                                <span className="text-lg font-semibold">{t('achievements.secret.title')}</span>
                                <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full">
                                    {secretAchievements.length}
                                </span>
                                <ChevronRight className={`h-5 w-5 transition-transform ${showSecretAchievements ? 'rotate-90' : ''}`} />
                            </button>

                            {showSecretAchievements && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {secretAchievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className="relative overflow-hidden rounded-xl border border-dashed border-white/20 bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-5 opacity-60"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 text-muted-foreground">
                                                    <Lock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-foreground">???</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('achievements.secret.hint')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filteredAchievements.length === 0 && (
                        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-xl font-medium text-muted-foreground">
                                {t('achievements.noAchievements')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {t('achievements.startTraining')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shine {
                    to {
                        transform: translateX(200%);
                    }
                }
                
                .animate-shine {
                    animation: shine 2s ease-in-out infinite;
                }
            `}</style>
        </DashboardLayout>
    );
};
