import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield, ShieldCheck, DollarSign, Users,
    TrendingUp, Eye, Phone, Mail, MessageSquare,
    CheckCircle, XCircle, Zap, Target
} from 'lucide-react';

interface ProtectionStatsProps {
    scenariosCompleted: number;
    totalScenarios: number;
    perfectScenarios: number;
    totalXP: number;
    rank: number;
}

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; suffix?: string; prefix?: string; duration?: number }> = ({
    value,
    suffix = '',
    prefix = '',
    duration = 1500
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const startValue = displayValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (value - startValue) * easeOutQuart);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
    );
};

// Shield visualization component
const ShieldVisualization: React.FC<{ strength: number }> = ({ strength }) => {
    const layers = Math.min(Math.floor(strength / 20), 5);

    return (
        <div className="relative w-32 h-32 mx-auto">
            {/* Shield layers */}
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${i < layers
                        ? 'border-cyber-green opacity-100'
                        : 'border-muted opacity-30'
                        }`}
                    style={{
                        transform: `scale(${1 - i * 0.15})`,
                    }}
                />
            ))}

            {/* Center shield icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${strength >= 80
                    ? 'bg-cyber-green text-background shadow-lg shadow-cyber-green/50'
                    : strength >= 50
                        ? 'bg-cyber-yellow text-background'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    <ShieldCheck className="w-8 h-8" />
                </div>
            </div>
        </div>
    );
};

// Threat recognition item
const ThreatItem: React.FC<{
    icon: React.ReactNode;
    name: string;
    recognized: boolean;
    count: number;
}> = ({ icon, name, recognized, count }) => {
    const { t } = useTranslation();
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${recognized ? 'bg-cyber-green/10' : 'bg-muted/50'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${recognized ? 'bg-cyber-green/20 text-cyber-green' : 'bg-muted text-muted-foreground'
                    }`}>
                    {icon}
                </div>
                <span className={recognized ? 'text-foreground' : 'text-muted-foreground'}>{name}</span>
            </div>
            <div className="flex items-center gap-2">
                {recognized ? (
                    <>
                        <span className="text-sm text-cyber-green">{t('protection.learned', '{{count}} изучено', { count })}</span>
                        <CheckCircle className="w-4 h-4 text-cyber-green" />
                    </>
                ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                )}
            </div>
        </div>
    );
};

export const ProtectionStatsCard: React.FC<ProtectionStatsProps> = ({
    scenariosCompleted,
    totalScenarios,
    perfectScenarios,
    totalXP,
    rank,
}) => {
    const { t } = useTranslation();

    // Calculate protection metrics
    const stats = useMemo(() => {
        const completionRate = totalScenarios > 0 ? (scenariosCompleted / totalScenarios) * 100 : 0;
        const perfectRate = scenariosCompleted > 0 ? (perfectScenarios / scenariosCompleted) * 100 : 0;

        // Potential money saved (average scam in Kazakhstan is 150,000 - 500,000 tenge)
        const avgScamAmount = 250000;
        const potentialSaved = scenariosCompleted * avgScamAmount;

        // Threats recognized count
        const threatsRecognized = scenariosCompleted * 3; // Each scenario teaches about 3 tactics

        // Protection score (0-100)
        const protectionScore = Math.min(100, Math.round(
            (completionRate * 0.4) + // 40% for completion
            (perfectRate * 0.3) + // 30% for perfect runs
            (rank * 10) + // 10% per rank level
            (Math.min(totalXP / 10, 20)) // Up to 20% for XP
        ));

        return {
            completionRate,
            perfectRate,
            potentialSaved,
            threatsRecognized,
            protectionScore,
        };
    }, [scenariosCompleted, totalScenarios, perfectScenarios, totalXP, rank]);

    // Threat types based on completed scenarios
    const threatTypes = useMemo(() => [
        {
            icon: <MessageSquare className="w-4 h-4" />,
            name: t('protection.threats.sms', 'SMS мошенничество'),
            recognized: scenariosCompleted >= 1,
            count: Math.min(scenariosCompleted, 2)
        },
        {
            icon: <Phone className="w-4 h-4" />,
            name: t('protection.threats.calls', 'Звонки мошенников'),
            recognized: scenariosCompleted >= 2,
            count: Math.min(Math.max(scenariosCompleted - 1, 0), 2)
        },
        {
            icon: <Mail className="w-4 h-4" />,
            name: t('protection.threats.phishing', 'Фишинг-атаки'),
            recognized: scenariosCompleted >= 3,
            count: Math.min(Math.max(scenariosCompleted - 2, 0), 2)
        },
        {
            icon: <Users className="w-4 h-4" />,
            name: t('protection.threats.social', 'Социальная инженерия'),
            recognized: scenariosCompleted >= 4,
            count: Math.min(Math.max(scenariosCompleted - 3, 0), 2)
        },
    ], [scenariosCompleted, t]);

    const protectionLevel = useMemo(() => {
        if (stats.protectionScore >= 90) return { label: t('protection.level.maximum', 'Максимальная'), color: 'text-cyber-green' };
        if (stats.protectionScore >= 70) return { label: t('protection.level.high', 'Высокая'), color: 'text-cyber-green' };
        if (stats.protectionScore >= 50) return { label: t('protection.level.medium', 'Средняя'), color: 'text-cyber-yellow' };
        if (stats.protectionScore >= 25) return { label: t('protection.level.low', 'Низкая'), color: 'text-orange-400' };
        return { label: t('protection.level.minimal', 'Минимальная'), color: 'text-cyber-red' };
    }, [stats.protectionScore, t]);

    return (
        <div className="cyber-card">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyber-green" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        {t('protection.title', 'Ваша защита')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('protection.subtitle', 'Статистика вашей кибербезопасности')}
                    </p>
                </div>
            </div>

            {/* Shield Visualization */}
            <div className="text-center mb-6">
                <ShieldVisualization strength={stats.protectionScore} />
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">
                        {t('protection.score', 'Уровень защиты')}
                    </p>
                    <p className={`text-3xl font-bold ${protectionLevel.color}`}>
                        <AnimatedCounter value={stats.protectionScore} suffix="%" />
                    </p>
                    <p className={`text-sm font-medium ${protectionLevel.color}`}>
                        {protectionLevel.label}
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyber-green/10 to-emerald-500/5 rounded-xl p-4 border border-cyber-green/20">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-cyber-green" />
                        <span className="text-xs text-muted-foreground uppercase">
                            {t('protection.moneySaved', 'Потенциально спасено')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-cyber-green">
                        <AnimatedCounter value={stats.potentialSaved} prefix="₸" />
                    </p>
                </div>

                <div className="bg-gradient-to-br from-cyber-blue/10 to-blue-500/5 rounded-xl p-4 border border-cyber-blue/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-cyber-blue" />
                        <span className="text-xs text-muted-foreground uppercase">
                            {t('protection.threatsRecognized', 'Угроз изучено')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-cyber-blue">
                        <AnimatedCounter value={stats.threatsRecognized} />
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-muted-foreground uppercase">
                            {t('protection.perfectRuns', 'Без ошибок')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                        <AnimatedCounter value={Math.round(stats.perfectRate)} suffix="%" />
                    </p>
                </div>

                <div className="bg-gradient-to-br from-cyber-yellow/10 to-orange-500/5 rounded-xl p-4 border border-cyber-yellow/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-cyber-yellow" />
                        <span className="text-xs text-muted-foreground uppercase">
                            {t('protection.totalXP', 'Всего XP')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-cyber-yellow">
                        <AnimatedCounter value={totalXP} />
                    </p>
                </div>
            </div>

            {/* Threat Recognition */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {t('protection.knownThreats', 'Изученные угрозы')}
                </h3>
                <div className="space-y-2">
                    {threatTypes.map((threat, index) => (
                        <ThreatItem key={index} {...threat} />
                    ))}
                </div>
            </div>

            {/* Improvement Tip */}
            {stats.protectionScore < 100 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-foreground mb-1">
                                {t('protection.improveTitle', 'Как улучшить защиту?')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {scenariosCompleted < totalScenarios
                                    ? t('protection.improveTip.complete', 'Пройдите оставшиеся сценарии, чтобы изучить все типы угроз.')
                                    : t('protection.improveTip.perfect', 'Пройдите сценарии без ошибок для максимальной защиты.')
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Compact version for sidebar/dashboard
export const ProtectionBadge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 70 ? 'cyber-green' : score >= 40 ? 'cyber-yellow' : 'cyber-red';

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${color}/10 border border-${color}/30`}>
            <ShieldCheck className={`w-5 h-5 text-${color}`} />
            <span className={`font-bold text-${color}`}>{score}%</span>
        </div>
    );
};

export default ProtectionStatsCard;
