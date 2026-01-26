import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Snowflake, Calendar, Trophy, Zap, TrendingUp } from 'lucide-react';

interface StreakWidgetProps {
    currentStreak: number;
    bestStreak?: number;
    frozen?: boolean;
    lastActivityDate?: Date;
    streakHistory?: number[]; // Last 7 days: 1 = active, 0 = missed
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
    currentStreak = 0,
    bestStreak = 0,
    frozen = false,
    lastActivityDate,
    streakHistory = [1, 1, 1, 0, 1, 1, 1] // Mock: last 7 days
}) => {
    const { t } = useTranslation();

    // Calculate streak status
    const isActive = currentStreak > 0;
    const isAtRisk = lastActivityDate &&
        (new Date().getTime() - lastActivityDate.getTime()) > 20 * 60 * 60 * 1000; // 20+ hours

    // Get motivational message based on streak
    const getStreakMessage = () => {
        if (frozen) return t('streak.frozen', '❄️ Серия заморожена');
        if (currentStreak === 0) return t('streak.start', 'Начните серию сегодня!');
        if (currentStreak >= 30) return t('streak.legendary', '🔥 Легендарная серия!');
        if (currentStreak >= 14) return t('streak.amazing', '⚡ Невероятно!');
        if (currentStreak >= 7) return t('streak.great', '🌟 Отличная работа!');
        if (currentStreak >= 3) return t('streak.good', '💪 Так держать!');
        return t('streak.continue', '🚀 Продолжайте!');
    };

    // Days of week for history
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date().getDay();
    const orderedDays = [...weekDays.slice(today), ...weekDays.slice(0, today)].reverse().slice(0, 7).reverse();

    return (
        <div className="cyber-card overflow-hidden">
            {/* Header with flame animation */}
            <div className="p-4 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Animated flame icon */}
                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center ${frozen
                                ? 'bg-cyan-500/20'
                                : isActive
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500'
                                    : 'bg-muted'
                            }`}>
                            {frozen ? (
                                <Snowflake className="w-7 h-7 text-cyan-400" />
                            ) : (
                                <Flame className={`w-7 h-7 ${isActive ? 'text-white animate-pulse' : 'text-muted-foreground'}`} />
                            )}
                            {isActive && !frozen && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-yellow rounded-full flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-background">{currentStreak > 99 ? '99+' : currentStreak}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                                {currentStreak} {t('streak.days', 'дней')}
                                {isAtRisk && !frozen && (
                                    <span className="px-2 py-0.5 bg-cyber-red/20 text-cyber-red text-xs rounded-full animate-pulse">
                                        {t('streak.atRisk', 'Под угрозой!')}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {getStreakMessage()}
                            </p>
                        </div>
                    </div>

                    {/* Best streak badge */}
                    {bestStreak > 0 && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-cyber-yellow">
                                <Trophy className="w-4 h-4" />
                                <span className="text-sm font-medium">{bestStreak}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {t('streak.best', 'рекорд')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Week history */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('streak.thisWeek', 'Эта неделя')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {streakHistory.filter(d => d === 1).length}/7 {t('streak.daysActive', 'дней')}
                    </span>
                </div>

                <div className="flex justify-between gap-1">
                    {streakHistory.slice(-7).map((day, index) => {
                        const isToday = index === streakHistory.length - 1;
                        const isComplete = day === 1;

                        return (
                            <div key={index} className="flex flex-col items-center gap-1 flex-1">
                                <div className={`
                                    w-full aspect-square rounded-lg flex items-center justify-center transition-all
                                    ${isComplete
                                        ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20'
                                        : 'bg-muted/50 border border-border'
                                    }
                                    ${isToday ? 'ring-2 ring-cyber-yellow ring-offset-2 ring-offset-background' : ''}
                                `}>
                                    {isComplete ? (
                                        <Flame className="w-4 h-4 text-white" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                    )}
                                </div>
                                <span className={`text-[10px] ${isToday ? 'font-bold text-cyber-yellow' : 'text-muted-foreground'}`}>
                                    {orderedDays[index]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational footer */}
            <div className="px-4 pb-4">
                <div className={`
                    p-3 rounded-xl flex items-center justify-between
                    ${isActive
                        ? 'bg-cyber-green/10 border border-cyber-green/20'
                        : 'bg-muted/50 border border-border'
                    }
                `}>
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isActive ? 'text-cyber-green' : 'text-muted-foreground'}`} />
                        <span className="text-sm text-muted-foreground">
                            {isActive
                                ? t('streak.keepGoing', 'Не прерывайте серию!')
                                : t('streak.startNow', 'Пройдите сценарий сегодня')
                            }
                        </span>
                    </div>
                    {currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-cyber-green">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">+{currentStreak * 5} XP</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StreakWidget;
