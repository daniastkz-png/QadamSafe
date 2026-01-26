import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, AlertTriangle, CheckCircle, FileSearch,
    MessageSquare, Phone, Mail, Link,
    Award, ChevronRight,
    Eye, Sparkles, Target
} from 'lucide-react';

// Types
interface Evidence {
    id: string;
    type: 'red_flag' | 'green_flag' | 'neutral';
    text: string;
    explanation: string;
    found: boolean;
}

interface DetectiveCase {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    isScam: boolean;
    scenario: {
        type: 'sms' | 'email' | 'call' | 'website';
        content: string;
        sender: string;
        metadata?: string;
    };
    evidences: Evidence[];
    conclusion: string;
    tips: string[];
}

interface GameState {
    status: 'menu' | 'investigation' | 'verdict' | 'results';
    currentCase: DetectiveCase | null;
    foundEvidences: string[];
    verdict: 'scam' | 'legitimate' | null;
    score: number;
    casesCompleted: number;
    correctVerdicts: number;
}

// Detective Cases Data
import detectiveCasesData from '../data/detectiveCases.json';

// Detective Cases Data
const DETECTIVE_CASES: DetectiveCase[] = detectiveCasesData as unknown as DetectiveCase[];

// Evidence Card Component
const EvidenceCard: React.FC<{
    evidence: Evidence;
    isRevealed: boolean;
    onFind: () => void;
}> = ({ evidence, isRevealed, onFind }) => {
    const getTypeStyles = () => {
        if (!isRevealed) return 'bg-muted/50 border-border hover:border-muted-foreground';
        switch (evidence.type) {
            case 'red_flag': return 'bg-red-900/30 border-cyber-red';
            case 'green_flag': return 'bg-green-900/30 border-cyber-green';
            default: return 'bg-yellow-900/30 border-cyber-yellow';
        }
    };

    const getTypeIcon = () => {
        if (!isRevealed) return <Eye className="w-5 h-5" />;
        switch (evidence.type) {
            case 'red_flag': return <AlertTriangle className="w-5 h-5 text-cyber-red" />;
            case 'green_flag': return <CheckCircle className="w-5 h-5 text-cyber-green" />;
            default: return <Search className="w-5 h-5 text-cyber-yellow" />;
        }
    };

    const getTypeLabel = () => {
        switch (evidence.type) {
            case 'red_flag': return '🚩 Красный флаг';
            case 'green_flag': return '✅ Признак легитимности';
            default: return '⚠️ Нейтральный факт';
        }
    };

    return (
        <button
            onClick={onFind}
            disabled={isRevealed}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getTypeStyles()} ${!isRevealed ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-1">
                    {getTypeIcon()}
                </div>
                <div className="flex-1">
                    {isRevealed ? (
                        <>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                {getTypeLabel()}
                            </p>
                            <p className="font-medium text-foreground mb-2">
                                {evidence.text}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {evidence.explanation}
                            </p>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic">
                            Нажмите, чтобы исследовать улику...
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
};

// Scenario Display Component
const ScenarioDisplay: React.FC<{
    scenario: DetectiveCase['scenario'];
}> = ({ scenario }) => {
    const getIcon = () => {
        switch (scenario.type) {
            case 'sms': return <MessageSquare className="w-5 h-5" />;
            case 'email': return <Mail className="w-5 h-5" />;
            case 'call': return <Phone className="w-5 h-5" />;
            default: return <Link className="w-5 h-5" />;
        }
    };

    const getTypeLabel = () => {
        switch (scenario.type) {
            case 'sms': return 'SMS сообщение';
            case 'email': return 'Email письмо';
            case 'call': return 'Телефонный звонок';
            default: return 'Веб-сайт';
        }
    };

    const getBgColor = () => {
        switch (scenario.type) {
            case 'sms': return 'bg-gray-800 border-gray-600';
            case 'email': return 'bg-blue-900/30 border-blue-700/50';
            case 'call': return 'bg-purple-900/30 border-purple-700/50';
            default: return 'bg-cyan-900/30 border-cyan-700/50';
        }
    };

    return (
        <div className={`p-5 rounded-xl border-2 ${getBgColor()}`}>
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                {getIcon()}
                <span className="text-sm font-medium">{getTypeLabel()}</span>
            </div>

            <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Отправитель:</p>
                <p className="text-foreground font-medium">{scenario.sender}</p>
            </div>

            <div className="p-4 bg-black/30 rounded-lg mb-3">
                <p className="text-foreground whitespace-pre-wrap font-mono text-sm">
                    {scenario.content}
                </p>
            </div>

            {scenario.metadata && (
                <p className="text-xs text-muted-foreground italic">
                    📋 {scenario.metadata}
                </p>
            )}
        </div>
    );
};

// Main Detective Page Component
export const DetectivePage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [gameState, setGameState] = useState<GameState>({
        status: 'menu',
        currentCase: null,
        foundEvidences: [],
        verdict: null,
        score: 0,
        casesCompleted: 0,
        correctVerdicts: 0
    });

    // Start a new case
    const startCase = (caseData: DetectiveCase) => {
        setGameState({
            ...gameState,
            status: 'investigation',
            currentCase: caseData,
            foundEvidences: [],
            verdict: null
        });
    };

    // Random case
    const startRandomCase = () => {
        const availableCases = DETECTIVE_CASES.filter(c =>
            !gameState.foundEvidences.includes(c.id) // For simplicity, allow replay
        );
        const randomCase = availableCases[Math.floor(Math.random() * availableCases.length)];
        startCase(randomCase);
    };

    // Find evidence
    const findEvidence = (evidenceId: string) => {
        if (!gameState.foundEvidences.includes(evidenceId)) {
            setGameState(prev => ({
                ...prev,
                foundEvidences: [...prev.foundEvidences, evidenceId],
                score: prev.score + 5
            }));
        }
    };

    // Submit verdict
    const submitVerdict = (verdict: 'scam' | 'legitimate') => {
        setGameState(prev => ({
            ...prev,
            status: 'verdict',
            verdict
        }));
    };

    // Check if verdict is correct
    const isVerdictCorrect = () => {
        if (!gameState.currentCase || !gameState.verdict) return false;
        return (gameState.verdict === 'scam') === gameState.currentCase.isScam;
    };

    // Go to results
    const showResults = () => {
        const correct = isVerdictCorrect();
        setGameState(prev => ({
            ...prev,
            status: 'results',
            score: prev.score + (correct ? 50 : 0),
            casesCompleted: prev.casesCompleted + 1,
            correctVerdicts: prev.correctVerdicts + (correct ? 1 : 0)
        }));
    };

    // Back to menu
    const backToMenu = () => {
        setGameState(prev => ({
            ...prev,
            status: 'menu',
            currentCase: null,
            foundEvidences: [],
            verdict: null
        }));
    };

    // Feature Gate check
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<FileSearch className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Menu Screen */}
                    {gameState.status === 'menu' && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full text-cyber-green text-sm font-medium mb-4">
                                    <FileSearch className="w-4 h-4" />
                                    {t('detective.badge', 'Режим Детектив')}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                    🔍 {t('detective.title', 'Кибер-Детектив')}
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    {t('detective.subtitle', 'Расследуйте подозрительные сообщения и звонки')}
                                </p>
                            </div>

                            {/* Stats */}
                            {gameState.casesCompleted > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-card rounded-xl border border-border text-center">
                                        <p className="text-2xl font-bold text-cyber-green">{gameState.casesCompleted}</p>
                                        <p className="text-sm text-muted-foreground">{t('detective.casesSolved', 'Дел раскрыто')}</p>
                                    </div>
                                    <div className="p-4 bg-card rounded-xl border border-border text-center">
                                        <p className="text-2xl font-bold text-cyber-yellow">{gameState.score}</p>
                                        <p className="text-sm text-muted-foreground">{t('detective.points', 'Очков')}</p>
                                    </div>
                                    <div className="p-4 bg-card rounded-xl border border-border text-center">
                                        <p className="text-2xl font-bold text-cyan-400">
                                            {gameState.casesCompleted > 0
                                                ? Math.round((gameState.correctVerdicts / gameState.casesCompleted) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">{t('detective.accuracy', 'Точность')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick start */}
                            <button
                                onClick={startRandomCase}
                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyber-green to-cyan-500 text-black font-bold text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                            >
                                <Target className="w-8 h-8" />
                                {t('detective.startRandom', 'Начать расследование')}
                            </button>

                            {/* Cases list */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground">
                                    {t('detective.allCases', 'Все дела')}
                                </h2>
                                <div className="grid gap-4">
                                    {DETECTIVE_CASES.map((caseData) => (
                                        <button
                                            key={caseData.id}
                                            onClick={() => startCase(caseData)}
                                            className="p-4 bg-card rounded-xl border border-border hover:border-cyber-green transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-foreground group-hover:text-cyber-green transition-colors">
                                                        {caseData.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {caseData.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${caseData.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                            caseData.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {caseData.difficulty === 'easy' ? 'Легко' :
                                                                caseData.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {caseData.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyber-green transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Investigation Screen */}
                    {gameState.status === 'investigation' && gameState.currentCase && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {gameState.currentCase.title}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {gameState.currentCase.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-cyber-yellow" />
                                    <span className="font-bold text-cyber-yellow">{gameState.score}</span>
                                </div>
                            </div>

                            {/* Scenario */}
                            <div className="cyber-card">
                                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileSearch className="w-5 h-5 text-cyber-green" />
                                    Материалы дела
                                </h2>
                                <ScenarioDisplay scenario={gameState.currentCase.scenario} />
                            </div>

                            {/* Evidence gathering */}
                            <div className="cyber-card">
                                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-cyber-yellow" />
                                    Улики ({gameState.foundEvidences.length}/{gameState.currentCase.evidences.length})
                                </h2>
                                <div className="space-y-3">
                                    {gameState.currentCase.evidences.map((evidence) => (
                                        <EvidenceCard
                                            key={evidence.id}
                                            evidence={evidence}
                                            isRevealed={gameState.foundEvidences.includes(evidence.id)}
                                            onFind={() => findEvidence(evidence.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Verdict buttons */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-foreground text-center">
                                    Ваш вердикт
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => submitVerdict('scam')}
                                        className="p-6 rounded-xl bg-cyber-red/20 border-2 border-cyber-red hover:bg-cyber-red/30 transition-all text-center"
                                    >
                                        <AlertTriangle className="w-8 h-8 text-cyber-red mx-auto mb-2" />
                                        <p className="font-bold text-cyber-red">Мошенничество</p>
                                    </button>
                                    <button
                                        onClick={() => submitVerdict('legitimate')}
                                        className="p-6 rounded-xl bg-cyber-green/20 border-2 border-cyber-green hover:bg-cyber-green/30 transition-all text-center"
                                    >
                                        <CheckCircle className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                                        <p className="font-bold text-cyber-green">Настоящее</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verdict Screen */}
                    {gameState.status === 'verdict' && gameState.currentCase && (
                        <div className="max-w-lg mx-auto text-center space-y-8">
                            {/* Result */}
                            <div className={`text-8xl ${isVerdictCorrect() ? 'animate-bounce-slow' : ''}`}>
                                {isVerdictCorrect() ? '🎉' : '❌'}
                            </div>

                            <div>
                                <h2 className={`text-3xl font-bold ${isVerdictCorrect() ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                    {isVerdictCorrect() ? 'Верно!' : 'Неверно!'}
                                </h2>
                                <p className="text-muted-foreground mt-2">
                                    Это было {gameState.currentCase.isScam ? 'мошенничество' : 'настоящее сообщение'}
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="cyber-card text-left">
                                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyber-green" />
                                    Разбор
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {gameState.currentCase.conclusion}
                                </p>

                                <h4 className="font-bold text-foreground mb-2">💡 Советы:</h4>
                                <ul className="space-y-1">
                                    {gameState.currentCase.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green mt-0.5 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* XP earned */}
                            <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30">
                                <div className="flex items-center justify-center gap-2">
                                    <Award className="w-6 h-6 text-cyber-green" />
                                    <span className="text-xl font-bold text-cyber-green">
                                        +{gameState.foundEvidences.length * 5 + (isVerdictCorrect() ? 50 : 0)} XP
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={backToMenu}
                                    className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-colors"
                                >
                                    В меню
                                </button>
                                <button
                                    onClick={() => { showResults(); startRandomCase(); }}
                                    className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    Следующее дело
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DetectivePage;
