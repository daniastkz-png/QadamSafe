import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';
import { firebaseScenariosAPI, firebaseProgressAPI } from '../services/firebase';
import { Lock, Play, CheckCircle } from 'lucide-react';
import type { Scenario, UserProgress } from '../types';
import { seedScenarios } from '../utils/seed_data';

export const TrainingPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState<(Scenario & { isUnlocked?: boolean })[]>([]);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

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
            const [scenariosData, progressData] = await Promise.all([
                firebaseScenariosAPI.getAll(),
                firebaseProgressAPI.getProgress(),
            ]);
            setScenarios(scenariosData as any);
            setProgress(progressData as any);
        } catch (error) {
            console.error('Failed to load training data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSeed = async () => {
        setSeeding(true);
        try {
            await seedScenarios();
            await loadData();
            setToast({ message: 'Сценарии успешно созданы!', visible: true });
            setTimeout(() => setToast({ message: '', visible: false }), 3000);
        } catch (e) {
            console.error(e);
            setToast({ message: 'Ошибка создания сценариев', visible: true });
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

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            BEGINNER: 'text-cyber-green border-cyber-green/30',
            INTERMEDIATE: 'text-cyber-blue border-cyber-blue/30',
            ADVANCED: 'text-cyber-yellow border-cyber-yellow/30',
            EXPERT: 'text-cyber-red border-cyber-red/30',
        };
        return colors[difficulty as keyof typeof colors] || colors.BEGINNER;
    };

    const handleStartScenario = (scenario: Scenario & { isUnlocked?: boolean }) => {
        if (scenario.isUnlocked === false) {
            // Find previous scenario to show in message
            const previousScenario = scenarios.find(s => s.order === scenario.order - 1);
            const levelNumber = previousScenario ? previousScenario.order + 1 : 1;

            const message = t('training.lockedMessage', { level: levelNumber });
            setToast({ message, visible: true });

            // Auto-hide after 3 seconds
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

    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

            <div className="max-w-7xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-cyber-green">
                        {t('training.title')}
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="text-cyber-green text-xl animate-pulse-glow">
                            {t('common.loading')}
                        </div>
                    </div>
                ) : scenarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-center py-12 w-full max-w-md">
                            <div className="text-cyber-green text-lg animate-pulse-glow mb-4">
                                {t('training.initializing', 'Инициализация обучения...')}
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                Если сценарии не появляются автоматически, нажмите кнопку ниже.
                            </p>
                            <button
                                onClick={handleManualSeed}
                                disabled={seeding}
                                className="cyber-button px-6 py-2 flex items-center justify-center gap-2 mx-auto"
                            >
                                {seeding ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></span>
                                        Создаем...
                                    </>
                                ) : (
                                    'Загрузить сценарии'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scenarios.map((scenario) => {
                            const scenarioProgress = getScenarioProgress(scenario.id);
                            const isCompleted = scenarioProgress?.completed || false;
                            const isLocked = scenario.isUnlocked === false;
                            const isNext = scenario.id === nextScenarioId;

                            return (
                                <div
                                    key={scenario.id}
                                    className={`cyber-card relative ${isCompleted ? 'border-cyber-green/50' : ''
                                        } ${isNext ? 'ring-2 ring-cyber-green/50' : ''} ${isLocked ? 'opacity-60' : ''
                                        }`}
                                >
                                    {/* Lock Overlay */}
                                    {isLocked && (
                                        <div className="absolute top-4 right-4">
                                            <Lock className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Next Indicator */}
                                    {isNext && !isCompleted && (
                                        <div className="absolute -top-2 -right-2 bg-cyber-green text-background px-3 py-1 rounded-full text-xs font-bold">
                                            {t('training.next')}
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-foreground flex-1">
                                            {getLocalizedTitle(scenario)}
                                        </h3>
                                        {isCompleted && (
                                            <CheckCircle className="w-6 h-6 text-cyber-green flex-shrink-0" />
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted-foreground mb-4 line-clamp-3">
                                        {getLocalizedDescription(scenario)}
                                    </p>

                                    {/* Difficulty & Points */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <span
                                            className={`px-3 py-1 rounded-md border text-sm font-medium ${getDifficultyColor(
                                                scenario.difficulty
                                            )}`}
                                        >
                                            {t(`training.${scenario.difficulty.toLowerCase()}`)}
                                        </span>
                                        <span className="text-cyber-green text-sm">
                                            +{scenario.pointsReward} {t('training.points')}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleStartScenario(scenario)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${isLocked
                                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                            : isCompleted
                                                ? 'bg-muted text-foreground hover:bg-muted/80'
                                                : 'cyber-button'
                                            }`}
                                    >
                                        {isLocked ? (
                                            <>
                                                <Lock className="w-5 h-5" />
                                                {t('training.locked')}
                                            </>
                                        ) : isCompleted ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                {t('training.retryScenario')}
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                {t('training.startScenario')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}

                        {/* AI Scenarios Card - Now Active! */}
                        <div
                            onClick={() => navigate('/ai-scenarios')}
                            className="cyber-card relative cursor-pointer border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all group"
                        >
                            <div className="absolute top-4 right-4">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold animate-pulse">
                                    ✨ NEW
                                </div>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex-1">
                                    {t('training.aiScenarios', 'ИИ Сценарии')}
                                </h3>
                            </div>

                            <p className="text-muted-foreground mb-4">
                                {t('training.aiScenariosDesc', 'Уникальные сценарии, созданные нейросетью Gemini специально для вас')}
                            </p>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-3 py-1 rounded-md border border-purple-500/30 text-sm font-medium text-purple-400">
                                    Gemini AI
                                </span>
                                <span className="text-cyan-400 text-sm">
                                    {t('training.unlimited', 'Безлимитно')}
                                </span>
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white group-hover:shadow-lg transition-all"
                            >
                                <Play className="w-5 h-5" />
                                {t('training.tryAI', 'Попробовать ИИ')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast.visible && (
                <div className="fixed top-24 right-8 z-50 animate-fade-in">
                    <div className="bg-gradient-to-r from-cyber-yellow/20 to-cyber-yellow/10 border-2 border-cyber-yellow rounded-lg px-5 py-4 shadow-[0_0_30px_rgba(255,204,0,0.3)] backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <Lock className="w-5 h-5 text-cyber-yellow" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
