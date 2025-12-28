import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';
import { ScenarioPlayer } from '../components/ScenarioPlayer';
import { firebaseAIAPI, AITopic } from '../services/firebase';
import { Sparkles, ArrowLeft, Loader2, Zap, History, Play, RefreshCw } from 'lucide-react';
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

    // Hardcoded topics (fallback if API fails)
    const defaultTopics: AITopic[] = [
        { id: "sms_phishing", name: "SMS-фишинг", nameEn: "SMS Phishing", nameKk: "SMS-фишинг", icon: "📱", color: "cyber-green" },
        { id: "phone_scam", name: "Телефонные мошенники", nameEn: "Phone Scams", nameKk: "Телефон алаяқтары", icon: "📞", color: "cyber-yellow" },
        { id: "social_engineering", name: "Социальная инженерия", nameEn: "Social Engineering", nameKk: "Әлеуметтік инженерия", icon: "👤", color: "cyber-blue" },
        { id: "fake_government", name: "Фейковые госуслуги", nameEn: "Fake Government", nameKk: "Жалған мемлекеттік қызметтер", icon: "🏛️", color: "cyber-red" },
        { id: "investment_scam", name: "Инвестиционное мошенничество", nameEn: "Investment Scams", nameKk: "Инвестициялық алаяқтық", icon: "💰", color: "cyber-yellow" },
        { id: "online_shopping", name: "Онлайн-покупки", nameEn: "Online Shopping", nameKk: "Онлайн-сатып алу", icon: "🛒", color: "cyber-green" },
        { id: "romance_scam", name: "Романтические мошенники", nameEn: "Romance Scams", nameKk: "Романтикалық алаяқтық", icon: "💕", color: "cyber-red" },
        { id: "job_scam", name: "Мошенничество с работой", nameEn: "Job Scams", nameKk: "Жұмыс алаяқтығы", icon: "💼", color: "cyber-blue" }
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
        } catch (err) {
            console.error('Failed to load scenario:', err);
            setError('Сценарий не найден');
        }
    };

    const handleGenerateScenario = async () => {
        if (!selectedTopic) return;

        setGenerating(true);
        setError(null);

        try {
            const scenario = await firebaseAIAPI.generateScenario(selectedTopic, i18n.language);
            setCurrentScenario(scenario as Scenario);
            // Add to history
            setMyScenarios(prev => [scenario as Scenario, ...prev]);
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

            // Reset to topic selection
            setCurrentScenario(null);
            setSelectedTopic(null);
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

    // If playing a scenario
    if (currentScenario) {
        return (
            <div className="min-h-screen bg-background">
                <TopNavBar />
                <div className="max-w-4xl mx-auto p-4 sm:p-8">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setCurrentScenario(null);
                            navigate('/ai-scenarios');
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
        );
    }

    // Topic selection view
    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

            <div className="max-w-6xl mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                {t('ai.title', 'ИИ Сценарии')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('ai.subtitle', 'Уникальные сценарии, созданные нейросетью')}
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
                                        onClick={() => setCurrentScenario(scenario)}
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
                        {t('ai.selectTopic', 'Выберите тему')}
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
                                <Sparkles className="w-6 h-6" />
                                {t('ai.generate', 'Сгенерировать сценарий')}
                            </>
                        )}
                    </button>

                    {generating && (
                        <p className="text-sm text-muted-foreground animate-pulse">
                            {t('ai.generatingHint', 'Gemini создаёт уникальный сценарий специально для вас...')}
                        </p>
                    )}
                </div>

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
                            {t('ai.step2', 'ИИ Gemini создаст уникальный реалистичный сценарий')}
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
    );
};
