import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Brain, CheckCircle, XCircle, Clock, Trophy,
    Zap, Target, ChevronRight, RotateCcw, Star,
    AlertTriangle, Shield, Play, Award, Sparkles,
    MessageSquare, Mail, Phone, Link
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
const QUIZ_QUESTIONS: QuizQuestion[] = [
    // SMS Phishing Questions
    {
        id: 'q1',
        type: 'find_suspicious',
        question: 'Что подозрительного в этом SMS?',
        content: '🏦 Kaspi Bank: Ваша карта заблокирована! Срочно пройдите верификацию: kaspi-secure.kz/unlock',
        contentType: 'sms',
        options: [
            { id: 'a', text: 'Подозрительный домен (kaspi-secure.kz)', isCorrect: true, feedback: 'Верно! Официальный домен Kaspi — kaspi.kz' },
            { id: 'b', text: 'Срочность сообщения', isCorrect: false, feedback: 'Срочность — признак мошенничества, но главная улика — поддельный домен' },
            { id: 'c', text: 'Наличие эмодзи', isCorrect: false, feedback: 'Эмодзи сами по себе не признак мошенничества' },
            { id: 'd', text: 'Всё выглядит нормально', isCorrect: false, feedback: 'Это фишинговое сообщение! Домен kaspi-secure.kz — поддельный' },
        ],
        difficulty: 'easy',
        explanation: 'Официальный домен Kaspi Bank — kaspi.kz. Мошенники создают похожие домены (kaspi-secure.kz, kaspi-bank.com) для кражи данных.',
        category: 'Фишинг'
    },
    {
        id: 'q2',
        type: 'true_false',
        question: 'Банк может попросить вам сообщить код из SMS по телефону для подтверждения операции.',
        options: [
            { id: 'true', text: 'Верно', isCorrect: false, feedback: 'Неверно! Банки НИКОГДА не просят код из SMS по телефону' },
            { id: 'false', text: 'Неверно', isCorrect: true, feedback: 'Правильно! Это типичная схема мошенничества. Код из SMS нельзя никому сообщать!' },
        ],
        difficulty: 'easy',
        explanation: 'Банки никогда не запрашивают коды из SMS по телефону. Если вам звонят с такой просьбой — это 100% мошенники.',
        category: 'Звонки'
    },
    {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Вам пришло SMS: "Мама, срочно нужны деньги, переведи на этот номер". Что вы сделаете?',
        options: [
            { id: 'a', text: 'Сразу переведу деньги — мама просит!', isCorrect: false, feedback: 'Опасно! Мошенники часто притворяются родственниками' },
            { id: 'b', text: 'Позвоню маме на её обычный номер', isCorrect: true, feedback: 'Правильно! Всегда проверяйте через другой канал связи' },
            { id: 'c', text: 'Отвечу на SMS с вопросом', isCorrect: false, feedback: 'Мошенники могут знать некоторые детали. Лучше позвонить напрямую' },
            { id: 'd', text: 'Проигнорирую — точно мошенники', isCorrect: false, feedback: 'Лучше сначала проверить через звонок — вдруг действительно нужна помощь' },
        ],
        difficulty: 'medium',
        explanation: 'Схема "родственник в беде" очень распространена. Всегда перезванивайте на сохранённый номер для проверки.',
        category: 'Социальная инженерия'
    },
    {
        id: 'q4',
        type: 'find_suspicious',
        question: 'Найдите подозрительный элемент в этом email:',
        content: 'От: security@kaspl-bank.kz\nТема: Подтверждение входа в аккаунт\n\nУважаемый клиент! Зафиксирован вход в ваш аккаунт из другого города. Если это не вы, срочно пройдите по ссылке для блокировки.',
        contentType: 'email',
        options: [
            { id: 'a', text: 'Опечатка в домене (kaspl вместо kaspi)', isCorrect: true, feedback: 'Отлично! Вы заметили подмену буквы в домене' },
            { id: 'b', text: 'Упоминание "другого города"', isCorrect: false, feedback: 'Это может быть правдой, но главная улика — поддельный домен' },
            { id: 'c', text: 'Призыв к срочным действиям', isCorrect: false, feedback: 'Срочность — красный флаг, но поддельный домен — главная улика' },
            { id: 'd', text: 'Всё в порядке', isCorrect: false, feedback: 'Внимательнее! Домен kaspl-bank.kz содержит опечатку' },
        ],
        difficulty: 'medium',
        explanation: 'Мошенники используют домены с опечатками: kaspl вместо kaspi, g00gle вместо google. Всегда проверяйте адрес отправителя!',
        category: 'Фишинг'
    },
    {
        id: 'q5',
        type: 'true_false',
        question: 'Если сайт имеет значок замка (HTTPS), он точно безопасен.',
        options: [
            { id: 'true', text: 'Верно', isCorrect: false, feedback: 'Неверно! HTTPS только шифрует соединение, но не гарантирует легитимность сайта' },
            { id: 'false', text: 'Неверно', isCorrect: true, feedback: 'Правильно! Мошенники тоже могут получить SSL-сертификат для своих сайтов' },
        ],
        difficulty: 'hard',
        explanation: 'HTTPS означает только шифрование данных. Фишинговые сайты тоже могут иметь HTTPS. Важно проверять сам домен!',
        category: 'Безопасность'
    },
    {
        id: 'q6',
        type: 'multiple_choice',
        question: 'Какой из этих паролей наиболее надёжный?',
        options: [
            { id: 'a', text: 'qwerty123456', isCorrect: false, feedback: 'Это один из самых популярных (и слабых) паролей' },
            { id: 'b', text: 'Almaty2024!', isCorrect: false, feedback: 'Предсказуемый — содержит город и год' },
            { id: 'c', text: 'Kz$9xM#pL2!v', isCorrect: true, feedback: 'Отлично! Случайная комбинация символов, цифр и спецсимволов' },
            { id: 'd', text: 'password', isCorrect: false, feedback: 'Это самый слабый пароль в мире!' },
        ],
        difficulty: 'easy',
        explanation: 'Надёжный пароль: 12+ символов, заглавные и строчные буквы, цифры, спецсимволы. Не используйте личные данные!',
        category: 'Пароли'
    },
    {
        id: 'q7',
        type: 'find_suspicious',
        question: 'Проверьте эту ссылку. Что не так?',
        content: 'https://egov-kz.online/pension-payment',
        contentType: 'link',
        options: [
            { id: 'a', text: 'Неправильный домен (egov-kz.online вместо egov.kz)', isCorrect: true, feedback: 'Верно! Официальный сайт — egov.kz' },
            { id: 'b', text: 'Слово "pension" на английском', isCorrect: false, feedback: 'Это не главная проблема — домен поддельный' },
            { id: 'c', text: 'Наличие HTTPS', isCorrect: false, feedback: 'HTTPS есть и у фишинговых сайтов' },
            { id: 'd', text: 'Всё нормально', isCorrect: false, feedback: 'Это фишинговый сайт! Официальный — egov.kz' },
        ],
        difficulty: 'medium',
        explanation: 'Официальный сайт электронного правительства Казахстана — egov.kz. Домены вроде egov-kz.online создаются мошенниками.',
        category: 'Фишинг'
    },
    {
        id: 'q8',
        type: 'true_false',
        question: 'Если человек назвал последние 4 цифры вашей карты, значит он точно из банка.',
        options: [
            { id: 'true', text: 'Верно', isCorrect: false, feedback: 'Неверно! Последние 4 цифры часто видны в приложениях доставки, на чеках и т.д.' },
            { id: 'false', text: 'Неверно', isCorrect: true, feedback: 'Правильно! Эти цифры не секретны и могут быть известны из разных источников' },
        ],
        difficulty: 'medium',
        explanation: 'Последние 4 цифры карты не являются секретом. Мошенники могут узнать их из утечек, чеков, приложений доставки.',
        category: 'Звонки'
    },
    {
        id: 'q9',
        type: 'multiple_choice',
        question: 'Вы хотите купить товар на OLX. Продавец предлагает перейти в Telegram для "удобства". Что делать?',
        options: [
            { id: 'a', text: 'Перейти — в Telegram удобнее общаться', isCorrect: false, feedback: 'Опасно! Вне платформы вы теряете защиту OLX' },
            { id: 'b', text: 'Общаться только в чате OLX', isCorrect: true, feedback: 'Верно! На платформе есть запись переписки и защита сделок' },
            { id: 'c', text: 'Дать номер телефона для звонка', isCorrect: false, feedback: 'Это тоже риск — мошенники записывают номера' },
            { id: 'd', text: 'Сразу перевести деньги для "бронирования"', isCorrect: false, feedback: 'Никогда не переводите деньги до получения товара!' },
        ],
        difficulty: 'medium',
        explanation: 'Мошенники просят уйти с площадки, чтобы обойти защиту платформы. Всегда общайтесь в официальном чате!',
        category: 'Онлайн-покупки'
    },
    {
        id: 'q10',
        type: 'find_suspicious',
        question: 'Вам звонят. Что подозрительно в этом диалоге?',
        content: '— Здравствуйте, это служба безопасности Kaspi Bank. На ваше имя пытаются оформить кредит на 500 000 тенге. Чтобы отменить, назовите код из SMS, который сейчас придёт.',
        contentType: 'sms',
        options: [
            { id: 'a', text: 'Просьба назвать код из SMS', isCorrect: true, feedback: 'Верно! Банк НИКОГДА не просит код из SMS по телефону' },
            { id: 'b', text: 'Упоминание конкретной суммы', isCorrect: false, feedback: 'Это создаёт правдоподобность, но главная улика — просьба о коде' },
            { id: 'c', text: 'Вежливое приветствие', isCorrect: false, feedback: 'Мошенники тоже вежливы. Проблема — просьба о коде' },
            { id: 'd', text: 'Всё в порядке, надо помочь', isCorrect: false, feedback: 'Это классическая схема мошенничества!' },
        ],
        difficulty: 'easy',
        explanation: 'Настоящий банк никогда не звонит с просьбой назвать код из SMS. Это главный признак мошенничества.',
        category: 'Звонки'
    },
    {
        id: 'q11',
        type: 'true_false',
        question: 'Бесплатный Wi-Fi в кафе полностью безопасен для онлайн-банкинга.',
        options: [
            { id: 'true', text: 'Верно', isCorrect: false, feedback: 'Неверно! Публичный Wi-Fi может быть небезопасен' },
            { id: 'false', text: 'Неверно', isCorrect: true, feedback: 'Правильно! Избегайте банковских операций через публичный Wi-Fi' },
        ],
        difficulty: 'medium',
        explanation: 'Публичный Wi-Fi может прослушиваться. Для банковских операций используйте мобильный интернет или VPN.',
        category: 'Безопасность'
    },
    {
        id: 'q12',
        type: 'multiple_choice',
        question: 'Как лучше всего хранить пароли?',
        options: [
            { id: 'a', text: 'Записать на стикере у монитора', isCorrect: false, feedback: 'Любой может увидеть ваш пароль!' },
            { id: 'b', text: 'Использовать один пароль везде', isCorrect: false, feedback: 'Если один сайт взломают — все ваши аккаунты под угрозой' },
            { id: 'c', text: 'Использовать менеджер паролей', isCorrect: true, feedback: 'Отлично! Менеджер паролей — самый безопасный способ' },
            { id: 'd', text: 'Сохранять в заметках телефона', isCorrect: false, feedback: 'Если телефон украдут — пароли тоже' },
        ],
        difficulty: 'easy',
        explanation: 'Менеджер паролей шифрует данные и генерирует уникальные пароли для каждого сайта. Это лучший способ хранения.',
        category: 'Пароли'
    },
];

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
