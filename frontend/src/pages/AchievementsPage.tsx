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
            nextRankProgress: rank < 4 ? t(`ranks.progress.toRank${rank + 1}`) : null,
        };
    };

    const getRankColor = (rank: number) => {
        if (rank === 4) return 'text-yellow-400 border-yellow-400 bg-yellow-400/10'; // Platinum/Gold for Rank 4
        if (rank === 3) return 'text-cyber-green border-cyber-green bg-cyber-green/10';
        if (rank === 2) return 'text-cyber-yellow border-cyber-yellow bg-cyber-yellow/10';
        return 'text-gray-400 border-gray-400 bg-gray-400/10';
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

                    {/* Rank Display Section */}
                    <div className={`cyber-card mb-8 border-2 ${getRankColor(currentRank)}`}>
                        <div className="flex items-start gap-6">
                            <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${getRankColor(currentRank)}`}>
                                <Shield className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-foreground">{t('ranks.title')}</h2>
                                    <span className={`text-xl font-semibold ${getRankColor(currentRank).split(' ')[0]}`}>
                                        {rankInfo.name}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mb-4">{rankInfo.description}</p>

                                {rankInfo.nextRankProgress && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{rankInfo.nextRankProgress}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ranks Overview Table */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-4">{t('ranks.overview')}</h2>
                        <p className="text-muted-foreground mb-6">{t('ranks.allRanks')}</p>

                        <div className="grid gap-4">
                            {/* Rank 1 - Начальный */}
                            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#2A2F3A' }}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6 text-gray-400" />
                                            <h3 className="text-xl font-bold text-gray-200">{t('ranks.rank1')}</h3>
                                        </div>
                                        {currentRank === 1 && (
                                            <span className="px-3 py-1 bg-gray-600/30 text-gray-300 text-sm rounded-full">
                                                {t('subscription.current')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 mb-3">{t('ranks.description1')}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-500">{t('ranks.howToEarn')}:</span>
                                        <span className="text-gray-400">{t('ranks.requirement1')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 2 - Продвинутый */}
                            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#34423F' }}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6 text-cyan-400" />
                                            <h3 className="text-xl font-bold text-cyan-200">{t('ranks.rank2')}</h3>
                                        </div>
                                        {currentRank === 2 && (
                                            <span className="px-3 py-1 bg-cyan-600/30 text-cyan-300 text-sm rounded-full">
                                                {t('subscription.current')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 mb-3">{t('ranks.description2')}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-500">{t('ranks.howToEarn')}:</span>
                                        <span className="text-gray-400">{t('ranks.requirement2')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 3 - Эксперт */}
                            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1F5E44' }}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6 text-green-400" />
                                            <h3 className="text-xl font-bold text-green-200">{t('ranks.rank3')}</h3>
                                        </div>
                                        {currentRank === 3 && (
                                            <span className="px-3 py-1 bg-green-600/30 text-green-300 text-sm rounded-full">
                                                {t('subscription.current')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 mb-3">{t('ranks.description3')}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-500">{t('ranks.howToEarn')}:</span>
                                        <span className="text-gray-400">{t('ranks.requirement3')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 4 - Надёжный */}
                            <div className="rounded-lg overflow-hidden border-2" style={{
                                backgroundColor: '#174C3A',
                                borderColor: '#C8B37A'
                            }}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6" style={{ color: '#C8B37A' }} />
                                            <h3 className="text-xl font-bold" style={{ color: '#C8B37A' }}>
                                                {t('ranks.rank4')}
                                            </h3>
                                        </div>
                                        {currentRank === 4 && (
                                            <span className="px-3 py-1 text-sm rounded-full" style={{
                                                backgroundColor: 'rgba(200, 179, 122, 0.2)',
                                                color: '#C8B37A'
                                            }}>
                                                {t('subscription.current')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 mb-3">{t('ranks.description4')}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-500">{t('ranks.howToEarn')}:</span>
                                        <span className="text-gray-400">{t('ranks.requirement4')}</span>
                                    </div>
                                </div>
                            </div>
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
