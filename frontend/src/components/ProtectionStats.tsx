import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield, ShieldCheck, DollarSign,
    TrendingUp, Eye, Zap, Target,
    Smartphone, Lock, Globe, CreditCard,
    Users
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface ProtectionStatsProps {
    scenariosCompleted: number;
    totalScenarios: number;
    perfectScenarios: number;
    totalXP: number;
    rank: number;
    completedScenarioIds?: string[]; // Need IDs to categorize
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

// Helper to get color for score (unused for now but kept for reference if needed, commented out to fix build)
// const getScoreColor = (score: number) => {
//     if (score >= 80) return '#10B981'; // cyber-green
//     if (score >= 50) return '#F59E0B'; // cyber-yellow
//     return '#EF4444'; // cyber-red
// };

export const ProtectionStatsCard: React.FC<ProtectionStatsProps> = ({
    scenariosCompleted,
    totalScenarios,
    perfectScenarios,
    totalXP,
    rank,
    completedScenarioIds = [], // Default to empty
}) => {
    const { t } = useTranslation();

    // 1. Calculate stats for Radar Chart
    const radarData = useMemo(() => {
        // Categories mapping
        const categories = {
            financial: ['kaspi_sms', 'kaspi_call', 'investment_scam', 'crypto_work', 'investment_pyramid', 'fake_government', 'utility_scam', 'delivery_kazpost'],
            digital: ['password_security', '2fa', 'fake_website', 'malware', 'wifi_security', 'software_updates'],
            social: ['whatsapp_relative', 'romance_scam', 'charity', 'social_engineering', 'job_scam', 'job_enbek', 'lottery', 'taxi_scam'],
            device: ['wifi', 'usb', 'antivirus', 'glovo_scam', 'kolesa_scam'],
            privacy: ['telegram_scam', 'olx_scam', 'data_privacy', 'online_shopping', 'sextortion']
        };

        const calculateCategoryScore = (categoryIds: string[]) => {
            if (completedScenarioIds.length === 0) return 20; // Base score for newbies
            const completedInCategory = completedScenarioIds.filter(id => categoryIds.some(catId => id.includes(catId))).length;
            // Cap at 100, slightly generous formula (each scenario gives ~25-30 points in cat)
            return Math.min(100, 20 + (completedInCategory * 25));
        };

        return [
            { subject: t('protection.radar.financial', 'Финансы'), A: calculateCategoryScore(categories.financial), fullMark: 100, icon: <CreditCard size={14} /> },
            { subject: t('protection.radar.digital', 'Грамотность'), A: calculateCategoryScore(categories.digital), fullMark: 100, icon: <Globe size={14} /> },
            { subject: t('protection.radar.social', 'Психология'), A: calculateCategoryScore(categories.social), fullMark: 100, icon: <Users size={14} /> },
            { subject: t('protection.radar.device', 'Устройства'), A: calculateCategoryScore(categories.device), fullMark: 100, icon: <Smartphone size={14} /> },
            { subject: t('protection.radar.privacy', 'Приватность'), A: calculateCategoryScore(categories.privacy), fullMark: 100, icon: <Lock size={14} /> },
        ];
    }, [completedScenarioIds, t]);

    // 2. Calculate general protection metrics
    const stats = useMemo(() => {
        const completionRate = totalScenarios > 0 ? (scenariosCompleted / totalScenarios) * 100 : 0;
        const perfectRate = scenariosCompleted > 0 ? (perfectScenarios / scenariosCompleted) * 100 : 0;

        // Smart Potential Saved Calculation
        // Specific costs per scenario type (in KZT)
        const COST_MAP: Record<string, number> = {
            'kaspi_sms': 50000,
            'kaspi_call': 1000000, // 1M+ for bank calls
            'egov_scam': 200000,
            'olx_scam': 150000,
            'kolesa_scam': 300000,
            'telegram_scam': 0, // Loss of account/reputation, hard to quantify in money but let's say 0 direct or small
            'whatsapp_relative': 100000,
            'job_enbek': 20000,
            'crypto_work': 5000000, // 5M for crypto scams
            'investment_pyramid': 2000000,
            'utility_scam': 30000,
            'delivery_kazpost': 5000, // 5000 for postal scam
            'glovo_scam': 10000,
            'lottery': 50000,
            'charity': 20000,
            'taxi_scam': 5000
        };

        let savedAmount = 0;
        completedScenarioIds.forEach(id => {
            // Check for exact match first
            if (COST_MAP[id] !== undefined) {
                savedAmount += COST_MAP[id];
            } else {
                // Fallback fuzzy matching if ID is different (e.g. ai_generated_...)
                if (id.includes('kaspi')) savedAmount += 1500000;
                else if (id.includes('investment') || id.includes('crypto')) savedAmount += 5000000;
                else if (id.includes('romance')) savedAmount += 3000000;
                else if (id.includes('whatsapp') || id.includes('help')) savedAmount += 100000;
                else if (id.includes('sms') || id.includes('delivery')) savedAmount += 5000;
                else savedAmount += 50000; // Default average
            }
        });

        // Use mock values if no scenarios completed just for display in dev? No, stick to 0 or logic.
        // If completedIds not provided or empty but count > 0 (data mismatch), fallback to average
        if (completedScenarioIds.length === 0 && scenariosCompleted > 0) {
            savedAmount = scenariosCompleted * 250000;
        }

        const threatsRecognized = scenariosCompleted * 3;

        // Weighted Protection Score based on axes
        const avgRadarScore = radarData.reduce((acc, curr) => acc + curr.A, 0) / 5;
        const protectionScore = Math.round(avgRadarScore);

        return {
            completionRate,
            perfectRate,
            potentialSaved: savedAmount,
            threatsRecognized,
            protectionScore,
        };
    }, [scenariosCompleted, totalScenarios, perfectScenarios, totalXP, rank, completedScenarioIds, radarData]);

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

            {/* Skill Radar Chart */}
            <div className="flex flex-col items-center mb-8 relative">
                <div className="w-full h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Protection"
                                dataKey="A"
                                stroke="#10B981"
                                strokeWidth={2}
                                fill="#10B981"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#10B981' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>

                    {/* Center Score Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center justify-center mt-4">
                            <span className={`text-2xl font-bold ${protectionLevel.color}`}>
                                {stats.protectionScore}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${protectionLevel.color}`}>
                        {protectionLevel.label} {t('protection.score', 'защита')}
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
