import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Clock, Gift, CheckCircle, Play,
    Flame, Star, Trophy, ArrowRight, Sparkles
} from 'lucide-react';

// Daily challenge data type
interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    type: 'scenario' | 'quiz' | 'streak';
    xpReward: number;
    completed: boolean;
    expiresAt: Date;
    difficulty: 'easy' | 'medium' | 'hard';
}

// Generate daily challenges based on date
const generateDailyChallenges = (): DailyChallenge[] => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Pseudo-random based on date
    const challenges: DailyChallenge[] = [
        {
            id: `daily-${seed}-1`,
            title: 'Быстрый старт',
            description: 'Пройдите любой сценарий за сегодня',
            type: 'scenario',
            xpReward: 25,
            completed: false,
            expiresAt: new Date(today.setHours(23, 59, 59, 999)),
            difficulty: 'easy',
        },
        {
            id: `daily-${seed}-2`,
            title: 'Идеальное прохождение',
            description: 'Завершите сценарий без ошибок',
            type: 'scenario',
            xpReward: 50,
            completed: false,
            expiresAt: new Date(today.setHours(23, 59, 59, 999)),
            difficulty: 'medium',
        },
        {
            id: `daily-${seed}-3`,
            title: 'Серия продолжается',
            description: 'Сохраните свою серию обучения',
            type: 'streak',
            xpReward: 15,
            completed: false,
            expiresAt: new Date(today.setHours(23, 59, 59, 999)),
            difficulty: 'easy',
        },
    ];

    return challenges;
};

// Time remaining component
const TimeRemaining: React.FC<{ expiresAt: Date }> = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Истекло');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${hours}ч ${minutes}м`);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeLeft}</span>
        </div>
    );
};

// Single challenge card
const ChallengeCard: React.FC<{
    challenge: DailyChallenge;
    onStart: () => void;
}> = ({ challenge, onStart }) => {
    const { t } = useTranslation();

    const difficultyConfig = {
        easy: { color: 'text-cyber-green', bg: 'bg-cyber-green/10', label: 'Легко' },
        medium: { color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/10', label: 'Средне' },
        hard: { color: 'text-cyber-red', bg: 'bg-cyber-red/10', label: 'Сложно' },
    };

    const config = difficultyConfig[challenge.difficulty];

    return (
        <div className={`relative p-4 rounded-xl border transition-all ${challenge.completed
            ? 'bg-cyber-green/5 border-cyber-green/30'
            : 'bg-card border-border hover:border-cyber-green/50 hover:shadow-lg'
            }`}>
            {/* Completed overlay */}
            {challenge.completed && (
                <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-cyber-green flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-background" />
                    </div>
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    {challenge.type === 'scenario' && <Play className={`w-6 h-6 ${config.color}`} />}
                    {challenge.type === 'quiz' && <Star className={`w-6 h-6 ${config.color}`} />}
                    {challenge.type === 'streak' && <Flame className={`w-6 h-6 ${config.color}`} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-cyber-yellow font-medium text-sm">
                                <Gift className="w-4 h-4" />
                                +{challenge.xpReward} XP
                            </div>
                            <TimeRemaining expiresAt={challenge.expiresAt} />
                        </div>

                        {!challenge.completed && (
                            <button
                                onClick={onStart}
                                className="flex items-center gap-1 px-3 py-1.5 bg-cyber-green/10 text-cyber-green rounded-lg text-sm font-medium hover:bg-cyber-green hover:text-background transition-all"
                            >
                                {t('daily.start', 'Начать')}
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Daily Challenge Widget
export const DailyChallengeWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setChallenges(generateDailyChallenges());
    }, []);

    const completedCount = challenges.filter(c => c.completed).length;
    const totalXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);
    const earnedXP = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xpReward, 0);

    const handleStartChallenge = (challenge: DailyChallenge) => {
        if (challenge.type === 'scenario') {
            navigate('/training');
        }
    };

    return (
        <div className="cyber-card overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-yellow to-orange-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-background" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {t('daily.title', 'Ежедневные задания')}
                            <span className="px-2 py-0.5 bg-cyber-green/20 text-cyber-green text-xs rounded-full">
                                {completedCount}/{challenges.length}
                            </span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {earnedXP}/{totalXP} XP {t('daily.earned', 'заработано')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mini progress */}
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyber-yellow to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(completedCount / challenges.length) * 100}%` }}
                        />
                    </div>
                    <Sparkles className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''} text-cyber-yellow`} />
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-border p-4 space-y-3">
                    {challenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onStart={() => handleStartChallenge(challenge)}
                        />
                    ))}

                    {/* Bonus info */}
                    <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4 text-cyber-yellow" />
                        <span>{t('daily.bonus', 'Выполните все задания для бонуса +30 XP!')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyChallengeWidget;
