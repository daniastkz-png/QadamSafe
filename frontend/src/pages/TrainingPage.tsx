import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { firebaseScenariosAPI, firebaseProgressAPI } from '../services/firebase';
import {
    Lock, Play, CheckCircle, MessageSquare, Phone, Mail, Users,
    Sparkles, Zap, Clock, Target, ArrowRight,
    Shield, AlertTriangle, Star, TrendingUp
} from 'lucide-react';
import type { Scenario, UserProgress } from '../types';
import { seedScenarios } from '../utils/seed_data';

// Threat type icons mapping
const getThreatIcon = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    const lowerType = type?.toLowerCase() || '';

    if (lowerTitle.includes('sms') || lowerType.includes('sms')) {
        return <MessageSquare className="w-6 h-6" />;
    }
    if (lowerTitle.includes('звонок') || lowerTitle.includes('call') || lowerType.includes('call')) {
        return <Phone className="w-6 h-6" />;
    }
    if (lowerTitle.includes('email') || lowerTitle.includes('почт') || lowerType.includes('phishing')) {
        return <Mail className="w-6 h-6" />;
    }
    if (lowerTitle.includes('близк') || lowerTitle.includes('друз') || lowerType.includes('social')) {
        return <Users className="w-6 h-6" />;
    }
    return <Shield className="w-6 h-6" />;
};

// Get threat category
const getThreatCategory = (title: string, type?: string): string => {
    const lowerTitle = title.toLowerCase();
    const lowerType = type?.toLowerCase() || '';

    if (lowerTitle.includes('sms') || lowerType.includes('sms')) return 'sms';
    if (lowerTitle.includes('звонок') || lowerTitle.includes('call')) return 'call';
    if (lowerTitle.includes('email') || lowerType.includes('phishing')) return 'phishing';
    if (lowerTitle.includes('близк') || lowerTitle.includes('друз')) return 'social';
    return 'other';
};

export const TrainingPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState<(Scenario & { isUnlocked?: boolean })[]>([]);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Calculate overall progress stats
    const progressStats = useMemo(() => {
        const completed = progress.filter(p => p.completed).length;
        const total = scenarios.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const totalXP = progress.reduce((sum, p) => sum + (p.score || 0), 0);
        return { completed, total, percentage, totalXP };
    }, [progress, scenarios]);

    // Filter scenarios
    const filteredScenarios = useMemo(() => {
        if (activeFilter === 'all') return scenarios;
        if (activeFilter === 'completed') return scenarios.filter(s => progress.find(p => p.scenarioId === s.id)?.completed);
        if (activeFilter === 'pending') return scenarios.filter(s => !progress.find(p => p.scenarioId === s.id)?.completed);
        return scenarios.filter(s => getThreatCategory(s.title, s.type) === activeFilter);
    }, [scenarios, progress, activeFilter]);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-seed if empty
    useEffect(() => {
        if (!loading && scenarios.length === 0) {
            console.log('No scenarios found. Auto-seeding...');
            seedScenarios().then(() => {
                loadData();
            });
        }
    }, [loading, scenarios.length]);

    const loadData = async () => {
        try {
            console.log('Loading data...');

            // 1. Load Scenarios
            let scenariosData;
            try {
                scenariosData = await firebaseScenariosAPI.getAll();
                console.log('Scenarios loaded:', scenariosData?.length);
            } catch (e) {
                console.error('Error loading scenarios:', e);
                throw new Error('Не удалось загрузить сценарии: ' + (e instanceof Error ? e.message : String(e)));
            }

            // 2. Load Progress
            let progressData: any[] = [];
            try {
                progressData = await firebaseProgressAPI.getProgress();
                console.log('Progress loaded:', progressData?.length);
            } catch (e) {
                console.error('Error loading progress (non-critical):', e);
                setToast({ message: 'Ошибка загрузки прогресса (Инфо)', visible: true });
            }

            // Calculate unlocked status
            const sortedScenarios = (scenariosData as any[]).sort((a, b) => a.order - b.order);

            const processedScenarios = sortedScenarios.map((scenario) => {
                return { ...scenario, isUnlocked: true }; // All scenarios unlocked
            });

            setScenarios(processedScenarios);
            setProgress(progressData);

            if (processedScenarios.length === 0) {
                console.warn('Scenarios list is empty after load');
            }

            return true;
        } catch (error) {
            console.error('Fatal error in loadData:', error);
            setToast({ message: `Ошибка: ${error instanceof Error ? error.message : 'Unknown'}`, visible: true });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleManualSeed = async () => {
        setSeeding(true);
        try {
            await seedScenarios();
            await new Promise(r => setTimeout(r, 1000));
            const success = await loadData();

            if (success) {
                setToast({ message: 'Сценарии успешно созданы и загружены!', visible: true });
            }

            setTimeout(() => setToast({ message: '', visible: false }), 4000);
        } catch (e) {
            console.error(e);
            setToast({ message: 'Ошибка создания сценариев: ' + (e instanceof Error ? e.message : String(e)), visible: true });
        } finally {
            setSeeding(false);
        }
    };

    const getScenarioProgress = (scenarioId: string) => {
        return progress.find((p) => p.scenarioId === scenarioId);
    };

    const getLocalizedTitle = (scenario: Scenario) => {
        if (i18n.language === 'en' && scenario.titleEn) return scenario.titleEn;
        if (i18n.language === 'kk' && scenario.titleKk) return scenario.titleKk;
        return scenario.title;
    };

    const getLocalizedDescription = (scenario: Scenario) => {
        if (i18n.language === 'en' && scenario.descriptionEn) return scenario.descriptionEn;
        if (i18n.language === 'kk' && scenario.descriptionKk) return scenario.descriptionKk;
        return scenario.description;
    };

    const getDifficultyConfig = (difficulty: string) => {
        const configs = {
            BEGINNER: {
                color: 'text-cyber-green',
                bg: 'bg-cyber-green/10',
                border: 'border-cyber-green/30',
                glow: 'hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]'
            },
            INTERMEDIATE: {
                color: 'text-cyber-blue',
                bg: 'bg-cyber-blue/10',
                border: 'border-cyber-blue/30',
                glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]'
            },
            ADVANCED: {
                color: 'text-cyber-yellow',
                bg: 'bg-cyber-yellow/10',
                border: 'border-cyber-yellow/30',
                glow: 'hover:shadow-[0_0_20px_rgba(255,217,61,0.15)]'
            },
            EXPERT: {
                color: 'text-cyber-red',
                bg: 'bg-cyber-red/10',
                border: 'border-cyber-red/30',
                glow: 'hover:shadow-[0_0_20px_rgba(255,107,107,0.15)]'
            },
        };
        return configs[difficulty as keyof typeof configs] || configs.BEGINNER;
    };

    const handleStartScenario = (scenario: Scenario & { isUnlocked?: boolean }) => {
        if (scenario.isUnlocked === false) {
            const previousScenario = scenarios.find(s => s.order === scenario.order - 1);
            const levelNumber = previousScenario ? previousScenario.order + 1 : 1;

            const message = t('training.lockedMessage', { level: levelNumber });
            setToast({ message, visible: true });

            setTimeout(() => {
                setToast({ message: '', visible: false });
            }, 3000);
            return;
        }
        navigate(`/training/${scenario.id}`);
    };

    // Find the next unlocked scenario
    const nextScenarioId = scenarios.find(
        s => s.isUnlocked !== false && !getScenarioProgress(s.id)?.completed
    )?.id;

    // Filter options
    const filterOptions = [
        { id: 'all', label: t('training.filter.all', 'Все'), icon: <Target className="w-4 h-4" /> },
        { id: 'pending', label: t('training.filter.pending', 'Не пройдено'), icon: <Clock className="w-4 h-4" /> },
        { id: 'completed', label: t('training.filter.completed', 'Пройдено'), icon: <CheckCircle className="w-4 h-4" /> },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 md:p-8">

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-cyber-green mb-2">
                                    {t('training.title')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('training.subtitle', 'Изучите типичные схемы мошенничества и научитесь их распознавать')}
                                </p>
                            </div>

                            {/* Progress Summary Card */}
                            {!loading && scenarios.length > 0 && (
                                <div className="flex items-center gap-6 bg-gradient-to-r from-cyber-green/10 to-cyan-500/10 border border-cyber-green/30 rounded-xl px-6 py-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyber-green">
                                            {progressStats.completed}/{progressStats.total}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{t('training.completed', 'Пройдено')}</div>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyber-yellow flex items-center gap-1">
                                            <Zap className="w-5 h-5" />
                                            {progressStats.totalXP}
                                        </div>
                                        <div className="text-xs text-muted-foreground">XP</div>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyber-blue">
                                            {progressStats.percentage}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">{t('training.progress', 'Прогресс')}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        {!loading && scenarios.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setActiveFilter(option.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === option.id
                                            ? 'bg-cyber-green text-background'
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto border-4 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
                                <Shield className="w-6 h-6 text-cyber-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-cyber-green text-lg mt-4 animate-pulse">
                                {t('common.loading')}
                            </p>
                        </div>
                    ) : scenarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center py-12 w-full max-w-md">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyber-green/10 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-cyber-green" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground mb-2">
                                    {t('training.initializing', 'Инициализация обучения...')}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Если сценарии не появляются автоматически, нажмите кнопку ниже.
                                </p>
                                <button
                                    onClick={handleManualSeed}
                                    disabled={seeding}
                                    className="cyber-button px-6 py-3 flex items-center justify-center gap-2 mx-auto"
                                >
                                    {seeding ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></span>
                                            Создаем...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            Загрузить сценарии
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Next Recommended Scenario Banner */}
                            {nextScenarioId && activeFilter === 'all' && (
                                <div className="mb-6">
                                    {(() => {
                                        const nextScenario = scenarios.find(s => s.id === nextScenarioId);
                                        if (!nextScenario) return null;
                                        const config = getDifficultyConfig(nextScenario.difficulty);

                                        return (
                                            <div
                                                onClick={() => handleStartScenario(nextScenario)}
                                                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyber-green/10 via-cyan-500/10 to-purple-500/10 border-2 border-cyber-green/50 p-6 cursor-pointer group hover:border-cyber-green transition-all"
                                            >
                                                <div className="absolute top-0 right-0 px-4 py-2 bg-cyber-green/20 rounded-bl-xl">
                                                    <span className="text-cyber-green text-sm font-medium flex items-center gap-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        {t('training.recommended', 'Рекомендуем')}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl ${config.bg} ${config.border} border-2 flex items-center justify-center ${config.color}`}>
                                                        {getThreatIcon(nextScenario.type || '', nextScenario.title)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-cyber-green transition-colors">
                                                            {getLocalizedTitle(nextScenario)}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm line-clamp-1">
                                                            {getLocalizedDescription(nextScenario)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <span className={`px-3 py-1 rounded-lg ${config.bg} ${config.color} text-sm font-medium`}>
                                                                {t(`training.${nextScenario.difficulty.toLowerCase()}`)}
                                                            </span>
                                                            <p className="text-cyber-green text-sm mt-1">
                                                                +{nextScenario.pointsReward} XP
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-cyber-green flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Play className="w-6 h-6 text-background ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Scenarios Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredScenarios.map((scenario, index) => {
                                    const scenarioProgress = getScenarioProgress(scenario.id);
                                    const isCompleted = scenarioProgress?.completed || false;
                                    const isLocked = scenario.isUnlocked === false;
                                    const isNext = scenario.id === nextScenarioId;
                                    const config = getDifficultyConfig(scenario.difficulty);

                                    return (
                                        <div
                                            key={scenario.id}
                                            onClick={() => !isLocked && handleStartScenario(scenario)}
                                            className={`group relative cyber-card overflow-hidden cursor-pointer transition-all duration-300 
                                                ${isCompleted ? 'border-cyber-green/40' : config.border} 
                                                ${isNext && !isCompleted ? 'ring-2 ring-cyber-green/30' : ''} 
                                                ${isLocked ? 'opacity-60 cursor-not-allowed' : config.glow}
                                                hover:translate-y-[-2px]
                                            `}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            {/* Top Color Accent */}
                                            <div className={`absolute top-0 left-0 right-0 h-1 ${isCompleted ? 'bg-cyber-green' : config.bg}`} />

                                            {/* Lock Overlay */}
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                                                    <Lock className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 z-5">
                                                {isCompleted ? (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyber-green/20 text-cyber-green text-xs font-medium">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {t('training.done', 'Пройдено')}
                                                    </div>
                                                ) : isNext ? (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyber-green/20 text-cyber-green text-xs font-medium animate-pulse">
                                                        <Star className="w-3 h-3" />
                                                        {t('training.next', 'Далее')}
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center ${config.color} mb-4 group-hover:scale-110 transition-transform`}>
                                                {getThreatIcon(scenario.type || '', scenario.title)}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-foreground mb-2 pr-20 group-hover:text-cyber-green transition-colors">
                                                {getLocalizedTitle(scenario)}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                {getLocalizedDescription(scenario)}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-2.5 py-1 rounded-md ${config.bg} ${config.color} text-xs font-medium`}>
                                                    {t(`training.${scenario.difficulty.toLowerCase()}`)}
                                                </span>
                                                <span className="text-cyber-green text-sm font-medium flex items-center gap-1">
                                                    <Zap className="w-3 h-3" />
                                                    +{scenario.pointsReward} XP
                                                </span>
                                            </div>

                                            {/* Progress Bar (if completed) */}
                                            {isCompleted && scenarioProgress && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>{t('training.score', 'Результат')}</span>
                                                        <span className="text-cyber-green">{scenarioProgress.score} XP</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyber-green to-cyan-400 rounded-full"
                                                            style={{ width: `${Math.min(100, (scenarioProgress.score / scenario.pointsReward) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <button
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${isLocked
                                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    : isCompleted
                                                        ? 'bg-muted/50 text-foreground hover:bg-muted group-hover:bg-cyber-green/10 group-hover:text-cyber-green'
                                                        : 'bg-cyber-green/10 text-cyber-green hover:bg-cyber-green hover:text-background'
                                                    }`}
                                            >
                                                {isLocked ? (
                                                    <>
                                                        <Lock className="w-4 h-4" />
                                                        {t('training.locked')}
                                                    </>
                                                ) : isCompleted ? (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        {t('training.retryScenario')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        {t('training.startScenario')}
                                                        <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* AI Scenarios Card - PRIMARY FEATURE */}
                                <div
                                    onClick={() => navigate('/ai-scenarios')}
                                    className="group relative cyber-card overflow-hidden cursor-pointer md:col-span-2 lg:col-span-3 border-purple-500/40 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all hover:translate-y-[-2px]"
                                >
                                    {/* Gradient Top Accent */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

                                    <div className="flex flex-col md:flex-row md:items-center gap-6 p-2">
                                        {/* Icon */}
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-2 border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                            <Sparkles className="w-10 h-10 text-purple-400" />
                                        </div>

                                        <div className="flex-1">
                                            {/* Title */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                                    {t('training.aiScenarios', 'ИИ Тренажёр')}
                                                </h3>
                                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold animate-pulse">
                                                    <Sparkles className="w-3 h-3" />
                                                    16 тем
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-muted-foreground mb-4 max-w-2xl">
                                                {t('training.aiScenariosDesc', 'Нейросеть генерирует уникальные сценарии — как с мошенниками, так и с настоящими людьми. Научись различать угрозы от безопасных ситуаций!')}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-medium">
                                                    🤖 16 тематик
                                                </span>
                                                <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                                                    ⚖️ 50% мошенники / 50% настоящие
                                                </span>
                                                <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium">
                                                    ♾️ Безлимитно
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-white group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all whitespace-nowrap">
                                            <Sparkles className="w-5 h-5" />
                                            {t('training.tryAI', 'Начать тренировку')}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Toast Notification */}
                {toast.visible && (
                    <div className="fixed top-24 right-4 md:right-8 z-50 animate-fade-in">
                        <div className="bg-gradient-to-r from-cyber-yellow/20 to-cyber-yellow/10 border-2 border-cyber-yellow rounded-xl px-5 py-4 shadow-[0_0_30px_rgba(255,204,0,0.2)] backdrop-blur-md max-w-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-yellow/20 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-cyber-yellow" />
                                </div>
                                <p className="text-sm font-medium text-foreground">{toast.message}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
