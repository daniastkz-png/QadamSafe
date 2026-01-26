import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Shield, ArrowRight, Lightbulb, Zap, Target, BarChart3, Settings, Brain, Search, Mail, Gamepad2 } from 'lucide-react';

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

                    {/* 4. Interactive Trainers Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Gamepad2 className="w-5 h-5 text-cyber-green" />
                                {t('dashboard.trainers', 'Практические тренажёры')}
                            </h2>
                            <span className="text-xs px-2 py-1 rounded-full bg-cyber-green/10 text-cyber-green font-medium">
                                PRO
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Quiz Card */}
                            <div
                                onClick={() => navigate('/quiz')}
                                className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-5 cursor-pointer hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Brain className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-purple-300 transition-colors">
                                        {t('sidebar.quiz', 'Квизы')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.quizDesc', '12 вопросов, 3 режима игры')}
                                    </p>
                                </div>
                                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Detective Card */}
                            <div
                                onClick={() => navigate('/detective')}
                                className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-cyan-800/5 p-5 cursor-pointer hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Search className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-cyan-300 transition-colors">
                                        {t('sidebar.detective', 'Детектив')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.detectiveDesc', 'Расследуйте подозрительные сообщения')}
                                    </p>
                                </div>
                                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-cyan-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Email Simulator Card */}
                            <div
                                onClick={() => navigate('/email-simulator')}
                                className="group relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-orange-800/5 p-5 cursor-pointer hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/10"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-orange-300 transition-colors">
                                        {t('sidebar.emailSim', 'Email симулятор')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.emailSimDesc', 'Определите фишинговые письма')}
                                    </p>
                                </div>
                                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
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
