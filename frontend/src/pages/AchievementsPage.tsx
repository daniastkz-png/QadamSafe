import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { achievementsAPI } from '../services/api';
import { Award, Lock, CheckCircle, TrendingUp, User, UserCheck, UserCog, UserPlus } from 'lucide-react';
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

    const getRankIcon = (rank: number, className: string) => {
        switch (rank) {
            case 1: return <User className={className} />;
            case 2: return <UserPlus className={className} />;
            case 3: return <UserCog className={className} />;
            case 4: return <UserCheck className={className} />;
            default: return <User className={className} />;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">

                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-4xl font-bold text-cyber-green mb-8 drop-shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                        {t('achievements.title')}
                    </h1>

                    {/* Current Rank Hero Section */}
                    <div className="relative mb-12 overflow-hidden rounded-2xl border border-cyber-green/50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentRank === 4 ? 'from-yellow-400/20 to-yellow-600/20' :
                            currentRank === 3 ? 'from-green-400/20 to-emerald-600/20' :
                                currentRank === 2 ? 'from-cyan-400/20 to-blue-600/20' :
                                    'from-gray-400/20 to-gray-600/20'
                            } opacity-60 backdrop-blur-md`} />

                        <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                            {/* Rank Icon with Glow */}
                            <div className="relative group">
                                <div className={`absolute inset-0 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-80 ${currentRank === 4 ? 'bg-yellow-400' :
                                    currentRank === 3 ? 'bg-green-400' :
                                        currentRank === 2 ? 'bg-cyan-400' :
                                            'bg-gray-400'
                                    }`} />
                                <div className={`relative flex h-36 w-36 items-center justify-center rounded-2xl border-2 bg-black/60 backdrop-blur-md transition-all duration-300 group-hover:scale-105 ${currentRank === 4 ? 'border-yellow-400 text-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]' :
                                    currentRank === 3 ? 'border-green-400 text-green-400 shadow-[0_0_40px_rgba(74,222,128,0.4)]' :
                                        currentRank === 2 ? 'border-cyan-400 text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)]' :
                                            'border-gray-400 text-gray-200 shadow-[0_0_40px_rgba(156,163,175,0.4)]'
                                    }`}>
                                    {getRankIcon(currentRank, "h-20 w-20")}
                                </div>
                            </div>

                            {/* Rank Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-3 flex flex-col md:flex-row items-center gap-4">
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                        {t('ranks.title')}
                                    </h2>
                                    <span className={`rounded-full px-6 py-1.5 text-sm font-extrabold uppercase tracking-wider shadow-lg ${currentRank === 4 ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400' :
                                        currentRank === 3 ? 'bg-green-400/20 text-green-300 border border-green-400' :
                                            currentRank === 2 ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400' :
                                                'bg-gray-400/20 text-gray-100 border border-gray-400'
                                        }`}>
                                        {rankInfo.name}
                                    </span>
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-md">
                                    {rankInfo.name}
                                </h3>

                                <p className="mb-8 text-lg text-gray-200 max-w-2xl leading-relaxed">
                                    {rankInfo.description}
                                </p>

                                {rankInfo.nextRankProgress && (
                                    <div className="flex items-center justify-center md:justify-start gap-4 rounded-xl bg-black/40 p-5 border border-white/10 backdrop-blur-sm hover:bg-black/50 transition-colors">
                                        <div className="rounded-full bg-cyber-green/20 p-3 text-cyber-green shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-300 mb-0.5">{t('ranks.nextGoal')}</p>
                                            <p className="text-lg font-bold text-white">{rankInfo.nextRankProgress}</p>
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
                                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{t('ranks.overview')}</h2>
                                <p className="text-gray-300 text-lg">{t('ranks.allRanks')}</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((rank) => {
                                const isCurrent = currentRank === rank;
                                const isUnlocked = currentRank >= rank;
                                const isLocked = currentRank < rank;

                                const styles = {
                                    1: { color: 'text-gray-200', border: 'border-gray-400', bg: 'from-gray-800', glow: 'shadow-gray-400/30' },
                                    2: { color: 'text-cyan-300', border: 'border-cyan-400', bg: 'from-cyan-900', glow: 'shadow-cyan-400/30' },
                                    3: { color: 'text-green-300', border: 'border-green-400', bg: 'from-green-900', glow: 'shadow-green-400/30' },
                                    4: { color: 'text-yellow-300', border: 'border-yellow-400', bg: 'from-yellow-900', glow: 'shadow-yellow-400/30' },
                                }[rank] || { color: 'text-gray-200', border: 'border-gray-400', bg: 'from-gray-800', glow: 'shadow-gray-400/30' };

                                return (
                                    <div
                                        key={rank}
                                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${isCurrent ? `border-2 ${styles.border} ${styles.glow} shadow-xl ring-1 ring-offset-2 ring-offset-background ${styles.color} bg-black/40` :
                                            isUnlocked ? 'border-white/20 opacity-80 hover:opacity-100 hover:border-white/40 bg-black/30' :
                                                'border-white/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-70 bg-black/20'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} via-black/50 to-black opacity-60`} />

                                        <div className="relative p-6 flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`rounded-lg p-3 bg-black/50 border border-white/20 backdrop-blur-md ${styles.color} shadow-lg`}>
                                                    {getRankIcon(rank, "w-8 h-8")}
                                                </div>
                                                {isCurrent && (
                                                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full bg-black/60 border border-current ${styles.color} animate-pulse shadow-[0_0_10px_currentColor]`}>
                                                        {t('subscription.current')}
                                                    </span>
                                                )}
                                                {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                                                {isUnlocked && !isCurrent && <CheckCircle className="w-5 h-5 text-gray-400" />}
                                            </div>

                                            {/* Content */}
                                            <h3 className={`text-2xl font-bold mb-3 group-hover:text-white transition-colors ${isCurrent ? 'text-white' : 'text-gray-200'} drop-shadow-sm`}>
                                                {t(`ranks.rank${rank}`)}
                                            </h3>

                                            <p className="text-gray-300 mb-6 flex-1 text-sm leading-relaxed">
                                                {t(`ranks.description${rank}`)}
                                            </p>

                                            {/* Requirements Footer */}
                                            <div className="mt-auto pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Award className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        {t('ranks.howToEarn')}
                                                    </span>
                                                </div>
                                                <p className={`text-sm font-medium ${isCurrent || isUnlocked ? styles.color : 'text-gray-400'}`}>
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
