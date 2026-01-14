import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, AlertTriangle, Users, BarChart3, Target } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: 'red' | 'yellow' | 'green' | 'blue';
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, trend }) => {
    const colorClasses = {
        red: 'text-cyber-red border-cyber-red/30 bg-cyber-red/5',
        yellow: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5',
        green: 'text-cyber-green border-cyber-green/30 bg-cyber-green/5',
        blue: 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5',
    };

    return (
        <div className={`cyber-card border ${colorClasses[color]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{value}</p>
                            {trend && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {trend}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </div>
        </div>
    );
};

interface ThreatTypeProps {
    title: string;
    percentage: number;
    description: string;
    color: 'red' | 'yellow';
}

const ThreatType: React.FC<ThreatTypeProps> = ({ title, percentage, description, color }) => {
    const colorClasses = {
        red: 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red',
        yellow: 'bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <span className="text-lg font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                    className={`h-2 rounded-full ${color === 'red' ? 'bg-cyber-red' : 'bg-cyber-yellow'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};

export const SecurityStatistics: React.FC = () => {
    const { t } = useTranslation();

    const threatTypes = [
        {
            title: t('security.stats.phishing', 'Фишинг (поддельные ссылки)'),
            percentage: 42,
            description: t('security.stats.phishingDesc', 'Самая распространенная угроза'),
            color: 'red' as const,
        },
        {
            title: t('security.stats.sms', 'SMS-мошенничество'),
            percentage: 35,
            description: t('security.stats.smsDesc', 'Поддельные сообщения от банков'),
            color: 'red' as const,
        },
        {
            title: t('security.stats.phone', 'Телефонные звонки'),
            percentage: 18,
            description: t('security.stats.phoneDesc', 'Социальная инженерия'),
            color: 'yellow' as const,
        },
        {
            title: t('security.stats.social', 'Социальные сети'),
            percentage: 5,
            description: t('security.stats.socialDesc', 'Мошенничество через мессенджеры'),
            color: 'yellow' as const,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    value="33%"
                    label={t('security.stats.affected', 'Жителей Казахстана пострадали в 2025')}
                    color="red"
                    trend={t('security.stats.growing', 'Растет каждый год')}
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5" />}
                    value="2.5М"
                    label={t('security.stats.cases', 'Зафиксировано случаев мошенничества')}
                    color="red"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    value="+24%"
                    label={t('security.stats.increase', 'Рост мошенничества за год')}
                    color="yellow"
                />
                <StatCard
                    icon={<Shield className="w-5 h-5" />}
                    value="87%"
                    label={t('security.stats.preventable', 'Можно предотвратить обучением')}
                    color="green"
                />
            </div>

            {/* Threat Types Distribution */}
            <div className="cyber-card">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-cyber-green" />
                    <h3 className="text-lg font-semibold text-foreground">
                        {t('security.stats.distribution', 'Распределение типов мошенничества')}
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {threatTypes.map((threat, index) => (
                        <ThreatType
                            key={index}
                            title={threat.title}
                            percentage={threat.percentage}
                            description={threat.description}
                            color={threat.color}
                        />
                    ))}
                </div>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="cyber-card border-cyber-yellow/30 bg-cyber-yellow/5">
                    <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">
                                {t('security.insights.awareness', 'Осведомленность')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {t('security.insights.awarenessDesc', 'Большинство пользователей не знают о современных схемах мошенничества')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="cyber-card border-cyber-green/30 bg-cyber-green/5">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">
                                {t('security.insights.prevention', 'Профилактика')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {t('security.insights.preventionDesc', 'Обучение снижает риск стать жертвой на 87%')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="cyber-card border-cyber-blue/30 bg-cyber-blue/5">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">
                                {t('security.insights.trend', 'Тренд')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {t('security.insights.trendDesc', 'Мошенники постоянно развивают новые методы обмана')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
