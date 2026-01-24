import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Shield, ArrowRight, Lightbulb, Zap, Target, BarChart3, Settings } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Random greeting variant (1-3)
    const [greetingVariant] = useState(() => {
        const randomNum = Math.floor(Math.random() * 3) + 1;
        return `dashboard.greetings.variant${randomNum}`;
    });

    const tips = [
        { title: t('tips.password.title', 'Пароль'), text: t('tips.password.text', 'Используйте менеджер паролей. Единый пароль для всех сайтов — это риск.') },
        { title: t('tips.phishing.title', 'Фишинг'), text: t('tips.phishing.text', 'Никогда не переходите по ссылкам из неожиданных писем, даже от "банка".') },
        { title: t('tips.2fa.title', '2FA'), text: t('tips.2fa.text', 'Включите двухфакторную аутентификацию везде, где это возможно.') },
        { title: t('tips.updates.title', 'Обновления'), text: t('tips.updates.text', 'Регулярно обновляйте операционную систему и браузер.') },
        { title: t('tips.wifi.title', 'Wi-Fi'), text: t('tips.wifi.text', 'Избегайте ввода личных данных при использовании публичного Wi-Fi.') },
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* 1. Header & Greeting */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                <span className="text-cyber-green">{user?.name || user?.email?.split('@')[0]}</span>
                                {t(greetingVariant)}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('dashboard.welcomeSubtitle', 'Готовы продолжить обучение безопасности?')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Level Badge */}
                            <div className="px-4 py-2 rounded-full border border-cyber-green/30 bg-cyber-green/10 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-cyber-green" />
                                <span className="text-sm font-medium text-cyber-green">
                                    {t(`ranks.rank${user?.rank || 1}`)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Action Area - Next Mission */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Next Mission Card (Takes 2 columns) */}
                        <div className="md:col-span-2 cyber-card group relative overflow-hidden border-cyber-green/50 hover:border-cyber-green transition-all cursor-pointer"
                            onClick={() => navigate('/training')}>

                            {/* Background decoration */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-cyber-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-cyber-green/10 transition-all duration-500" />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 rounded-lg bg-cyber-green text-background">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wider uppercase text-cyber-green">
                                            {t('dashboard.recommended', 'Рекомендуем')}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-cyber-green transition-colors">
                                        {t('dashboard.continueTraining', 'Продолжить обучение')}
                                    </h2>
                                    <p className="text-muted-foreground max-w-md">
                                        {t('dashboard.continueTrainingDesc', 'Вас ждут новые сценарии по фишингу и социальной инженерии.')}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <button className="cyber-button px-6 py-2 flex items-center gap-2">
                                        {t('common.start', 'Начать')}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Tip Card (Takes 1 column) */}
                        <div className="cyber-card bg-cyber-blue/5 border-cyber-blue/20 relative">
                            <div className="absolute top-4 right-4 text-cyber-blue/20">
                                <Lightbulb className="w-12 h-12" />
                            </div>

                            <h3 className="text-lg font-bold text-cyber-blue mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                {t('dashboard.dailyTip', 'Совет дня')}
                            </h3>

                            <div className="space-y-2">
                                <p className="font-medium text-foreground">{randomTip.title}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {randomTip.text}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Quick Navigation Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickNavCard
                            icon={<Zap className="w-6 h-6" />}
                            title={t('sidebar.assistant', 'AI Ассистент')}
                            desc={t('dashboard.askAI', 'Задать вопрос')}
                            onClick={() => navigate('/assistant')}
                            color="purple"
                        />
                        <QuickNavCard
                            icon={<Target className="w-6 h-6" />}
                            title={t('sidebar.training', 'Сценарии')}
                            desc={t('dashboard.practice', 'Практика')}
                            onClick={() => navigate('/training')}
                            color="green"
                        />
                        <QuickNavCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title={t('sidebar.progress', 'Прогресс')}
                            desc={t('dashboard.stats', 'Статистика')}
                            onClick={() => navigate('/progress')}
                            color="blue"
                        />
                        <QuickNavCard
                            icon={<Settings className="w-6 h-6" />}
                            title={t('sidebar.settings', 'Настройки')}
                            desc={t('dashboard.profile', 'Профиль')}
                            onClick={() => navigate('/settings')}
                            color="gray"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </DashboardLayout>
    );
};

// Helper Component for Quick Nav
const QuickNavCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void; color: string }> = ({ icon, title, desc, onClick, color }) => {
    const colorStyles = {
        purple: "text-purple-500 group-hover:border-purple-500/50 bg-purple-500/5",
        green: "text-cyber-green group-hover:border-cyber-green/50 bg-cyber-green/5",
        blue: "text-cyber-blue group-hover:border-cyber-blue/50 bg-cyber-blue/5",
        gray: "text-gray-400 group-hover:border-gray-400/50 bg-gray-500/5"
    };

    const activeColor = colorStyles[color as keyof typeof colorStyles] || colorStyles.gray;

    return (
        <div
            onClick={onClick}
            className={`group p-4 rounded-xl border border-border bg-card cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${activeColor.replace('text-', 'hover:shadow-').split(' ')[0]}/10`} // dynamic shadow messy, stick to simple border
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${activeColor}`}>
                {icon}
            </div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-white transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
    );
};
