import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { achievementsAPI } from '../services/api';
import { Award, Lock, CheckCircle, Shield, TrendingUp } from 'lucide-react';
import type { UserAchievement } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AchievementsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            const data = await achievementsAPI.getUserAchievements();
            setAchievements(data);
        } catch (error) {
            console.error('Failed to load achievements:', error);
        } finally {
            setLoading(false);
        }
    };

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
        return new Date(dateString).toLocaleDateString();
    };

    const currentRank = user?.rank || 1;
    const rankInfo = getRankInfo(currentRank);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">

                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-4xl font-bold text-cyber-green mb-8">
                        {t('achievements.title')}
                    </h1>

                    {/* Current Rank Hero Section */}
                    <div className="relative mb-12 overflow-hidden rounded-2xl border border-cyber-green/30 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-1 backdrop-blur-xl">
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentRank === 4 ? 'from-yellow-500/10 to-yellow-600/10' :
                            currentRank === 3 ? 'from-cyber-green/10 to-emerald-600/10' :
                                currentRank === 2 ? 'from-cyan-500/10 to-blue-600/10' :
                                    'from-gray-500/10 to-gray-600/10'
                            } opacity-50`} />

                        <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                            {/* Rank Icon with Glow */}
                            <div className="relative">
                                <div className={`absolute inset-0 blur-2xl opacity-50 ${currentRank === 4 ? 'bg-yellow-500' :
                                    currentRank === 3 ? 'bg-cyber-green' :
                                        currentRank === 2 ? 'bg-cyan-500' :
                                            'bg-gray-500'
                                    }`} />
                                <div className={`relative flex h-32 w-32 items-center justify-center rounded-2xl border-2 bg-black/40 backdrop-blur-sm ${currentRank === 4 ? 'border-yellow-500 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' :
                                    currentRank === 3 ? 'border-cyber-green text-cyber-green shadow-[0_0_30px_rgba(0,255,65,0.3)]' :
                                        currentRank === 2 ? 'border-cyan-500 text-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]' :
                                            'border-gray-500 text-gray-400 shadow-[0_0_30px_rgba(107,114,128,0.3)]'
                                    }`}>
                                    <Shield className="h-16 w-16" />
                                </div>
                            </div>

                            {/* Rank Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-2 flex flex-col md:flex-row items-center gap-4">
                                    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('ranks.title')}
                                    </h2>
                                    <span className={`rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wider ${currentRank === 4 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                        currentRank === 3 ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' :
                                            currentRank === 2 ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50' :
                                                'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                        }`}>
                                        {rankInfo.name}
                                    </span>
                                </div>

                                <p className="mb-6 text-lg text-gray-300 max-w-2xl">
                                    {rankInfo.description}
                                </p>

                                {rankInfo.nextRankProgress && (
                                    <div className="flex items-center justify-center md:justify-start gap-3 rounded-lg bg-black/20 p-4 border border-white/5">
                                        <div className="rounded-full bg-cyber-green/20 p-2 text-cyber-green">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-400">{t('ranks.nextGoal')}</p>
                                            <p className="font-semibold text-foreground">{rankInfo.nextRankProgress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ranks Overview - Grid Layout */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">{t('ranks.overview')}</h2>
                                <p className="text-muted-foreground">{t('ranks.allRanks')}</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((rank) => {
                                const isCurrent = currentRank === rank;
                                const isUnlocked = currentRank >= rank;
                                const isLocked = currentRank < rank;

                                const styles = {
                                    1: { color: 'text-gray-400', border: 'border-gray-500', bg: 'from-gray-900', glow: 'shadow-gray-500/20' },
                                    2: { color: 'text-cyan-400', border: 'border-cyan-500', bg: 'from-cyan-950', glow: 'shadow-cyan-500/20' },
                                    3: { color: 'text-green-400', border: 'border-green-500', bg: 'from-green-950', glow: 'shadow-green-500/20' },
                                    4: { color: 'text-yellow-400', border: 'border-yellow-500', bg: 'from-yellow-950', glow: 'shadow-yellow-500/20' },
                                }[rank] || { color: 'text-gray-400', border: 'border-gray-500', bg: 'from-gray-900', glow: 'shadow-gray-500/20' };

                                return (
                                    <div
                                        key={rank}
                                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isCurrent ? `border-2 ${styles.border} ${styles.glow} shadow-lg ring-1 ring-offset-2 ring-offset-background ${styles.color}` :
                                            isUnlocked ? 'border-white/10 opacity-70 hover:opacity-100' :
                                                'border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-60'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} to-black opacity-50`} />

                                        <div className="relative p-6 flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`rounded-lg p-3 bg-black/40 border border-white/10 ${styles.color}`}>
                                                    <Shield className="w-6 h-6" />
                                                </div>
                                                {isCurrent && (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full bg-black/40 border border-current ${styles.color} animate-pulse`}>
                                                        {t('subscription.current')}
                                                    </span>
                                                )}
                                                {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                                                {isUnlocked && !isCurrent && <CheckCircle className="w-5 h-5 text-gray-500" />}
                                            </div>

                                            {/* Content */}
                                            <h3 className={`text-xl font-bold mb-2 group-hover:text-white transition-colors ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                                                {t(`ranks.rank${rank}`)}
                                            </h3>

                                            <p className="text-sm text-gray-400 mb-6 flex-1">
                                                {t(`ranks.description${rank}`)}
                                            </p>

                                            {/* Requirements Footer */}
                                            <div className="mt-auto pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                                                        {t('ranks.howToEarn')}
                                                    </span>
                                                </div>
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

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="text-cyber-green text-xl animate-pulse-glow">
                                {t('common.loading')}
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {achievements
                                .filter(achievement => !achievement.achievement.key.startsWith('rank_'))
                                .map((achievement) => {
                                    const progressPercent =
                                        (achievement.progress / achievement.achievement.requiredValue) * 100;

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`cyber-card ${achievement.completed
                                                ? 'border-cyber-green/50 bg-cyber-green/5'
                                                : 'opacity-75'
                                                }`}
                                        >
                                            {/* Icon & Status */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className={`w-16 h-16 rounded-lg flex items-center justify-center ${achievement.completed
                                                        ? 'bg-cyber-green/20 text-cyber-green'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    {achievement.completed ? (
                                                        <Award className="w-8 h-8" />
                                                    ) : (
                                                        <Lock className="w-8 h-8" />
                                                    )}
                                                </div>
                                                {achievement.completed && (
                                                    <CheckCircle className="w-6 h-6 text-cyber-green" />
                                                )}
                                            </div>

                                            {/* Title & Description */}
                                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                                {getLocalizedTitle(achievement)}
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                {getLocalizedDescription(achievement)}
                                            </p>

                                            {/* Progress Bar */}
                                            {!achievement.completed && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                        <span>{t('achievements.progress')}</span>
                                                        <span>
                                                            {achievement.progress} / {achievement.achievement.requiredValue}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-cyber-green transition-all duration-300"
                                                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Completion Date */}
                                            {achievement.completed && achievement.completedAt && (
                                                <p className="text-sm text-cyber-green">
                                                    {t('achievements.completedAt')}: {formatDate(achievement.completedAt)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
