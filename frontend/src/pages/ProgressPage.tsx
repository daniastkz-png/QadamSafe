import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TopNavBar } from '../components/TopNavBar';
import { firebaseProgressAPI } from '../services/firebase';
import { TrendingUp, Target, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import type { ProgressStats, UserProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton, SkeletonList } from '../components/Skeleton';

export const ProgressPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, progressData] = await Promise.all([
                firebaseProgressAPI.getStats(),
                firebaseProgressAPI.getProgress(),
            ]);
            setStats(statsData as ProgressStats);
            setProgress((progressData as any[]).filter((p: any) => p.completed));
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('dashboard.activity.justNow');
        if (diffMins < 60) return t('dashboard.activity.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('dashboard.activity.hoursAgo', { count: diffHours });
        if (diffDays < 7) return t('dashboard.activity.daysAgo', { count: diffDays });

        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

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
                                    {progress.slice(0, 5).reverse().map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-lg hover:border-cyber-green/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
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
                                                    <p className="text-white font-medium truncate">
                                                        {activity.scenario?.title || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {t('dashboard.activity.score')}: {activity.score} • {' '}
                                                        {t('dashboard.activity.mistakes')}: {activity.mistakes}
                                                    </p>
                                                </div>

                                                {/* Time */}
                                                <div className="text-sm text-gray-500 flex-shrink-0">
                                                    {activity.completedAt && formatDate(activity.completedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
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
