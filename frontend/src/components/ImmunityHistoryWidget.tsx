import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, TrendingDown, Minus, Calendar, Info } from 'lucide-react';

interface HistoryPoint {
    date: string;
    score: number;
    change: number;
}

interface ImmunityHistoryWidgetProps {
    data?: HistoryPoint[];
    currentScore?: number;
}

// Generate mock data for the last 30 days
const generateMockData = (): HistoryPoint[] => {
    const data: HistoryPoint[] = [];
    let score = 45; // Starting score

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Random change between -5 and +10
        const change = Math.floor(Math.random() * 15) - 5;
        score = Math.max(0, Math.min(100, score + change));

        data.push({
            date: date.toISOString().split('T')[0],
            score,
            change
        });
    }

    return data;
};

export const ImmunityHistoryWidget: React.FC<ImmunityHistoryWidgetProps> = ({
    data,
    currentScore = 72
}) => {
    const { t } = useTranslation();
    const historyData = useMemo(() => data || generateMockData(), [data]);

    // Calculate statistics
    const stats = useMemo(() => {
        const scores = historyData.map(d => d.score);
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const trend = scores[scores.length - 1] - scores[0];

        return { min, max, avg, trend };
    }, [historyData]);

    // Get score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-cyber-green';
        if (score >= 60) return 'text-cyber-yellow';
        if (score >= 40) return 'text-orange-400';
        return 'text-cyber-red';
    };

    // Get score label
    const getScoreLabel = (score: number) => {
        if (score >= 80) return t('immunity.excellent', 'Отлично');
        if (score >= 60) return t('immunity.good', 'Хорошо');
        if (score >= 40) return t('immunity.fair', 'Средне');
        return t('immunity.needsWork', 'Нужна работа');
    };

    // SVG Chart dimensions
    const chartWidth = 100;
    const chartHeight = 40;
    const padding = 2;

    // Generate SVG path for the chart
    const chartPath = useMemo(() => {
        const points = historyData.slice(-14); // Last 14 days for cleaner view
        const maxScore = Math.max(...points.map(p => p.score));
        const minScore = Math.min(...points.map(p => p.score));
        const range = maxScore - minScore || 1;

        const pathPoints = points.map((point, index) => {
            const x = padding + (index / (points.length - 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - ((point.score - minScore) / range) * (chartHeight - padding * 2);
            return `${x},${y}`;
        });

        return `M ${pathPoints.join(' L ')}`;
    }, [historyData]);

    // Area fill path
    const areaPath = useMemo(() => {
        const points = historyData.slice(-14);
        const maxScore = Math.max(...points.map(p => p.score));
        const minScore = Math.min(...points.map(p => p.score));
        const range = maxScore - minScore || 1;

        const pathPoints = points.map((point, index) => {
            const x = padding + (index / (points.length - 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - ((point.score - minScore) / range) * (chartHeight - padding * 2);
            return `${x},${y}`;
        });

        return `M ${padding},${chartHeight - padding} L ${pathPoints.join(' L ')} L ${chartWidth - padding},${chartHeight - padding} Z`;
    }, [historyData]);

    return (
        <div className="cyber-card">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {t('immunity.title', 'Иммунитет к угрозам')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('immunity.subtitle', 'История за 30 дней')}
                        </p>
                    </div>
                </div>

                {/* Trend indicator */}
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${stats.trend > 0
                        ? 'bg-cyber-green/10 text-cyber-green'
                        : stats.trend < 0
                            ? 'bg-cyber-red/10 text-cyber-red'
                            : 'bg-muted text-muted-foreground'
                    }`}>
                    {stats.trend > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : stats.trend < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                    ) : (
                        <Minus className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                        {stats.trend > 0 ? '+' : ''}{stats.trend}%
                    </span>
                </div>
            </div>

            {/* Main content */}
            <div className="p-4">
                {/* Current score display */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-bold ${getScoreColor(currentScore)}`}>
                                {currentScore}
                            </span>
                            <span className="text-xl text-muted-foreground">/ 100</span>
                        </div>
                        <p className={`text-sm font-medium ${getScoreColor(currentScore)}`}>
                            {getScoreLabel(currentScore)}
                        </p>
                    </div>

                    {/* Mini chart */}
                    <div className="w-32 h-16">
                        <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="w-full h-full"
                            preserveAspectRatio="none"
                        >
                            {/* Gradient fill */}
                            <defs>
                                <linearGradient id="immunityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Area fill */}
                            <path
                                d={areaPath}
                                fill="url(#immunityGradient)"
                            />

                            {/* Line */}
                            <path
                                d={chartPath}
                                fill="none"
                                stroke="rgb(34, 211, 238)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">{stats.max}%</p>
                        <p className="text-xs text-muted-foreground">{t('immunity.max', 'Максимум')}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">{stats.avg}%</p>
                        <p className="text-xs text-muted-foreground">{t('immunity.avg', 'Среднее')}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">{stats.min}%</p>
                        <p className="text-xs text-muted-foreground">{t('immunity.min', 'Минимум')}</p>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{t('immunity.lastUpdate', 'Последнее обновление')}: {t('immunity.today', 'сегодня')}</span>
                </div>
            </div>

            {/* Footer tip */}
            <div className="px-4 pb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        {t('immunity.tip', 'Проходите сценарии каждый день, чтобы повысить свой иммунитет к киберугрозам')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImmunityHistoryWidget;
