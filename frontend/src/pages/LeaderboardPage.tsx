import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
    Trophy, Medal, Crown, Star, TrendingUp, Users,
    Shield, ChevronUp, ChevronDown, Minus,
    Sparkles, Target, Award
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, getFirestore } from 'firebase/firestore';

// Types
interface LeaderboardUser {
    id: string;
    name: string;
    securityScore: number;
    rank: number;
    completedScenarios?: number;
    avatarColor?: string;
}

// Avatar colors for anonymous users
const avatarColors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500',
];

// Get initials from name
const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

// Anonymize name for privacy
const anonymizeName = (name: string, index: number): string => {
    if (!name) return `User${index + 1}`;
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}***${parts[1][0]}***`;
    }
    return `${name[0]}***`;
};

// Rank badge component
const RankBadge: React.FC<{ position: number }> = ({ position }) => {
    if (position === 1) {
        return (
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
                    1
                </div>
            </div>
        );
    }
    if (position === 2) {
        return (
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30">
                    <Medal className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                    2
                </div>
            </div>
        );
    }
    if (position === 3) {
        return (
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
                    <Medal className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
                </div>
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg font-bold text-muted-foreground">{position}</span>
        </div>
    );
};

// Leaderboard row component
const LeaderboardRow: React.FC<{
    user: LeaderboardUser;
    position: number;
    isCurrentUser: boolean;
    previousPosition?: number;
}> = ({ user, position, isCurrentUser, previousPosition }) => {
    const positionChange = previousPosition ? previousPosition - position : 0;

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-muted/50 ${isCurrentUser
                ? 'bg-cyber-green/10 border-2 border-cyber-green/30 shadow-lg shadow-cyber-green/10'
                : 'bg-card/50'
                } ${position <= 3 ? 'mb-2' : ''}`}
        >
            {/* Position */}
            <RankBadge position={position} />

            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {getInitials(user.name)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isCurrentUser ? 'text-cyber-green' : 'text-foreground'}`}>
                        {user.name}
                    </span>
                    {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-cyber-green/20 text-cyber-green text-xs rounded-full font-medium">
                            Вы
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Ранг {user.rank}
                    </span>
                    {user.completedScenarios !== undefined && (
                        <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {user.completedScenarios} сценариев
                        </span>
                    )}
                </div>
            </div>

            {/* Position Change */}
            <div className="flex items-center gap-1">
                {positionChange > 0 && (
                    <div className="flex items-center text-cyber-green text-sm">
                        <ChevronUp className="w-4 h-4" />
                        <span>{positionChange}</span>
                    </div>
                )}
                {positionChange < 0 && (
                    <div className="flex items-center text-cyber-red text-sm">
                        <ChevronDown className="w-4 h-4" />
                        <span>{Math.abs(positionChange)}</span>
                    </div>
                )}
                {positionChange === 0 && (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                )}
            </div>

            {/* Score */}
            <div className="text-right">
                <div className={`text-xl font-bold ${position === 1 ? 'text-yellow-400' : position === 2 ? 'text-gray-400' : position === 3 ? 'text-amber-600' : 'text-foreground'}`}>
                    {user.securityScore.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
            </div>
        </div>
    );
};

// Top 3 Podium Component
const TopThreePodium: React.FC<{ users: LeaderboardUser[] }> = ({ users }) => {
    if (users.length < 3) return null;

    return (
        <div className="flex items-end justify-center gap-4 mb-8 py-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${users[1]?.avatarColor} flex items-center justify-center text-white font-bold text-xl shadow-xl mb-2`}>
                    {getInitials(users[1]?.name || '')}
                </div>
                <span className="text-sm font-medium text-muted-foreground mb-1 truncate max-w-[100px]">
                    {users[1]?.name}
                </span>
                <div className="text-lg font-bold text-gray-400">{users[1]?.securityScore?.toLocaleString()} XP</div>
                <div className="w-24 h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center mt-2">
                    <Medal className="w-8 h-8 text-white" />
                </div>
                <div className="w-24 h-4 bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
                    2
                </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-8">
                <div className="relative mb-2">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${users[0]?.avatarColor} flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-yellow-400/50`}>
                        {getInitials(users[0]?.name || '')}
                    </div>
                    <Crown className="w-8 h-8 text-yellow-400 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-lg" />
                </div>
                <span className="text-sm font-medium text-foreground mb-1 truncate max-w-[120px]">
                    {users[0]?.name}
                </span>
                <div className="text-xl font-bold text-yellow-400">{users[0]?.securityScore?.toLocaleString()} XP</div>
                <div className="w-28 h-28 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center mt-2 shadow-lg shadow-yellow-500/30">
                    <Trophy className="w-12 h-12 text-white" />
                </div>
                <div className="w-28 h-4 bg-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                    1
                </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${users[2]?.avatarColor} flex items-center justify-center text-white font-bold text-xl shadow-xl mb-2`}>
                    {getInitials(users[2]?.name || '')}
                </div>
                <span className="text-sm font-medium text-muted-foreground mb-1 truncate max-w-[100px]">
                    {users[2]?.name}
                </span>
                <div className="text-lg font-bold text-amber-600">{users[2]?.securityScore?.toLocaleString()} XP</div>
                <div className="w-24 h-16 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex items-center justify-center mt-2">
                    <Medal className="w-8 h-8 text-white" />
                </div>
                <div className="w-24 h-4 bg-amber-800 flex items-center justify-center text-white text-xs font-bold">
                    3
                </div>
            </div>
        </div>
    );
};

export const LeaderboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

    useEffect(() => {
        loadLeaderboard();
    }, [timeFilter]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const db = getFirestore();
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('securityScore', 'desc'), limit(50));
            const snapshot = await getDocs(q);

            const users: LeaderboardUser[] = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: anonymizeName(data.name || data.email?.split('@')[0] || 'User', index),
                    securityScore: data.securityScore || 0,
                    rank: data.rank || 1,
                    completedScenarios: data.completedScenarios,
                    avatarColor: avatarColors[index % avatarColors.length],
                };
            });

            setLeaderboard(users);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Find current user's position
    const currentUserPosition = useMemo(() => {
        if (!user) return -1;
        return leaderboard.findIndex(u => u.id === user.id) + 1;
    }, [leaderboard, user]);

    // Stats
    const stats = useMemo(() => ({
        totalPlayers: leaderboard.length,
        topScore: leaderboard[0]?.securityScore || 0,
        averageScore: leaderboard.length > 0
            ? Math.round(leaderboard.reduce((sum, u) => sum + u.securityScore, 0) / leaderboard.length)
            : 0,
    }), [leaderboard]);

    const timeFilters = [
        { id: 'week', label: t('leaderboard.thisWeek', 'Эта неделя') },
        { id: 'month', label: t('leaderboard.thisMonth', 'Этот месяц') },
        { id: 'all', label: t('leaderboard.allTime', 'Всё время') },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 md:p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-yellow/10 rounded-full text-cyber-yellow text-sm font-medium mb-4">
                            <Trophy className="w-4 h-4" />
                            {t('leaderboard.title', 'Таблица лидеров')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {t('leaderboard.heading', 'Лучшие защитники')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('leaderboard.subtitle', 'Соревнуйтесь с другими пользователями и улучшайте свои навыки')}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="cyber-card text-center">
                            <Users className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">{stats.totalPlayers}</div>
                            <div className="text-xs text-muted-foreground">{t('leaderboard.players', 'Игроков')}</div>
                        </div>
                        <div className="cyber-card text-center">
                            <Star className="w-6 h-6 text-cyber-yellow mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">{stats.topScore.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{t('leaderboard.topScore', 'Рекорд XP')}</div>
                        </div>
                        <div className="cyber-card text-center">
                            <TrendingUp className="w-6 h-6 text-cyber-green mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">{stats.averageScore.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{t('leaderboard.avgScore', 'Средний XP')}</div>
                        </div>
                    </div>

                    {/* Time Filters */}
                    <div className="flex justify-center gap-2 mb-8">
                        {timeFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setTimeFilter(filter.id as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === filter.id
                                    ? 'bg-cyber-green text-background'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Your Position Card */}
                    {currentUserPosition > 0 && (
                        <div className="cyber-card border-2 border-cyber-green/30 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Award className="w-6 h-6 text-cyber-green" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('leaderboard.yourPosition', 'Ваша позиция')}</p>
                                        <p className="text-2xl font-bold text-cyber-green">#{currentUserPosition}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">{t('leaderboard.yourScore', 'Ваши очки')}</p>
                                    <p className="text-2xl font-bold text-foreground">{user?.securityScore?.toLocaleString() || 0} XP</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto border-4 border-cyber-yellow/30 border-t-cyber-yellow rounded-full animate-spin" />
                                <Trophy className="w-6 h-6 text-cyber-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-cyber-yellow text-lg mt-4 animate-pulse">
                                {t('common.loading', 'Загрузка...')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            {leaderboard.length >= 3 && (
                                <TopThreePodium users={leaderboard.slice(0, 3)} />
                            )}

                            {/* Leaderboard List */}
                            <div className="space-y-2">
                                {leaderboard.slice(3).map((leaderUser, index) => (
                                    <LeaderboardRow
                                        key={leaderUser.id}
                                        user={leaderUser}
                                        position={index + 4}
                                        isCurrentUser={user?.id === leaderUser.id}
                                    />
                                ))}
                            </div>

                            {leaderboard.length === 0 && (
                                <div className="text-center py-12">
                                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        {t('leaderboard.empty', 'Лидерборд пуст')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t('leaderboard.beFirst', 'Станьте первым, кто попадёт в рейтинг!')}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
