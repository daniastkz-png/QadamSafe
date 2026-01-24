import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { Activity, Zap } from 'lucide-react';

// Mock data generator
const generateHistoryData = () => {
    const data = [];
    const today = new Date();
    let currentScore = 20; // Start low

    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Simulate growth
        if (i % 5 === 0) currentScore += Math.floor(Math.random() * 15);
        if (currentScore > 98) currentScore = 98; // Cap below 100

        data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            score: currentScore,
            event: i === 25 ? 'registration' :
                i === 15 ? 'passed_phishing' :
                    i === 5 ? 'enabled_2fa' : undefined
        });
    }
    return data;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                <p className="text-sm font-semibold mb-1">{data.date}</p>
                <p className="text-cyber-green font-bold">
                    🛡️ {data.score}%
                </p>
                {data.event && (
                    <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                        {data.event === 'registration' && '🎉 Регистрация'}
                        {data.event === 'passed_phishing' && '📧 Курс по фишингу'}
                        {data.event === 'enabled_2fa' && '🔒 Подключен 2FA'}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const ImmunityHistoryWidget: React.FC = () => {
    const { t } = useTranslation();
    const data = useMemo(() => generateHistoryData(), []);

    // Filter points to show dots only for events
    const eventPoints = data.filter(d => d.event);

    return (
        <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="text-cyber-green" />
                        {t('protection.immunityHistory.title', 'История Иммунитета')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('protection.immunityHistory.subtitle', 'Рост вашего уровня защиты за 30 дней')}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyber-green bg-cyber-green/10 px-3 py-1 rounded-full">
                    <Zap size={14} />
                    <span>+35% {t('common.thisMonth', 'за месяц')}</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => str.split('-')[2]}
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />

                        {/* Event Markers */}
                        {eventPoints.map((entry, index) => (
                            <ReferenceDot
                                key={index}
                                x={entry.date}
                                y={entry.score}
                                r={5}
                                fill="#10B981"
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}

                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            fill="url(#colorScore)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
