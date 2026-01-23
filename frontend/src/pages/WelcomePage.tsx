import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { SecurityStatistics } from '../components/SecurityStatistics';
import { DailyChallengeWidget } from '../components/DailyChallengeWidget';
import { useAuth } from '../contexts/AuthContext';
import { firebaseAuthAPI } from '../services/firebase';
import {
    Shield, CheckCircle, Target, TrendingUp, Award, Clock,
    ChevronRight, Play, Quote, Zap, Trophy, ArrowRight,
    MessageSquare, Mail, AlertTriangle, X, Phone, Gamepad2
} from 'lucide-react';

// Mini Quiz Component
const MiniQuiz: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const correctAnswer = 1; // Second option (index 1) is correct

    const handleSelect = (index: number) => {
        if (showResult) return;
        setSelected(index);
        setShowResult(true);
    };

    const isCorrect = selected === correctAnswer;

    return (
        <div className="cyber-card border-2 border-cyber-green/30 bg-gradient-to-br from-cyber-green/5 to-background">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-cyber-green" />
                <h3 className="text-xl font-bold text-cyber-green">
                    {t('welcome.quiz.title', 'Быстрая проверка')}
                </h3>
            </div>

            <div className="bg-background/50 rounded-lg p-4 mb-4 border border-border">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-cyber-green/10 rounded-lg flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-cyber-green" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">SMS от "Kaspi Bank"</p>
                        <p className="text-foreground">
                            {t('welcome.quiz.question', 'Ваша карта заблокирована. Для разблокировки пройдите по ссылке: kaspi-unlock.kz')}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {t('welcome.quiz.prompt', 'Что вы сделаете?')}
            </p>

            <div className="space-y-3">
                {/* Option 1 - Wrong */}
                <button
                    onClick={() => handleSelect(0)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult && selected === 0
                        ? 'border-cyber-red bg-cyber-red/10'
                        : showResult
                            ? 'border-border opacity-50'
                            : 'border-border hover:border-cyber-green/50 hover:bg-cyber-green/5'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${showResult && selected === 0
                            ? 'bg-cyber-red text-white'
                            : 'bg-muted text-foreground'
                            }`}>
                            A
                        </div>
                        <span className="text-foreground">
                            {t('welcome.quiz.option1', 'Перейду по ссылке — надо разблокировать карту')}
                        </span>
                        {showResult && selected === 0 && (
                            <X className="w-5 h-5 text-cyber-red ml-auto" />
                        )}
                    </div>
                </button>

                {/* Option 2 - Correct */}
                <button
                    onClick={() => handleSelect(1)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult && selected === 1
                        ? 'border-cyber-green bg-cyber-green/10'
                        : showResult && correctAnswer === 1
                            ? 'border-cyber-green/50 bg-cyber-green/5'
                            : 'border-border hover:border-cyber-green/50 hover:bg-cyber-green/5'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${showResult && (selected === 1 || correctAnswer === 1)
                            ? 'bg-cyber-green text-background'
                            : 'bg-muted text-foreground'
                            }`}>
                            B
                        </div>
                        <span className="text-foreground">
                            {t('welcome.quiz.option2', 'Позвоню в банк по официальному номеру')}
                        </span>
                        {showResult && (selected === 1 || correctAnswer === 1) && (
                            <CheckCircle className="w-5 h-5 text-cyber-green ml-auto" />
                        )}
                    </div>
                </button>
            </div>

            {/* Result */}
            {showResult && (
                <div className={`mt-4 p-4 rounded-lg ${isCorrect
                    ? 'bg-cyber-green/10 border border-cyber-green/30'
                    : 'bg-cyber-red/10 border border-cyber-red/30'
                    }`}>
                    <div className="flex items-start gap-3">
                        {isCorrect ? (
                            <Trophy className="w-6 h-6 text-cyber-green flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-cyber-red flex-shrink-0" />
                        )}
                        <div>
                            <p className={`font-semibold ${isCorrect ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                {isCorrect
                                    ? t('welcome.quiz.correct', 'Отлично! Вы не попались на уловку')
                                    : t('welcome.quiz.wrong', 'Осторожно! Это была ловушка')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('welcome.quiz.explanation', 'Банки никогда не отправляют ссылки для "разблокировки". Всегда звоните по официальному номеру на карте.')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onComplete}
                        className="mt-4 w-full cyber-button py-2 flex items-center justify-center gap-2"
                    >
                        {t('welcome.quiz.continue', 'Продолжить обучение')}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Progress Card Component
const ProgressCard: React.FC<{
    currentScenarios: number;
    totalScenarios: number;
    currentRank: string;
    nextRank: string;
    xp: number;
    xpToNext: number;
}> = ({ currentScenarios, totalScenarios, currentRank, nextRank, xp, xpToNext }) => {
    const { t } = useTranslation();
    const progress = Math.min((currentScenarios / totalScenarios) * 100, 100);
    const xpProgress = Math.min((xp / xpToNext) * 100, 100);

    return (
        <div className="cyber-card border-2 border-cyber-green/30 bg-gradient-to-br from-cyber-green/5 to-background">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-cyber-green" />
                    <h3 className="text-xl font-bold text-cyber-green">
                        {t('welcome.progress.title', 'Ваш прогресс')}
                    </h3>
                </div>
                <div className="px-3 py-1 bg-cyber-green/20 rounded-full">
                    <span className="text-sm font-medium text-cyber-green">{currentRank}</span>
                </div>
            </div>

            {/* Scenarios Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                        {t('welcome.progress.scenarios', 'Пройдено сценариев')}
                    </span>
                    <span className="text-foreground font-medium">{currentScenarios} / {totalScenarios}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyber-green to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* XP Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                        {t('welcome.progress.xpToNext', 'До ранга')} "{nextRank}"
                    </span>
                    <span className="text-foreground font-medium">{xp} / {xpToNext} XP</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyber-green rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-background/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-cyber-green">{currentScenarios}</p>
                    <p className="text-xs text-muted-foreground">{t('welcome.progress.completed', 'Пройдено')}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-cyan-400">{xp}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-cyber-blue">85%</p>
                    <p className="text-xs text-muted-foreground">{t('welcome.progress.accuracy', 'Точность')}</p>
                </div>
            </div>
        </div>
    );
};

// Testimonial Component
const Testimonials: React.FC = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            quote: t('welcome.testimonials.quote1', 'Благодаря QadamSafe я распознала мошенническое письмо и не потеряла деньги. Очень реалистичные сценарии!'),
            author: t('welcome.testimonials.author1', 'Айгуль М.'),
            role: t('welcome.testimonials.role1', 'Бухгалтер, 34 года'),
            avatar: '👩‍💼'
        },
        {
            quote: t('welcome.testimonials.quote2', 'Использую на уроках информатики. Ученики в восторге — учатся на практике, а не на скучных лекциях.'),
            author: t('welcome.testimonials.author2', 'Асан К.'),
            role: t('welcome.testimonials.role2', 'Учитель, НИШ Астана'),
            avatar: '👨‍🏫'
        },
        {
            quote: t('welcome.testimonials.quote3', 'Теперь мои дети знают как проверять ссылки и не делиться кодами из SMS. Спасибо за такую платформу!'),
            author: t('welcome.testimonials.author3', 'Ерлан Б.'),
            role: t('welcome.testimonials.role3', 'Отец двоих детей'),
            avatar: '👨‍👧‍👦'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className="cyber-card">
            <div className="flex items-center gap-2 mb-6">
                <Quote className="w-6 h-6 text-cyber-green" />
                <h2 className="text-2xl font-semibold text-cyber-green">
                    {t('welcome.testimonials.title', 'Отзывы пользователей')}
                </h2>
            </div>

            <div className="relative min-h-[180px]">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-500 ${index === activeIndex
                            ? 'opacity-100 translate-x-0'
                            : index < activeIndex
                                ? 'opacity-0 -translate-x-8'
                                : 'opacity-0 translate-x-8'
                            }`}
                    >
                        <div className="bg-muted/30 rounded-xl p-6 border border-border">
                            <p className="text-lg text-foreground italic mb-4">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center text-2xl">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === activeIndex
                            ? 'bg-cyber-green w-6'
                            : 'bg-muted hover:bg-muted-foreground'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

// Horizontal Timeline Step Component
const TimelineStep: React.FC<{
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    isLast?: boolean;
}> = ({ number, title, description, icon, isLast = false }) => {
    return (
        <div className="flex-1 relative group">
            {/* Connector line */}
            {!isLast && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+24px)] right-0 h-0.5 bg-border group-hover:bg-cyber-green/30 transition-colors" />
            )}

            <div className="flex flex-col items-center text-center">
                {/* Step circle */}
                <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-cyber-green/10 border-2 border-cyber-green flex items-center justify-center group-hover:bg-cyber-green/20 transition-all group-hover:scale-110">
                        <div className="text-cyber-green">
                            {icon}
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-green text-background rounded-full flex items-center justify-center text-sm font-bold">
                        {number}
                    </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-[150px]">{description}</p>
            </div>
        </div>
    );
};

export const WelcomePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleGetStarted = async () => {
        if (user && !user.hasSeenWelcome) {
            try {
                const updatedUser = await firebaseAuthAPI.markWelcomeSeen();
                updateUser(updatedUser as any);
            } catch (error) {
                console.error('Failed to mark welcome as seen:', error);
            }
        }
        navigate('/training');
    };

    // Mock user progress data (in real app, this would come from user context)
    const userProgress = {
        currentScenarios: (user as any)?.scenariosCompleted || 2,
        totalScenarios: 12,
        currentRank: t('ranks.beginner', 'Начинающий'),
        nextRank: t('ranks.aware', 'Осведомлённый'),
        xp: (user as any)?.xp || 150,
        xpToNext: 300
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block cyber-border rounded-lg p-4 mb-4">
                            <Shield className="w-16 h-16 text-cyber-green" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-cyber-green mb-3">
                            {t('welcome.title')}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('welcome.subtitle')}
                        </p>
                    </div>

                    {/* Progress Card - Only for logged in users with some progress */}
                    {user && (
                        <div className="mb-8">
                            <ProgressCard {...userProgress} />
                        </div>
                    )}

                    {/* Daily Challenges */}
                    {user && (
                        <div className="mb-8">
                            <DailyChallengeWidget />
                        </div>
                    )}

                    {/* New Features Quick Access */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-6 h-6 text-cyber-green" />
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('welcome.newFeatures', 'Новые возможности')}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* SMS Analyzer */}
                            <div
                                onClick={() => navigate('/sms-analyzer')}
                                className="group p-5 bg-card border border-border rounded-xl hover:border-cyber-green transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquare className="w-24 h-24 text-cyber-green" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-cyber-green/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyber-green/20 transition-colors">
                                        <MessageSquare className="w-6 h-6 text-cyber-green" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-cyber-green transition-colors">{t('sidebar.smsAnalyzer', 'Проверка SMS')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('welcome.features.smsDesc', 'Проверьте подозрительные сообщения на мошенничество')}</p>
                                </div>
                            </div>

                            {/* Call Simulator */}
                            <div
                                onClick={() => navigate('/call-simulator')}
                                className="group p-5 bg-card border border-border rounded-xl hover:border-cyber-blue transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Phone className="w-24 h-24 text-cyber-blue" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-cyber-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyber-blue/20 transition-colors">
                                        <Phone className="w-6 h-6 text-cyber-blue" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-cyber-blue transition-colors">{t('sidebar.callSimulator', 'Симулятор звонков')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('welcome.features.callDesc', 'Потренируйтесь отвечать телефонным мошенникам')}</p>
                                </div>
                            </div>

                            {/* Cyber Defense */}
                            <div
                                onClick={() => navigate('/cyber-defense')}
                                className="group p-5 bg-card border border-border rounded-xl hover:border-purple-500 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Gamepad2 className="w-24 h-24 text-purple-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                        <Gamepad2 className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg group-hover:text-purple-500 transition-colors">Cyber Defense</h3>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500 text-white font-bold">GAME</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t('welcome.features.gameDesc', 'Защитите систему от потока киберугроз')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* Left: Mini Quiz */}
                        <div>
                            {!quizCompleted ? (
                                <MiniQuiz onComplete={() => setQuizCompleted(true)} />
                            ) : (
                                <div className="cyber-card border-2 border-cyber-green/30 bg-cyber-green/5 h-full flex flex-col items-center justify-center text-center p-8">
                                    <Trophy className="w-16 h-16 text-cyber-green mb-4" />
                                    <h3 className="text-2xl font-bold text-cyber-green mb-2">
                                        {t('welcome.quizDone.title', 'Отличное начало!')}
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        {t('welcome.quizDone.subtitle', 'Вы показали, что умеете распознавать угрозы. Продолжайте обучение!')}
                                    </p>
                                    <button
                                        onClick={handleGetStarted}
                                        className="cyber-button px-8 py-3 flex items-center gap-2"
                                    >
                                        <Play className="w-5 h-5" />
                                        {t('welcome.getStarted')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Threat Protection Visual */}
                        <div className="cyber-card border-2 border-cyber-green/30 bg-cyber-green/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-6 h-6 text-cyber-green" />
                                <h3 className="text-xl font-bold text-cyber-green">
                                    {t('welcome.whyNow.title')}
                                </h3>
                            </div>
                            <p className="text-cyber-green font-semibold mb-2">
                                {t('welcome.whyNow.mainStat')}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('welcome.whyNow.mainContext')}
                            </p>
                            <SecurityStatistics />
                        </div>
                    </div>

                    {/* How It Works - Horizontal Timeline */}
                    <div className="cyber-card mb-8">
                        <div className="flex items-center gap-2 mb-8">
                            <CheckCircle className="w-6 h-6 text-cyber-green" />
                            <h2 className="text-2xl font-semibold text-cyber-green">
                                {t('welcome.howItWorks')}
                            </h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                            <TimelineStep
                                number={1}
                                title={t('welcome.timeline.step1Title', 'Выберите сценарий')}
                                description={t('welcome.timeline.step1Desc', 'Фишинг, звонки, SMS — разные угрозы')}
                                icon={<Mail className="w-7 h-7" />}
                            />
                            <TimelineStep
                                number={2}
                                title={t('welcome.timeline.step2Title', 'Примите решение')}
                                description={t('welcome.timeline.step2Desc', 'Как бы вы поступили в реальности?')}
                                icon={<Target className="w-7 h-7" />}
                            />
                            <TimelineStep
                                number={3}
                                title={t('welcome.timeline.step3Title', 'Получите анализ')}
                                description={t('welcome.timeline.step3Desc', 'Разбор ошибок и правильных действий')}
                                icon={<TrendingUp className="w-7 h-7" />}
                            />
                            <TimelineStep
                                number={4}
                                title={t('welcome.timeline.step4Title', 'Заработайте награды')}
                                description={t('welcome.timeline.step4Desc', 'Очки, достижения и ранги')}
                                icon={<Award className="w-7 h-7" />}
                                isLast
                            />
                        </div>
                    </div>

                    {/* What You'll Learn - Grid with hover effects */}
                    <div className="cyber-card mb-8">
                        <h2 className="text-2xl font-semibold text-cyber-green mb-6 flex items-center gap-2">
                            <Target className="w-6 h-6" />
                            {t('welcome.whatYouLearn')}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <SkillCard
                                icon={<Mail className="w-6 h-6" />}
                                title={t('welcome.skills.phishing.title', 'Фишинговые письма')}
                                description={t('welcome.skills.phishing.desc', 'Распознавание поддельных email от банков и сервисов')}
                            />
                            <SkillCard
                                icon={<MessageSquare className="w-6 h-6" />}
                                title={t('welcome.skills.sms.title', 'SMS-мошенничество')}
                                description={t('welcome.skills.sms.desc', 'Выявление фальшивых сообщений о выигрышах и блокировках')}
                            />
                            <SkillCard
                                icon={<AlertTriangle className="w-6 h-6" />}
                                title={t('welcome.skills.social.title', 'Социальная инженерия')}
                                description={t('welcome.skills.social.desc', 'Защита от манипуляций и психологического давления')}
                            />
                            <SkillCard
                                icon={<Shield className="w-6 h-6" />}
                                title={t('welcome.skills.data.title', 'Защита данных')}
                                description={t('welcome.skills.data.desc', 'Безопасное хранение паролей и личной информации')}
                            />
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="mb-8">
                        <Testimonials />
                    </div>

                    {/* Final CTA */}
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Clock className="w-4 h-4" />
                            {t('welcome.timeEstimate', 'Первый сценарий займёт 3-5 минут')}
                        </div>
                        <div>
                            <button
                                onClick={handleGetStarted}
                                className="cyber-button text-lg px-12 py-4 group"
                            >
                                <span className="flex items-center gap-2">
                                    <Play className="w-5 h-5" />
                                    {t('welcome.getStarted')}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Enhanced Skill Card
const SkillCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
    icon,
    title,
    description
}) => {
    return (
        <div className="group p-4 bg-muted/30 rounded-lg border border-border hover:border-cyber-green/50 hover:bg-cyber-green/5 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green group-hover:bg-cyber-green/20 group-hover:scale-110 transition-all">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-cyber-green transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};
