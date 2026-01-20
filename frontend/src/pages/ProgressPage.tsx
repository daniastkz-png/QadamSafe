import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProtectionStatsCard } from '../components/ProtectionStats';
import { firebaseProgressAPI } from '../services/firebase';
import {
    TrendingUp, Target, AlertTriangle, CheckCircle, XCircle, Shield, Clock,
    Award, Flame, Calendar, BarChart3, Trophy, ChevronRight, Zap, Star
} from 'lucide-react';
import type { ProgressStats, UserProgress, Scenario } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton, SkeletonList } from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{count}</span>;
};

// Skill Radar Chart (Simple CSS-based)
const SkillRadar: React.FC<{ skills: { name: string; value: number; color: string }[] }> = ({ skills }) => {
    return (
        <div className="relative w-full aspect-square max-w-[250px] mx-auto">
            {/* Background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-border/30" />
                <div className="absolute w-3/4 h-3/4 rounded-full border border-border/30" />
                <div className="absolute w-1/2 h-1/2 rounded-full border border-border/30" />
                <div className="absolute w-1/4 h-1/4 rounded-full border border-border/30" />
            </div>

            {/* Skill points */}
            {skills.map((skill, index) => {
                const angle = (index * 360) / skills.length - 90;
                const radian = (angle * Math.PI) / 180;
                const radius = (skill.value / 100) * 45; // 45% of container
                const x = 50 + radius * Math.cos(radian);
                const y = 50 + radius * Math.sin(radian);

                return (
                    <div key={skill.name} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: skill.color, boxShadow: `0 0 10px ${skill.color}` }}
                        />
                    </div>
                );
            })}

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-cyber-green/50" />
            </div>

            {/* Labels */}
            {skills.map((skill, index) => {
                const angle = (index * 360) / skills.length - 90;
                const radian = (angle * Math.PI) / 180;
                const x = 50 + 55 * Math.cos(radian);
                const y = 50 + 55 * Math.sin(radian);

                return (
                    <div
                        key={`label-${skill.name}`}
                        className="absolute text-xs text-muted-foreground whitespace-nowrap"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {skill.name}
                    </div>
                );
            })}
        </div>
    );
};

// Activity Calendar (Last 7 days)
const ActivityCalendar: React.FC<{ activities: { date: string; count: number }[] }> = ({ activities }) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    // Get last 7 days
    const last7Days = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const activity = activities.find(a => a.date === dateStr);
            result.push({
                date: dateStr,
                day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
                count: activity?.count || 0,
                isToday: i === 0
            });
        }
        return result;
    }, [activities]);

    const maxCount = Math.max(...last7Days.map(d => d.count), 1);

    return (
        <div className="flex items-end gap-2 h-24">
            {last7Days.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className={`w-full rounded-t transition-all duration-500 ${day.count > 0
                            ? 'bg-gradient-to-t from-cyber-green/50 to-cyber-green'
                            : 'bg-muted/30'
                            } ${day.isToday ? 'ring-2 ring-cyber-green ring-offset-2 ring-offset-background' : ''}`}
                        style={{
                            height: `${Math.max((day.count / maxCount) * 100, 10)}%`,
                            animationDelay: `${index * 100}ms`
                        }}
                    />
                    <span className={`text-xs ${day.isToday ? 'text-cyber-green font-bold' : 'text-muted-foreground'}`}>
                        {day.day}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Streak Banner
const StreakBanner: React.FC<{ streak: number; bestStreak: number }> = ({ streak, bestStreak }) => {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-orange-500/30 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent" />
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Flame className="w-12 h-12 text-orange-500" />
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {streak}
                        </span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground">
                            {streak === 0
                                ? t('progress.streak.start', 'Начните серию!')
                                : t('progress.streak.current', '{{count}} дней подряд!', { count: streak })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('progress.streak.best', 'Лучшая серия: {{count}} дней', { count: bestStreak })}
                        </p>
                    </div>
                </div>
                {streak > 0 && (
                    <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                            <Flame
                                key={i}
                                className={`w-5 h-5 ${i < streak ? 'text-orange-500' : 'text-muted'}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Rank Progress Card
const RankProgressCard: React.FC<{
    currentRank: string;
    nextRank: string;
    progress: number;
    xpCurrent: number;
    requirement?: string;
}> = ({ currentRank, nextRank, progress, xpCurrent, requirement }) => {
    const { t } = useTranslation();

    return (
        <div className="cyber-card border-2 border-cyber-green/30">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-green/20 rounded-lg">
                        <Trophy className="w-6 h-6 text-cyber-green" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('progress.currentRank', 'Текущий ранг')}</p>
                        <p className="text-lg font-bold text-cyber-green">{currentRank}</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('progress.nextRank', 'Следующий')}</p>
                    <p className="text-lg font-bold text-muted-foreground">{nextRank}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyber-green to-cyan-400 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${Math.min(100, progress)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span className="text-cyber-green font-medium">{xpCurrent} XP</span>
                    <span className="text-muted-foreground">
                        {progress >= 100 ? '✓ ' + t('progress.completed', 'Достигнуто') : requirement || `${progress}%`}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Achievement Preview Card
const AchievementPreview: React.FC<{
    icon: string;
    title: string;
    progress: number;
    total: number;
    unlocked: boolean;
}> = ({ icon, title, progress, total, unlocked }) => {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${unlocked
            ? 'bg-cyber-green/10 border-cyber-green/30'
            : 'bg-muted/20 border-border'
            }`}>
            <div className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${unlocked ? 'bg-cyber-green' : 'bg-muted-foreground'
                                }`}
                            style={{ width: `${(progress / total) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">{progress}/{total}</span>
                </div>
            </div>
            {unlocked && <Star className="w-4 h-4 text-cyber-yellow fill-cyber-yellow" />}
        </div>
    );
};

export const ProgressPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate streak from progress data (days with completed scenarios)
    const streakData = useMemo(() => {
        if (progress.length === 0) return { current: 0, best: 0 };

        // Get unique dates when scenarios were completed
        const completedDates = new Set<string>();
        progress.forEach(p => {
            if (p.completedAt) {
                let date: Date;
                if ((p.completedAt as any)?.toDate) {
                    date = (p.completedAt as any).toDate();
                } else if ((p.completedAt as any)?.seconds) {
                    date = new Date((p.completedAt as any).seconds * 1000);
                } else {
                    date = new Date(p.completedAt);
                }
                completedDates.add(date.toISOString().split('T')[0]);
            }
        });

        const sortedDates = Array.from(completedDates).sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let currentStreak = 0;

        // Check if user has activity today or yesterday (to not break streak)
        if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
            for (let i = 0; i < 365; i++) {
                const dateToCheck = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                if (completedDates.has(dateToCheck)) {
                    currentStreak++;
                } else if (i > 0) { // Allow gap only for today
                    break;
                }
            }
        }

        // Best streak would need to be stored in DB, for now use max of current and completed scenarios count
        const bestStreak = Math.max(currentStreak, Math.min(progress.length, 7));

        return { current: currentStreak, best: bestStreak };
    }, [progress]);

    // Calculate rank progress from user data based on actual rank criteria
    const rankData = useMemo(() => {
        const currentRank = user?.rank || 1;
        const securityScore = user?.securityScore || 0;
        const completed = stats?.completed || 0;
        const total = stats?.total || 5;

        // Count perfect scenarios (no mistakes) from progress
        const perfectScenarios = progress.filter(p => p.mistakes === 0).length;
        const totalMistakes = progress.reduce((sum, p) => sum + (p.mistakes || 0), 0);
        const safeDecisionRate = completed > 0 ? Math.round((1 - (totalMistakes / (completed * 3))) * 100) : 0;

        // Rank requirements:
        // Rank 1: Default
        // Rank 2: 3+ perfect scenarios
        // Rank 3: 5+ scenarios with 70%+ safe decisions  
        // Rank 4: All scenarios without any mistakes

        let rankProgressPercent = 0;
        let nextRankRequirement = '';

        if (currentRank === 1) {
            // Progress to Rank 2: Need 3 perfect scenarios
            rankProgressPercent = Math.min(100, (perfectScenarios / 3) * 100);
            nextRankRequirement = `${perfectScenarios}/3`;
        } else if (currentRank === 2) {
            // Progress to Rank 3: Need 5+ scenarios with 70%+ safe decisions
            const scenarioProgress = Math.min(100, (completed / 5) * 50);
            const safeProgress = Math.min(100, (safeDecisionRate / 70) * 50);
            rankProgressPercent = scenarioProgress + safeProgress;
            nextRankRequirement = `${completed}/5, ${safeDecisionRate}%`;
        } else if (currentRank === 3) {
            // Progress to Rank 4: All scenarios without mistakes
            const allPerfect = completed >= total && totalMistakes === 0;
            rankProgressPercent = allPerfect ? 100 : (perfectScenarios / total) * 100;
            nextRankRequirement = `${perfectScenarios}/${total}`;
        } else {
            rankProgressPercent = 100;
            nextRankRequirement = '✓';
        }

        return {
            currentRank,
            xpCurrent: securityScore,
            xpNeeded: securityScore + 100, // Just for display, shows total XP
            progress: Math.round(rankProgressPercent),
            requirement: nextRankRequirement
        };
    }, [user, stats, progress]);

    // Skill categories based on actual scenario types completed
    const skills = useMemo(() => {
        const skillMap: { [key: string]: { completed: number; total: number } } = {
            'phishing': { completed: 0, total: 2 },
            'sms': { completed: 0, total: 2 },
            'call': { completed: 0, total: 1 },
            'social': { completed: 0, total: 1 },
        };

        // Count completed scenarios by type
        progress.forEach(p => {
            const scenario = p.scenario;
            if (scenario) {
                const type = scenario.type?.toLowerCase() || '';
                if (type.includes('sms') || type.includes('phishing')) {
                    skillMap.sms.completed++;
                }
                if (type.includes('email') || type.includes('phishing')) {
                    skillMap.phishing.completed++;
                }
                if (type.includes('social') || type.includes('engineering')) {
                    skillMap.social.completed++;
                }
                if (type.includes('call') || type.includes('investment')) {
                    skillMap.call.completed++;
                }
            }
        });

        // If no scenarios completed, use default values based on stats
        const hasProgress = progress.length > 0;
        const baseScore = hasProgress ? 20 : 0;

        return [
            {
                name: 'Фишинг',
                value: hasProgress ? Math.min(100, baseScore + (skillMap.phishing.completed * 40)) : 0,
                color: '#00ff41'
            },
            {
                name: 'SMS',
                value: hasProgress ? Math.min(100, baseScore + (skillMap.sms.completed * 40)) : 0,
                color: '#00d4ff'
            },
            {
                name: 'Звонки',
                value: hasProgress ? Math.min(100, baseScore + (skillMap.call.completed * 50)) : 0,
                color: '#ff6b6b'
            },
            {
                name: 'Соц. инженерия',
                value: hasProgress ? Math.min(100, baseScore + (skillMap.social.completed * 50)) : 0,
                color: '#ffd93d'
            },
        ];
    }, [progress]);

    // Activity data for last 7 days - calculated from real progress
    const activityData = useMemo(() => {
        const data: { date: string; count: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Count scenarios completed on this date
            const count = progress.filter(p => {
                if (!p.completedAt) return false;
                let completedDate: string;
                if ((p.completedAt as any)?.toDate) {
                    completedDate = (p.completedAt as any).toDate().toISOString().split('T')[0];
                } else if ((p.completedAt as any)?.seconds) {
                    completedDate = new Date((p.completedAt as any).seconds * 1000).toISOString().split('T')[0];
                } else {
                    completedDate = new Date(p.completedAt).toISOString().split('T')[0];
                }
                return completedDate === dateStr;
            }).length;

            data.push({ date: dateStr, count });
        }

        return data;
    }, [progress]);

    // Real achievements based on actual progress
    const achievements = useMemo(() => {
        const completed = stats?.completed || 0;
        const total = stats?.total || 5;
        const streak = streakData.current;

        // Count perfect scenarios (no mistakes)
        const perfectScenarios = progress.filter(p => p.mistakes === 0).length;

        return [
            {
                icon: '🎯',
                title: t('progress.achievements.firstScenario', 'Первый шаг'),
                progress: Math.min(1, completed),
                total: 1,
                unlocked: completed >= 1
            },
            {
                icon: '🔥',
                title: t('progress.achievements.streak3', '3 дня подряд'),
                progress: Math.min(3, streak),
                total: 3,
                unlocked: streak >= 3
            },
            {
                icon: '🛡️',
                title: t('progress.achievements.noMistakes', 'Без ошибок'),
                progress: perfectScenarios,
                total: 5,
                unlocked: perfectScenarios >= 5
            },
            {
                icon: '🏆',
                title: t('progress.achievements.allScenarios', 'Все сценарии'),
                progress: completed,
                total: total,
                unlocked: completed >= total && total > 0
            },
        ];
    }, [t, streakData, stats, progress]);

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Set up real-time listener
    useEffect(() => {
        let isMounted = true;

        const unsubscribe = firebaseProgressAPI.subscribeToProgress((updatedProgress) => {
            if (!isMounted) return;

            setProgress(updatedProgress);

            // Update stats in real-time
            setStats((prevStats) => {
                if (!prevStats) return prevStats;

                const completed = updatedProgress.length;
                const totalScore = updatedProgress.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
                const totalMistakes = updatedProgress.reduce((sum: number, p: any) => sum + (p.mistakes || 0), 0);

                return {
                    ...prevStats,
                    completed,
                    totalScore,
                    totalMistakes,
                    completionRate: prevStats.total > 0 ? Math.round((completed / prevStats.total) * 100) : 0,
                };
            });
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const loadInitialData = async () => {
        try {
            const [statsData] = await Promise.all([
                firebaseProgressAPI.getStats(),
            ]);
            setStats(statsData as ProgressStats);
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedTitle = (scenario: Scenario | undefined) => {
        if (!scenario) return 'Unknown';
        const lang = i18n.language;
        if (lang === 'en' && scenario.titleEn) return scenario.titleEn;
        if (lang === 'kk' && scenario.titleKk) return scenario.titleKk;
        return scenario.title;
    };

    const formatDate = (dateString: string | any) => {
        let date: Date;

        // Handle Firebase Timestamp
        if (dateString?.toDate) {
            date = dateString.toDate();
        } else if (dateString?.seconds) {
            date = new Date(dateString.seconds * 1000);
        } else {
            date = new Date(dateString);
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Full date and time
        const fullDate = date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Relative time
        let relativeTime: string;
        if (diffMins < 1) {
            relativeTime = t('dashboard.activity.justNow');
        } else if (diffMins < 60) {
            relativeTime = t('dashboard.activity.minutesAgo', { count: diffMins });
        } else if (diffHours < 24) {
            relativeTime = t('dashboard.activity.hoursAgo', { count: diffHours });
        } else if (diffDays < 7) {
            relativeTime = t('dashboard.activity.daysAgo', { count: diffDays });
        } else {
            relativeTime = date.toLocaleDateString(i18n.language);
        }

        return { fullDate, relativeTime };
    };

    const getRankName = (rank: number) => {
        const ranks = [
            t('ranks.rank1', 'Начинающий'),
            t('ranks.rank2', 'Осведомлённый'),
            t('ranks.rank3', 'Защитник'),
            t('ranks.rank4', 'Эксперт'),
        ];
        return ranks[Math.min(rank - 1, ranks.length - 1)] || ranks[0];
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-cyber-green mb-2">
                                {t('progress.title')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('progress.subtitle', 'Отслеживайте свой путь к кибербезопасности')}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString(i18n.language, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-8">
                            {/* Stats Grid Skeleton */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="cyber-card">
                                        <div className="flex items-center gap-4">
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton variant="text" width="60%" />
                                                <Skeleton variant="text" width="40%" height={32} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Recent Activity Skeleton */}
                            <div className="cyber-card">
                                <Skeleton variant="text" width="200px" height={32} className="mb-6" />
                                <SkeletonList items={5} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Streak Banner */}
                            <StreakBanner streak={streakData.current} bestStreak={streakData.best} />

                            {/* Main Stats Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    icon={<Shield className="w-7 h-7" />}
                                    label={t('dashboard.securityScore')}
                                    value={user?.securityScore || 0}
                                    color="green"
                                    trend={+12}
                                />
                                <StatCard
                                    icon={<Target className="w-7 h-7" />}
                                    label={t('dashboard.completedScenarios')}
                                    value={stats?.completed || 0}
                                    subtitle={`${t('progress.outOf', 'из')} ${stats?.total || 0}`}
                                    color="blue"
                                />
                                <StatCard
                                    icon={<AlertTriangle className="w-7 h-7" />}
                                    label={t('dashboard.totalMistakes')}
                                    value={stats?.totalMistakes || 0}
                                    color="red"
                                />
                                <StatCard
                                    icon={<TrendingUp className="w-7 h-7" />}
                                    label={t('dashboard.completionRate')}
                                    value={`${Math.round(stats?.completionRate || 0)}%`}
                                    color="yellow"
                                />
                            </div>

                            {/* Protection Stats */}
                            <ProtectionStatsCard
                                scenariosCompleted={stats?.completed || 0}
                                totalScenarios={stats?.total || 5}
                                perfectScenarios={progress.filter(p => p.mistakes === 0).length}
                                totalXP={user?.securityScore || 0}
                                rank={user?.rank || 1}
                            />

                            {/* Two Column Layout */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left Column - Rank & Skills */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Rank Progress */}
                                    <RankProgressCard
                                        currentRank={getRankName(user?.rank || 1)}
                                        nextRank={getRankName((user?.rank || 1) + 1)}
                                        progress={rankData.progress}
                                        xpCurrent={rankData.xpCurrent}
                                        requirement={rankData.requirement}
                                    />

                                    {/* Activity Chart */}
                                    <div className="cyber-card">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-cyber-blue" />
                                                {t('progress.weeklyActivity', 'Активность за неделю')}
                                            </h3>
                                            <span className="text-sm text-muted-foreground">
                                                {progress.length} {t('progress.scenariosTotal', 'сценариев всего')}
                                            </span>
                                        </div>
                                        <ActivityCalendar activities={activityData} />
                                    </div>
                                </div>

                                {/* Right Column - Skills Radar & Achievements */}
                                <div className="space-y-6">
                                    {/* Skills Radar */}
                                    <div className="cyber-card">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                                            <Zap className="w-5 h-5 text-cyber-yellow" />
                                            {t('progress.skillsRadar', 'Навыки защиты')}
                                        </h3>
                                        <SkillRadar skills={skills} />
                                    </div>

                                    {/* Achievements Preview */}
                                    <div className="cyber-card">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                                <Award className="w-5 h-5 text-cyber-green" />
                                                {t('progress.achievementsTitle', 'Достижения')}
                                            </h3>
                                            <button
                                                onClick={() => navigate('/achievements')}
                                                className="text-sm text-cyber-green hover:underline"
                                            >
                                                {t('progress.viewAll', 'Все')} →
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {achievements.slice(0, 4).map((achievement, index) => (
                                                <AchievementPreview key={index} {...achievement} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="cyber-card">
                                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-cyber-blue" />
                                    {t('dashboard.recentActivity')}
                                </h2>

                                {progress.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground mb-4">
                                            {t('progress.noProgress')}
                                        </p>
                                        <button
                                            onClick={() => navigate('/training')}
                                            className="cyber-button"
                                        >
                                            {t('progress.startFirst', 'Пройти первый сценарий')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {progress.slice(0, 10).map((activity, index) => {
                                            const dateInfo = activity.completedAt ? formatDate(activity.completedAt) : null;
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-background/50 border border-border rounded-lg hover:border-cyber-green/30 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-green/10"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {/* Icon based on mistakes */}
                                                        <div className={`flex-shrink-0 p-2 rounded-lg ${activity.mistakes === 0
                                                            ? 'bg-cyber-green/10 text-cyber-green'
                                                            : activity.mistakes <= 2
                                                                ? 'bg-cyber-yellow/10 text-cyber-yellow'
                                                                : 'bg-cyber-red/10 text-cyber-red'
                                                            }`}>
                                                            {activity.mistakes === 0 ? (
                                                                <CheckCircle className="w-5 h-5" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5" />
                                                            )}
                                                        </div>

                                                        {/* Scenario info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-foreground font-semibold mb-1 truncate group-hover:text-cyber-green transition-colors">
                                                                {getLocalizedTitle(activity.scenario)}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Zap className="w-3 h-3" />
                                                                    <span className="text-cyber-green font-medium">{activity.score}</span>
                                                                </span>
                                                                <span>•</span>
                                                                <span className={`font-medium ${activity.mistakes === 0 ? 'text-cyber-green' : activity.mistakes <= 2 ? 'text-cyber-yellow' : 'text-cyber-red'}`}>
                                                                    {activity.mistakes === 0 ? t('progress.perfect', 'Идеально!') : `${activity.mistakes} ${t('progress.errorsCount', 'ошибок')}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Date and Time */}
                                                    {dateInfo && (
                                                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 sm:min-w-[130px]">
                                                            <div className="flex items-center gap-1.5 text-sm text-cyber-green">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="font-medium">{dateInfo.relativeTime}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {dateInfo.fullDate}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: 'green' | 'blue' | 'red' | 'yellow';
    trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, color, trend }) => {
    const colorClasses = {
        green: 'text-cyber-green border-cyber-green/30 bg-cyber-green/5',
        blue: 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5',
        red: 'text-cyber-red border-cyber-red/30 bg-cyber-red/5',
        yellow: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5',
    };

    const iconBgClasses = {
        green: 'bg-cyber-green/20',
        blue: 'bg-cyber-blue/20',
        red: 'bg-cyber-red/20',
        yellow: 'bg-cyber-yellow/20',
    };

    return (
        <div className={`cyber-card border-2 ${colorClasses[color]} hover:scale-105 transition-transform cursor-default`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${iconBgClasses[color]} ${colorClasses[color].split(' ')[0]}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-foreground">
                            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                        </p>
                        {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
                    </div>
                    {trend !== undefined && (
                        <span className={`text-xs ${trend >= 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
