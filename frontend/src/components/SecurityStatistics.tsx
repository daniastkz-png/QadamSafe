import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, AlertTriangle, BarChart3, CheckCircle } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    sublabel?: string;
    variant?: 'default' | 'highlight';
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, sublabel, variant = 'default' }) => {
    const isHighlight = variant === 'highlight';

    return (
        <div className={`p-4 rounded-xl border transition-all ${isHighlight
            ? 'border-cyber-green/40 bg-cyber-green/10'
            : 'border-cyber-green/20 bg-cyber-green/5'
            }`}>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-cyber-green/20 text-cyber-green">
                    {icon}
                </div>
                <p className={`text-3xl font-bold ${isHighlight ? 'text-cyber-green' : 'text-foreground'}`}>
                    {value}
                </p>
            </div>
            <p className="text-sm text-foreground font-medium">{label}</p>
            {sublabel && (
                <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
            )}
        </div>
    );
};

interface ThreatTypeProps {
    title: string;
    percentage: number;
    description: string;
}

const ThreatType: React.FC<ThreatTypeProps> = ({ title, percentage, description }) => {
    return (
        <div className="p-4 rounded-lg border border-cyber-green/20 bg-cyber-green/5 hover:border-cyber-green/40 transition-all">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <span className="text-lg font-bold text-cyber-green">{percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-green to-cyan-500"
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
        },
        {
            title: t('security.stats.sms', 'SMS-мошенничество'),
            percentage: 35,
            description: t('security.stats.smsDesc', 'Поддельные сообщения от банков'),
        },
        {
            title: t('security.stats.phone', 'Телефонные звонки'),
            percentage: 18,
            description: t('security.stats.phoneDesc', 'Социальная инженерия'),
        },
        {
            title: t('security.stats.social', 'Социальные сети'),
            percentage: 5,
            description: t('security.stats.socialDesc', 'Мошенничество через мессенджеры'),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Statistics Grid - 3 key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    value="33%"
                    label={t('security.stats.affected', 'Рост мошенничества')}
                    sublabel={t('security.stats.growing', 'Ежегодно в Казахстане')}
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5" />}
                    value="2.5М"
                    label={t('security.stats.cases', 'Случаев за 2024 год')}
                    sublabel={t('security.stats.casesDesc', 'Зафиксировано атак')}
                />
                <StatCard
                    icon={<Shield className="w-5 h-5" />}
                    value="87%"
                    label={t('security.stats.preventable', 'Можно предотвратить')}
                    sublabel={t('security.stats.preventableDesc', 'Обучением и практикой')}
                    variant="highlight"
                />
            </div>

            {/* Threat Types Distribution */}
            <div className="p-5 rounded-xl border border-cyber-green/20 bg-card">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-cyber-green" />
                    <h3 className="text-lg font-semibold text-foreground">
                        {t('security.stats.distribution', 'Распределение типов угроз')}
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {threatTypes.map((threat, index) => (
                        <ThreatType
                            key={index}
                            title={threat.title}
                            percentage={threat.percentage}
                            description={threat.description}
                        />
                    ))}
                </div>
            </div>

            {/* Key Insights - Unified green palette */}
            <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                    <span>{t('security.insights.awareness', 'Повышаем осведомленность')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                    <span>{t('security.insights.prevention', 'Снижаем риски')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                    <span>{t('security.insights.trend', 'Актуальные угрозы')}</span>
                </div>
            </div>
        </div>
    );
};
