import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Brain, CheckCircle, XCircle, Clock, Trophy,
    Zap, Target, ChevronRight, RotateCcw, Star,
    AlertTriangle, Shield, Award, Sparkles,
    MessageSquare, Mail, Link
} from 'lucide-react';

// Types
interface QuizQuestion {
    id: string;
    type: 'find_suspicious' | 'true_false' | 'multiple_choice' | 'spot_the_difference';
    question: string;
    content?: string; // SMS, email text etc
    contentType?: 'sms' | 'email' | 'link';
    options: QuizOption[];
    timeLimit?: number; // seconds
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string;
    category: string;
}

interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
}

interface QuizState {
    status: 'menu' | 'playing' | 'review' | 'results';
    currentQuestionIndex: number;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    streak: number;
    maxStreak: number;
    timeRemaining: number;
    answers: { questionId: string; optionId: string; isCorrect: boolean; timeSpent: number }[];
    startTime: number | null;
}

// Quiz data - comprehensive set of cybersecurity questions for Kazakhstan
import quizQuestionsData from '../data/quizQuestions.json';

// Cast JSON data to typed interface
const QUIZ_QUESTIONS: QuizQuestion[] = quizQuestionsData as unknown as QuizQuestion[];

// Quiz modes
const QUIZ_MODES = [
    {
        id: 'quick',
        name: 'Быстрый раунд',
        nameEn: 'Quick Round',
        description: '5 вопросов за 60 секунд',
        descriptionEn: '5 questions in 60 seconds',
        icon: Zap,
        questionCount: 5,
        timeLimit: 60,
        color: 'cyber-yellow'
    },
    {
        id: 'practice',
        name: 'Практика',
        nameEn: 'Practice',
        description: '10 вопросов без ограничения времени',
        descriptionEn: '10 questions, no time limit',
        icon: Target,
        questionCount: 10,
        timeLimit: 0,
        color: 'cyber-green'
    },
    {
        id: 'challenge',
        name: 'Испытание',
        nameEn: 'Challenge',
        description: 'Все 12 вопросов + таймер',
        descriptionEn: 'All 12 questions + timer',
        icon: Trophy,
        questionCount: 12,
        timeLimit: 180,
        color: 'cyber-red'
    }
];

// Timer component
const Timer: React.FC<{ seconds: number; maxSeconds: number }> = ({ seconds, maxSeconds }) => {
    const percent = maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 100;
    const isLow = seconds <= 10;

    return (
        <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 ${isLow ? 'text-cyber-red animate-pulse' : 'text-muted-foreground'}`} />
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isLow ? 'bg-cyber-red' : 'bg-cyber-green'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className={`text-sm font-mono ${isLow ? 'text-cyber-red font-bold' : 'text-muted-foreground'}`}>
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </span>
        </div>
    );
};

// Question Card Component
const QuestionCard: React.FC<{
    question: QuizQuestion;
    onAnswer: (optionId: string) => void;
    selectedAnswer: string | null;
    showFeedback: boolean;
}> = ({ question, onAnswer, selectedAnswer, showFeedback }) => {
    const { t } = useTranslation();

    const getContentIcon = () => {
        switch (question.contentType) {
            case 'sms': return <MessageSquare className="w-5 h-5" />;
            case 'email': return <Mail className="w-5 h-5" />;
            case 'link': return <Link className="w-5 h-5" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const getTypeLabel = () => {
        switch (question.type) {
            case 'find_suspicious': return t('quiz.types.findSuspicious', 'Найди подвох');
            case 'true_false': return t('quiz.types.trueFalse', 'Верно или неверно');
            case 'multiple_choice': return t('quiz.types.multipleChoice', 'Выбор ответа');
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Question type badge */}
            <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-cyber-green/10 text-cyber-green text-sm rounded-full">
                    {getTypeLabel()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    {question.difficulty === 'easy' ? t('quiz.easy', 'Легко') :
                        question.difficulty === 'medium' ? t('quiz.medium', 'Средне') :
                            t('quiz.hard', 'Сложно')}
                </span>
            </div>

            {/* Question text */}
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {question.question}
            </h2>

            {/* Content preview (for find_suspicious type) */}
            {question.content && (
                <div className={`p-4 rounded-xl border-2 ${question.contentType === 'sms' ? 'bg-gray-800 border-gray-600' :
                    question.contentType === 'email' ? 'bg-blue-900/30 border-blue-700/50' :
                        'bg-purple-900/30 border-purple-700/50'
                    }`}>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        {getContentIcon()}
                        <span className="text-sm">
                            {question.contentType === 'sms' ? 'SMS' :
                                question.contentType === 'email' ? 'Email' : 'URL'}
                        </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap font-mono text-sm">
                        {question.content}
                    </p>
                </div>
            )}

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.isCorrect;
                    const showResult = showFeedback && isSelected;

                    return (
                        <button
                            key={option.id}
                            onClick={() => !showFeedback && onAnswer(option.id)}
                            disabled={showFeedback}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${showFeedback
                                ? isCorrect
                                    ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                                    : isSelected
                                        ? 'bg-cyber-red/20 border-cyber-red text-cyber-red'
                                        : 'bg-muted/30 border-border text-muted-foreground'
                                : isSelected
                                    ? 'bg-cyber-green/10 border-cyber-green'
                                    : 'bg-card border-border hover:border-cyber-green/50 hover:bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {showFeedback && isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0" />
                                )}
                                {showFeedback && isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-cyber-red flex-shrink-0" />
                                )}
                                <span className="font-medium">{option.text}</span>
                            </div>
                            {showResult && option.feedback && (
                                <p className="mt-2 text-sm opacity-80 pl-8">
                                    {option.feedback}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Explanation after answer */}
            {showFeedback && (
                <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-cyber-green" />
                        <span className="font-bold text-cyber-green">
                            {t('quiz.explanation', 'Объяснение')}
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        {question.explanation}
                    </p>
                </div>
            )}
        </div>
    );
};

// Results Screen Component
const ResultsScreen: React.FC<{
    quizState: QuizState;
    questions: QuizQuestion[];
    onRestart: () => void;
    onMenu: () => void;
}> = ({ quizState, questions, onRestart, onMenu }) => {
    const { t } = useTranslation();
    const percentage = Math.round((quizState.correctAnswers / questions.length) * 100);

    const getResultMessage = () => {
        if (percentage >= 90) return { text: t('quiz.result.excellent', 'Превосходно!'), icon: '🏆', color: 'text-yellow-400' };
        if (percentage >= 70) return { text: t('quiz.result.good', 'Хорошо!'), icon: '⭐', color: 'text-cyber-green' };
        if (percentage >= 50) return { text: t('quiz.result.fair', 'Неплохо!'), icon: '👍', color: 'text-cyan-400' };
        return { text: t('quiz.result.needsPractice', 'Нужно больше практики'), icon: '💪', color: 'text-orange-400' };
    };

    const result = getResultMessage();
    const xpEarned = quizState.score + (quizState.maxStreak * 5);

    return (
        <div className="max-w-lg mx-auto text-center space-y-8">
            {/* Result icon */}
            <div className="text-8xl animate-bounce-slow">{result.icon}</div>

            {/* Result message */}
            <div>
                <h2 className={`text-3xl font-bold ${result.color}`}>{result.text}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('quiz.resultSubtitle', 'Вы ответили правильно на {{correct}} из {{total}} вопросов', {
                        correct: quizState.correctAnswers,
                        total: questions.length
                    })}
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-3xl font-bold text-cyber-green">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">{t('quiz.accuracy', 'Точность')}</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-3xl font-bold text-cyber-yellow">{quizState.score}</p>
                    <p className="text-sm text-muted-foreground">{t('quiz.points', 'Очки')}</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-3xl font-bold text-orange-400">x{quizState.maxStreak}</p>
                    <p className="text-sm text-muted-foreground">{t('quiz.maxStreak', 'Макс. серия')}</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-3xl font-bold text-cyan-400">{quizState.correctAnswers}</p>
                    <p className="text-sm text-muted-foreground">{t('quiz.correct', 'Верно')}</p>
                </div>
            </div>

            {/* XP earned */}
            <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30">
                <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-cyber-green" />
                    <span className="text-xl font-bold text-cyber-green">+{xpEarned} XP</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onMenu}
                    className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-colors"
                >
                    {t('quiz.backToMenu', 'В меню')}
                </button>
                <button
                    onClick={onRestart}
                    className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    {t('quiz.playAgain', 'Ещё раз')}
                </button>
            </div>
        </div>
    );
};

// Main Quiz Page Component
export const QuizPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [quizState, setQuizState] = useState<QuizState>({
        status: 'menu',
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        streak: 0,
        maxStreak: 0,
        timeRemaining: 0,
        answers: [],
        startTime: null
    });

    const [selectedMode, setSelectedMode] = useState<typeof QUIZ_MODES[0] | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Shuffle and select questions for the quiz
    const shuffleQuestions = useCallback((count: number) => {
        const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }, []);

    // Start quiz with selected mode
    const startQuiz = (mode: typeof QUIZ_MODES[0]) => {
        const quizQuestions = shuffleQuestions(mode.questionCount);
        setSelectedMode(mode);
        setQuestions(quizQuestions);
        setQuizState({
            status: 'playing',
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            streak: 0,
            maxStreak: 0,
            timeRemaining: mode.timeLimit,
            answers: [],
            startTime: Date.now()
        });
        setSelectedAnswer(null);
        setShowFeedback(false);
    };

    // Timer countdown
    useEffect(() => {
        if (quizState.status !== 'playing' || !selectedMode?.timeLimit) return;

        const timer = setInterval(() => {
            setQuizState(prev => {
                if (prev.timeRemaining <= 1) {
                    clearInterval(timer);
                    return { ...prev, status: 'results', timeRemaining: 0 };
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizState.status, selectedMode]);

    // Handle answer selection
    const handleAnswer = (optionId: string) => {
        if (showFeedback) return;

        setSelectedAnswer(optionId);
        setShowFeedback(true);

        const currentQuestion = questions[quizState.currentQuestionIndex];
        const selectedOption = currentQuestion.options.find(o => o.id === optionId);
        const isCorrect = selectedOption?.isCorrect || false;

        // Update quiz state
        setQuizState(prev => ({
            ...prev,
            score: prev.score + (isCorrect ? (10 + prev.streak * 2) : 0),
            correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: prev.wrongAnswers + (isCorrect ? 0 : 1),
            streak: isCorrect ? prev.streak + 1 : 0,
            maxStreak: isCorrect ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak,
            answers: [...prev.answers, {
                questionId: currentQuestion.id,
                optionId,
                isCorrect,
                timeSpent: 0
            }]
        }));
    };

    // Move to next question
    const nextQuestion = () => {
        if (quizState.currentQuestionIndex >= questions.length - 1) {
            setQuizState(prev => ({ ...prev, status: 'results' }));
        } else {
            setQuizState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1
            }));
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    };

    // Go back to menu
    const goToMenu = () => {
        setQuizState(prev => ({ ...prev, status: 'menu' }));
        setSelectedMode(null);
        setQuestions([]);
    };

    // Feature Gate check
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<Brain className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Menu Screen */}
                    {quizState.status === 'menu' && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full text-cyber-green text-sm font-medium mb-4">
                                    <Brain className="w-4 h-4" />
                                    {t('quiz.badge', 'Интерактивные квизы')}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                    🧠 {t('quiz.title', 'Квиз по кибербезопасности')}
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    {t('quiz.subtitle', 'Проверьте свои знания и прокачайте навыки защиты')}
                                </p>
                            </div>

                            {/* Mode selection */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground">
                                    {t('quiz.selectMode', 'Выберите режим')}
                                </h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {QUIZ_MODES.map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => startQuiz(mode)}
                                                className={`p-6 rounded-2xl border-2 border-${mode.color}/30 bg-${mode.color}/10 hover:border-${mode.color} hover:bg-${mode.color}/20 transition-all text-left group`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl bg-${mode.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`w-6 h-6 text-${mode.color}`} />
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground mb-1">
                                                    {mode.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {mode.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info section */}
                            <div className="cyber-card">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-cyber-green" />
                                    {t('quiz.whatYouLearn', 'Что вы узнаете')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        t('quiz.learn1', 'Распознавание фишинговых ссылок'),
                                        t('quiz.learn2', 'Определение мошеннических звонков'),
                                        t('quiz.learn3', 'Безопасность паролей'),
                                        t('quiz.learn4', 'Защита при онлайн-покупках')
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Playing Screen */}
                    {quizState.status === 'playing' && questions.length > 0 && (
                        <div className="space-y-6">
                            {/* Progress header */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">
                                        {t('quiz.question', 'Вопрос')} {quizState.currentQuestionIndex + 1}/{questions.length}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: questions.length }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-all ${i < quizState.currentQuestionIndex
                                                    ? quizState.answers[i]?.isCorrect
                                                        ? 'bg-cyber-green'
                                                        : 'bg-cyber-red'
                                                    : i === quizState.currentQuestionIndex
                                                        ? 'bg-cyber-yellow w-4'
                                                        : 'bg-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Score */}
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-cyber-yellow" />
                                        <span className="font-bold text-cyber-yellow">{quizState.score}</span>
                                    </div>

                                    {/* Streak */}
                                    {quizState.streak > 0 && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                                            <Zap className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm font-bold text-orange-400">x{quizState.streak}</span>
                                        </div>
                                    )}

                                    {/* Timer */}
                                    {selectedMode?.timeLimit ? (
                                        <Timer seconds={quizState.timeRemaining} maxSeconds={selectedMode.timeLimit} />
                                    ) : null}
                                </div>
                            </div>

                            {/* Question card */}
                            <div className="cyber-card">
                                <QuestionCard
                                    question={questions[quizState.currentQuestionIndex]}
                                    onAnswer={handleAnswer}
                                    selectedAnswer={selectedAnswer}
                                    showFeedback={showFeedback}
                                />
                            </div>

                            {/* Next button */}
                            {showFeedback && (
                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-4 rounded-xl bg-cyber-green text-black font-bold text-lg hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                                >
                                    {quizState.currentQuestionIndex >= questions.length - 1
                                        ? t('quiz.showResults', 'Показать результаты')
                                        : t('quiz.nextQuestion', 'Следующий вопрос')
                                    }
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Results Screen */}
                    {quizState.status === 'results' && (
                        <ResultsScreen
                            quizState={quizState}
                            questions={questions}
                            onRestart={() => selectedMode && startQuiz(selectedMode)}
                            onMenu={goToMenu}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QuizPage;
