import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { firebaseProgressAPI } from '../services/firebase';
import { TrendingUp, Target, AlertTriangle, CheckCircle, XCircle, Shield, Clock } from 'lucide-react';
import type { ProgressStats, UserProgress, Scenario } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton, SkeletonList } from '../components/Skeleton';

export const ProgressPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);

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
    }, []); // Empty dependency array - only set up once

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

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">

                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-4xl font-bold text-cyber-green mb-8">
                        {t('progress.title')}
                    </h1>

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
                        <>
                            {/* Stats Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={<Shield className="w-8 h-8" />}
                                    label={t('dashboard.securityScore')}
                                    value={user?.securityScore || 0}
                                    color="green"
                                />
                                <StatCard
                                    icon={<Target className="w-8 h-8" />}
                                    label={t('dashboard.completedScenarios')}
                                    value={stats?.completed || 0}
                                    color="blue"
                                />
                                <StatCard
                                    icon={<AlertTriangle className="w-8 h-8" />}
                                    label={t('dashboard.totalMistakes')}
                                    value={stats?.totalMistakes || 0}
                                    color="red"
                                />
                                <StatCard
                                    icon={<TrendingUp className="w-8 h-8" />}
                                    label={t('dashboard.completionRate')}
                                    value={`${Math.round(stats?.completionRate || 0)}%`}
                                    color="yellow"
                                />
                            </div>


                            {/* Recent Activity */}
                            <div className="cyber-card">
                                <h2 className="text-2xl font-semibold text-foreground mb-6">
                                    {t('dashboard.recentActivity')}
                                </h2>

                                {progress.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        {t('progress.noProgress')}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {progress.slice(0, 10).map((activity) => {
                                            const dateInfo = activity.completedAt ? formatDate(activity.completedAt) : null;
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-background/50 border border-border rounded-lg hover:border-cyber-green/30 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-green/10"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {/* Icon based on mistakes */}
                                                        <div className={`flex-shrink-0 ${activity.mistakes === 0
                                                            ? 'text-cyber-green'
                                                            : activity.mistakes <= 2
                                                                ? 'text-cyber-yellow'
                                                                : 'text-cyber-red'
                                                            }`}>
                                                            {activity.mistakes === 0 ? (
                                                                <CheckCircle className="w-6 h-6" />
                                                            ) : (
                                                                <XCircle className="w-6 h-6" />
                                                            )}
                                                        </div>

                                                        {/* Scenario info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-foreground font-semibold text-lg mb-1 truncate">
                                                                {getLocalizedTitle(activity.scenario)}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                                <span>
                                                                    {t('dashboard.activity.score')}: <span className="text-cyber-green font-medium">{activity.score}</span>
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {t('dashboard.activity.mistakes')}: <span className={`font-medium ${activity.mistakes === 0 ? 'text-cyber-green' : activity.mistakes <= 2 ? 'text-cyber-yellow' : 'text-cyber-red'}`}>{activity.mistakes}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Date and Time */}
                                                    {dateInfo && (
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0 sm:min-w-[140px]">
                                                            <div className="flex items-center gap-1.5 text-sm text-cyber-green">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="font-medium">{dateInfo.relativeTime}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground text-right">
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
                        </>
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
    color: 'green' | 'blue' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
    const colorClasses = {
        green: 'text-cyber-green border-cyber-green/30',
        blue: 'text-cyber-blue border-cyber-blue/30',
        red: 'text-cyber-red border-cyber-red/30',
        yellow: 'text-cyber-yellow border-cyber-yellow/30',
    };

    return (
        <div className={`cyber-card border ${colorClasses[color]}`}>
            <div className="flex items-center gap-4">
                <div className={colorClasses[color]}>{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
            </div>
        </div>
    );
};
