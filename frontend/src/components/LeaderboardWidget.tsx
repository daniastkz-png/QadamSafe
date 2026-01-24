import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
    id: string;
    name: string;
    xp: number;
    rank: number;
    avatar?: string;
    trend?: 'up' | 'down' | 'stable';
}

const mockUsers: LeaderboardUser[] = [
    { id: '1', name: 'Айжан К.', xp: 2450, rank: 1, trend: 'up' },
    { id: '2', name: 'Берик С.', xp: 2320, rank: 2, trend: 'stable' },
    { id: '3', name: 'Динара М.', xp: 2100, rank: 3, trend: 'up' },
    { id: '4', name: 'Ержан Б.', xp: 1950, rank: 4, trend: 'down' },
    { id: '5', name: 'Вы', xp: 1800, rank: 5, trend: 'up' }, // Current user
    { id: '6', name: 'Кайрат Н.', xp: 1650, rank: 6, trend: 'stable' },
];

export const LeaderboardWidget: React.FC = () => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<'weekly' | 'allTime'>('weekly');

    return (
        <div className="cyber-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        {t('leaderboard.heading', 'Лидеры')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t('leaderboard.subtitle', 'Рейтинг защитников')}</p>
                </div>
                <div className="flex gap-2 text-xs bg-muted/50 p-1 rounded-lg">
                    <button
                        className={`px-3 py-1 rounded-md transition-all ${period === 'weekly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setPeriod('weekly')}
                    >
                        {t('leaderboard.thisWeek', 'Неделя')}
                    </button>
                    <button
                        className={`px-3 py-1 rounded-md transition-all ${period === 'allTime' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setPeriod('allTime')}
                    >
                        {t('leaderboard.allTime', 'Все время')}
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {mockUsers.map((user, index) => (
                    <div
                        key={user.id}
                        className={`flex items-center p-3 rounded-xl border transition-all ${user.name === 'Вы'
                            ? 'bg-cyber-green/10 border-cyber-green/50 ring-1 ring-cyber-green/20'
                            : 'bg-card/50 border-transparent hover:bg-muted/50'
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className="w-8 flex justify-center font-bold text-lg mr-2">
                            {index === 0 ? <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> :
                                index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                                    index === 2 ? <Medal className="w-6 h-6 text-amber-700" /> :
                                        <span className="text-muted-foreground">#{user.rank}</span>}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                            {user.name[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <p className={`font-semibold ${user.name === 'Вы' ? 'text-cyber-green' : 'text-foreground'}`}>
                                {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {t(`ranks.rank${index < 3 ? 3 : 2}`, 'Эксперт')}
                            </p>
                        </div>

                        {/* XP */}
                        <div className="text-right">
                            <p className="font-bold text-cyber-yellow">{user.xp} XP</p>
                            {user.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500 ml-auto" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
                <button className="text-sm text-muted-foreground hover:text-cyber-green transition-colors">
                    {t('leaderboard.viewAll', 'Смотреть весь рейтинг')}
                </button>
            </div>
        </div>
    );
};
