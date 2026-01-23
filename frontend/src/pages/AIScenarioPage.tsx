import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { ScenarioPlayer } from '../components/ScenarioPlayer';
import { firebaseAIAPI, AITopic } from '../services/firebase';
import { ScenarioContextModal } from '../components/ScenarioContextModal';
import { CyberTerminal } from '../components/CyberTerminal';
import { Sparkles, ArrowLeft, Loader2, Zap, History, Play, RefreshCw, Trophy, CheckCircle } from 'lucide-react';
import type { Scenario } from '../types';


export const AIScenarioPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { scenarioId } = useParams();

    const [topics, setTopics] = useState<AITopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
    const [myScenarios, setMyScenarios] = useState<Scenario[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [postResults, setPostResults] = useState<{ score: number; mistakes: number } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Hardcoded topics (fallback if API fails) - Kazakhstan-specific
    const defaultTopics: AITopic[] = [
        // KASPI BANK
        { id: "kaspi_sms", name: "Kaspi фишинг SMS", nameEn: "Kaspi SMS Phishing", nameKk: "Kaspi SMS алаяқтығы", icon: "💳", color: "cyber-green" },
        { id: "kaspi_call", name: "Звонки от 'Kaspi'", nameEn: "Fake Kaspi Calls", nameKk: "Жалған Kaspi қоңыраулары", icon: "📞", color: "cyber-red" },
        // eGOV
        { id: "egov_scam", name: "Фейковый eGov", nameEn: "Fake eGov", nameKk: "Жалған eGov", icon: "🏛️", color: "cyber-blue" },
        // МАРКЕТПЛЕЙСЫ  
        { id: "olx_scam", name: "Мошенники на OLX", nameEn: "OLX Scammers", nameKk: "OLX алаяқтары", icon: "🛒", color: "cyber-yellow" },
        { id: "kolesa_scam", name: "Обман на Kolesa.kz", nameEn: "Kolesa.kz Fraud", nameKk: "Kolesa.kz алаяқтығы", icon: "🚗", color: "cyber-green" },
        // МЕССЕНДЖЕРЫ
        { id: "telegram_scam", name: "Взлом Telegram", nameEn: "Telegram Hacking", nameKk: "Telegram бұзу", icon: "✈️", color: "cyber-blue" },
        { id: "whatsapp_relative", name: "'Мама' просит деньги", nameEn: "Fake Relative", nameKk: "Жалған туыс", icon: "👨‍👩‍👧", color: "cyber-red" },
        // РАБОТА
        { id: "job_enbek", name: "Фейковые вакансии", nameEn: "Fake Jobs", nameKk: "Жалған вакансиялар", icon: "💼", color: "cyber-yellow" },
        { id: "crypto_work", name: "Крипто-заработок", nameEn: "Crypto Earnings", nameKk: "Крипто табыс", icon: "₿", color: "cyber-green" },
        // УСЛУГИ
        { id: "utility_scam", name: "Фейковые долги ЖКХ", nameEn: "Fake Utility Bills", nameKk: "Жалған коммуналдық төлемдер", icon: "💡", color: "cyber-blue" },
        // ДОСТАВКА
        { id: "delivery_kazpost", name: "Фейковый Kazpost", nameEn: "Fake Kazpost", nameKk: "Жалған Kazpost", icon: "📦", color: "cyber-yellow" },
        { id: "glovo_scam", name: "Мошенники Glovo", nameEn: "Glovo Scammers", nameKk: "Glovo алаяқтары", icon: "🛵", color: "cyber-red" },
        // ФИНАНСЫ
        { id: "investment_pyramid", name: "Финансовые пирамиды", nameEn: "Financial Pyramids", nameKk: "Қаржылық пирамидалар", icon: "📈", color: "cyber-green" },
        // РАЗНОЕ
        { id: "lottery", name: "Фейковые розыгрыши", nameEn: "Fake Lotteries", nameKk: "Жалған ұтыс ойындары", icon: "🎰", color: "cyber-yellow" },
        { id: "charity", name: "Фейковые сборы", nameEn: "Fake Charity", nameKk: "Жалған қайырымдылық", icon: "🎗️", color: "cyber-blue" },
        { id: "taxi_scam", name: "Обман в такси", nameEn: "Taxi Scams", nameKk: "Такси алаяқтығы", icon: "🚕", color: "cyber-red" }
    ];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (scenarioId) {
            loadScenarioById(scenarioId);
        }
    }, [scenarioId]);

    const loadData = async () => {
        try {
            // Try to load topics from API, fallback to defaults
            try {
                const topicsData = await firebaseAIAPI.getTopics();
                setTopics(topicsData);
            } catch {
                setTopics(defaultTopics);
            }

            // Load user's AI scenarios history
            setLoadingHistory(true);
            const scenarios = await firebaseAIAPI.getMyScenarios();
            setMyScenarios(scenarios as Scenario[]);
        } catch (err) {
            console.error('Failed to load AI data:', err);
            setTopics(defaultTopics);
        } finally {
            setLoadingHistory(false);
        }
    };

    const loadScenarioById = async (id: string) => {
        try {
            const scenario = await firebaseAIAPI.getScenarioById(id);
            setCurrentScenario(scenario as Scenario);
            setIsPlaying(false);
        } catch (err) {
            console.error('Failed to load scenario:', err);
            setError('Сценарий не найден');
        }
    };

    const handleGenerateScenario = async () => {
        if (!selectedTopic) return;

        setGenerating(true);
        setError(null);
        setPostResults(null);

        try {
            const scenario = await firebaseAIAPI.generateScenario(selectedTopic, i18n.language);
            setCurrentScenario(scenario as Scenario);
            setIsPlaying(false);
            setMyScenarios(prev => [scenario as Scenario, ...prev]);
            navigate(`/training/${(scenario as Scenario).id}`);
        } catch (err: any) {
            console.error('Failed to generate scenario:', err);
            setError(err.message || 'Не удалось сгенерировать сценарий. Попробуйте снова.');
        } finally {
            setGenerating(false);
        }
    };

    const handleScenarioComplete = async (decisions: any[]) => {
        if (!currentScenario) return;

        try {
            // Calculate score
            const safeDecisions = decisions.filter(d => d.outcomeType === 'safe').length;
            const totalDecisions = decisions.length;
            const score = Math.round((safeDecisions / totalDecisions) * currentScenario.pointsReward);
            const mistakes = totalDecisions - safeDecisions;

            await firebaseAIAPI.completeAIScenario(currentScenario.id, {
                score,
                mistakes,
                decisions
            });

            setCurrentScenario(null);
            setSelectedTopic(null);
            setPostResults({ score, mistakes });
            navigate('/training');
        } catch (err) {
            console.error('Failed to save progress:', err);
        }
    };

    const getLocalizedTopicName = (topic: AITopic) => {
        if (i18n.language === 'en') return topic.nameEn;
        if (i18n.language === 'kk') return topic.nameKk;
        return topic.name;
    };

    const getLocalizedTitle = (scenario: Scenario) => {
        if (i18n.language === 'en' && scenario.titleEn) return scenario.titleEn;
        if (i18n.language === 'kk' && scenario.titleKk) return scenario.titleKk;
        return scenario.title;
    };

    const getLocalizedDescription = (scenario: Scenario) => {
        if (i18n.language === 'en' && scenario.descriptionEn) return scenario.descriptionEn;
        if (i18n.language === 'kk' && scenario.descriptionKk) return scenario.descriptionKk;
        return scenario.description || '';
    };

    // If playing a scenario
    if (currentScenario) {
        return (
            <DashboardLayout>
                {!isPlaying ? (
                    <ScenarioContextModal
                        title={getLocalizedTitle(currentScenario)}
                        description={getLocalizedDescription(currentScenario)}
                        subtitle={getLocalizedTopicName(topics.find(t => t.id === currentScenario.type?.toLowerCase()) || defaultTopics[0])}
                        onStart={() => setIsPlaying(true)}
                        onClose={() => {
                            setCurrentScenario(null);
                            navigate('/training');
                        }}
                    />
                ) : (
                    <div className="min-h-screen bg-background">
                        <div className="max-w-4xl mx-auto p-4 sm:p-8">
                            {/* Back button */}
                            <button
                                onClick={() => {
                                    setCurrentScenario(null);
                                    navigate('/training');
                                }}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('common.back', 'Назад')}
                            </button>

                            {/* AI Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-purple-300">
                                        {t('ai.generated', 'Сгенерировано ИИ')}
                                    </span>
                                </div>
                            </div>

                            <ScenarioPlayer
                                scenario={currentScenario}
                                onComplete={handleScenarioComplete}
                            />
                        </div>
                    </div>
                )}
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">

                <div className="max-w-6xl mx-auto p-4 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                    {t('training.title', 'Обучение')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('training.aiSubtitle', 'Сценарии созданы ИИ — выберите тему и начните')}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                            <History className="w-4 h-4" />
                            {showHistory ? t('ai.hideHistory', 'Скрыть историю') : t('ai.showHistory', 'История')}
                            {myScenarios.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                                    {myScenarios.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 text-cyber-red">
                            {error}
                        </div>
                    )}

                    {/* Results banner after completing a scenario */}
                    {postResults && (
                        <div className="mb-6 p-6 rounded-xl border-2 border-cyber-green/40 bg-gradient-to-br from-cyber-green/10 to-emerald-500/5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-cyber-green/20 flex items-center justify-center">
                                        <Trophy className="w-7 h-7 text-cyber-green" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-cyber-green">{t('scenario.resultsTitle', 'Результаты')}</h3>
                                        <p className="text-foreground">
                                            <span className="font-semibold">{postResults.score}</span> {t('training.points', 'очков')}
                                            <span className="mx-2 text-muted-foreground">·</span>
                                            <span>{postResults.mistakes} {t('progress.errorsCount', 'ошибок')}</span>
                                        </p>
                                        {postResults.mistakes === 0 && (
                                            <p className="text-cyber-green font-medium mt-1">{t('scenario.perfectRun', 'Идеально! Без единой ошибки 🎉')}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPostResults(null)}
                                        className="px-4 py-2 rounded-lg bg-cyber-green/20 text-cyber-green font-medium hover:bg-cyber-green/30 transition-colors"
                                    >
                                        {t('scenario.anotherScenario', 'Ещё сценарий')}
                                    </button>
                                    <button
                                        onClick={() => { setPostResults(null); navigate('/progress'); }}
                                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {t('scenario.viewProgress', 'Смотреть прогресс')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Section */}
                    {showHistory && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-purple-400" />
                                {t('ai.yourScenarios', 'Ваши сценарии')}
                            </h2>

                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                                </div>
                            ) : myScenarios.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('ai.noHistory', 'Вы ещё не генерировали сценарии')}
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myScenarios.slice(0, 6).map((scenario) => (
                                        <button
                                            key={scenario.id}
                                            onClick={() => { setCurrentScenario(scenario); navigate(`/training/${scenario.id}`); }}
                                            className="cyber-card text-left hover:border-purple-500/50 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-medium text-foreground group-hover:text-purple-300 transition-colors line-clamp-2">
                                                    {getLocalizedTitle(scenario)}
                                                </h3>
                                                <Play className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 flex-shrink-0" />
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {scenario.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs text-purple-400">
                                                    +{scenario.pointsReward} {t('training.points', 'очков')}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Topic Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-cyber-green" />
                            {t('ai.chooseChallenge', 'Выберите челлендж')}
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {(topics.length > 0 ? topics : defaultTopics).map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedTopic === topic.id
                                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                        : 'border-border hover:border-purple-500/50 bg-card'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{topic.icon}</div>
                                    <h3 className="font-medium text-foreground">
                                        {getLocalizedTopicName(topic)}
                                    </h3>
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Generate Button */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleGenerateScenario}
                            disabled={!selectedTopic || generating}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${selectedTopic && !generating
                                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    {t('ai.generating', 'Генерация...')}
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6" />
                                    {selectedTopic ? t('ai.playCta', 'Играть') : t('ai.generate', 'Сгенерировать сценарий')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Generation Overlay */}
                    {generating && (
                        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                            <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
                                <CyberTerminal duration={8000} />
                                <p className="text-center text-cyber-green/50 mt-4 text-sm animate-pulse">
                                    {t('ai.generatingHint', 'ИИ создаёт уникальный сценарий...')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info Block */}
// ...

                    {/* Info Block */}
                    <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/20">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            {t('ai.howItWorks', 'Как это работает?')}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400">1.</span>
                                {t('ai.step1', 'Выберите тему мошенничества для обучения')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400">2.</span>
                                {t('ai.step2', 'ИИ создаст уникальный реалистичный сценарий')}
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400">3.</span>
                                {t('ai.step3', 'Пройдите сценарий и получите очки за правильные решения')}
                            </li>
                        </ul>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <RefreshCw className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-300">
                                {t('ai.unique', 'Каждый сценарий уникален — генерируйте сколько хотите!')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
