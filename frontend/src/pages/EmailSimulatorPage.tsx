import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Mail, Inbox, Star, AlertTriangle, CheckCircle,
    XCircle, User, Paperclip,
    Eye, Shield, Award, ChevronRight
} from 'lucide-react';

// Types
interface EmailMessage {
    id: string;
    from: {
        name: string;
        email: string;
    };
    subject: string;
    preview: string;
    body: string;
    date: string;
    isPhishing: boolean;
    redFlags: RedFlag[];
    isStarred: boolean;
    isRead: boolean;
    hasAttachment: boolean;
    attachmentName?: string;
}

interface RedFlag {
    id: string;
    element: string;
    explanation: string;
    type: 'domain' | 'urgency' | 'link' | 'grammar' | 'request' | 'attachment';
}

interface GameState {
    status: 'menu' | 'inbox' | 'reading' | 'verdict' | 'results';
    selectedEmail: EmailMessage | null;
    foundFlags: string[];
    verdict: 'phishing' | 'legitimate' | null;
    score: number;
    emailsProcessed: number;
    correctVerdicts: number;
    streak: number;
}

// Email Data
const MOCK_EMAILS: EmailMessage[] = [
    {
        id: 'email1',
        from: { name: 'Kaspi Bank', email: 'security@kaspl-bank.kz' },
        subject: '⚠️ Срочно: Ваш аккаунт заблокирован',
        preview: 'Уважаемый клиент! Зафиксирована подозрительная активность...',
        body: `Уважаемый клиент!

Зафиксирована подозрительная активность в вашем аккаунте. Для восстановления доступа необходимо подтвердить личность в течение 24 часов.

Пройдите верификацию по ссылке:
https://kaspi-secure-verify.com/auth/confirm?user=82734

Если вы не сделаете это в течение 24 часов, ваш аккаунт будет заблокирован навсегда.

С уважением,
Служба безопасности Kaspi Bank`,
        date: '10:32',
        isPhishing: true,
        redFlags: [
            { id: 'rf1', element: 'kaspl-bank.kz (опечатка в домене)', explanation: 'Официальный домен — kaspi.kz, не kaspl-bank.kz', type: 'domain' },
            { id: 'rf2', element: 'kaspi-secure-verify.com', explanation: 'Фишинговый домен, не принадлежит Kaspi', type: 'link' },
            { id: 'rf3', element: '"в течение 24 часов"', explanation: 'Создание искусственной срочности — тактика мошенников', type: 'urgency' },
            { id: 'rf4', element: '"заблокирован навсегда"', explanation: 'Угрозы и запугивание — признак мошенничества', type: 'urgency' }
        ],
        isStarred: false,
        isRead: false,
        hasAttachment: false
    },
    {
        id: 'email2',
        from: { name: 'Kaspi Bank', email: 'noreply@kaspi.kz' },
        subject: 'Чек операции: Перевод 5 000 ₸',
        preview: 'Перевод успешно выполнен. Детали операции...',
        body: `Перевод успешно выполнен

Сумма: 5 000 ₸
Получатель: Алия К.
Дата: 25 января 2026, 09:15
Номер операции: KSP-28374923

Это автоматическое уведомление. Если вы не совершали эту операцию, обратитесь в поддержку через приложение Kaspi.

Kaspi Bank`,
        date: '09:15',
        isPhishing: false,
        redFlags: [],
        isStarred: true,
        isRead: true,
        hasAttachment: false
    },
    {
        id: 'email3',
        from: { name: 'Apple', email: 'support@apple-id-verification.online' },
        subject: 'Ваш Apple ID заблокирован',
        preview: 'Ваша учётная запись Apple заблокирована по соображениям безопасности...',
        body: `Уважаемый пользователь,

Ваша учётная запись Apple ID была заблокирован по соображениям безопасности.

Кто-то пытался войти в ваш аккаунт из неизвестного места. Для разблокировки подтвердите свои данные:

[Подтвердить аккаунт]
https://apple-id-verify.xyz/confirm

Если вы не разблокируете аккаунт в течение 48 часов, он будет удален.

С уважением,
Команда Apple Support`,
        date: 'Вчера',
        isPhishing: true,
        redFlags: [
            { id: 'rf1', element: 'apple-id-verification.online', explanation: 'Apple использует только apple.com', type: 'domain' },
            { id: 'rf2', element: 'apple-id-verify.xyz', explanation: 'Фишинговая ссылка, не Apple', type: 'link' },
            { id: 'rf3', element: '"была заблокирован"', explanation: 'Грамматическая ошибка в официальном письме', type: 'grammar' },
            { id: 'rf4', element: '"будет удален"', explanation: 'Apple не удаляет аккаунты за 48 часов', type: 'urgency' }
        ],
        isStarred: false,
        isRead: false,
        hasAttachment: false
    },
    {
        id: 'email4',
        from: { name: 'HR Department', email: 'hr@company-benefits.ru' },
        subject: 'Ваш бонус за январь готов к выплате',
        preview: 'Поздравляем! Вам начислен бонус 150 000 ₸...',
        body: `Добрый день!

Поздравляем! По результатам работы вам начислен бонус 150 000 ₸.

Для получения бонуса необходимо заполнить форму с банковскими реквизитами:
https://bonus-pay.site/form/82374

Бонус будет выплачен в течение 3 рабочих дней после заполнения формы.

С уважением,
Отдел кадров`,
        date: 'Вчера',
        isPhishing: true,
        redFlags: [
            { id: 'rf1', element: 'company-benefits.ru', explanation: 'Подозрительный домен, не принадлежит вашей компании', type: 'domain' },
            { id: 'rf2', element: 'bonus-pay.site', explanation: 'Фишинговый сайт для кражи банковских данных', type: 'link' },
            { id: 'rf3', element: 'Нет имени получателя', explanation: 'Официальные письма обращаются по имени', type: 'request' },
            { id: 'rf4', element: 'Просьба заполнить реквизиты', explanation: 'HR не запрашивает реквизиты по email', type: 'request' }
        ],
        isStarred: false,
        isRead: false,
        hasAttachment: false
    },
    {
        id: 'email5',
        from: { name: 'Amazon', email: 'shipping@amazon.com' },
        subject: 'Your order has been shipped',
        preview: 'Your package is on its way! Track your delivery...',
        body: `Hello,

Your order #112-4859372-8374621 has been shipped!

Estimated delivery: January 27-29, 2026
Shipped to: [Your saved address]

Track your package:
https://amazon.com/track/112-4859372-8374621

Thank you for shopping with us!

Amazon.com`,
        date: '2 дня',
        isPhishing: false,
        redFlags: [],
        isStarred: false,
        isRead: true,
        hasAttachment: false
    },
    {
        id: 'email6',
        from: { name: 'eGov Kazakhstan', email: 'info@egov.kz' },
        subject: 'Уведомление о готовности документа',
        preview: 'Ваш документ готов к получению в ЦОНе...',
        body: `Уважаемый гражданин!

Ваш документ (Справка об отсутствии судимости) готов к получению.

Номер заявки: EGV-2026-8429374
Место получения: ЦОН г. Алматы, ул. Байтурсынова, 123
Срок получения: до 15 февраля 2026

Для получения при себе иметь удостоверение личности.

С уважением,
Портал электронного правительства`,
        date: '3 дня',
        isPhishing: false,
        redFlags: [],
        isStarred: true,
        isRead: true,
        hasAttachment: false
    },
    {
        id: 'email7',
        from: { name: 'Halyk Bank', email: 'info@halyk-promo.kz' },
        subject: '🎁 Вы выиграли 500 000 ₸!',
        preview: 'Поздравляем! Вы стали победителем нашей лотереи...',
        body: `ПОЗДРАВЛЯЕМ!!! 🎉🎉🎉

Вы стали победителем лотереи Halyk Bank и выиграли 500 000 ₸!!!

Для получения приза переведите 5 000 ₸ на комиссию обработки:

Карта: 4400 **** **** 8932
Имя: Жанар А.

После перевода комиссии приз поступит на ваш счёт в течение часа!

Торопитесь! Акция действует только сегодня!

Halyk Bank`,
        date: 'Сегодня',
        isPhishing: true,
        redFlags: [
            { id: 'rf1', element: 'halyk-promo.kz', explanation: 'Официальный домен — halykbank.kz', type: 'domain' },
            { id: 'rf2', element: 'Требование перевести деньги', explanation: 'За призы не нужно платить комиссию!', type: 'request' },
            { id: 'rf3', element: 'Множество восклицательных знаков', explanation: 'Признак непрофессионального письма', type: 'grammar' },
            { id: 'rf4', element: '"только сегодня"', explanation: 'Искусственная срочность для давления', type: 'urgency' },
            { id: 'rf5', element: 'Реквизиты физлица', explanation: 'Банк не просит переводить на личные карты', type: 'request' }
        ],
        isStarred: false,
        isRead: false,
        hasAttachment: false
    },
    {
        id: 'email8',
        from: { name: 'Netflix', email: 'billing@netfiix-support.com' },
        subject: 'Не удалось обработать платёж',
        preview: 'Ваша подписка будет приостановлена...',
        body: `Здравствуйте,

Нам не удалось списать ежемесячный платёж с вашей карты.

Ваша подписка будет приостановлена через 24 часа, если вы не обновите платёжную информацию.

Обновить платёжные данные:
https://netfiix-billing.com/update-payment

Если у вас есть вопросы, свяжитесь с нами.

Netflix Support Team`,
        date: 'Сегодня',
        isPhishing: true,
        redFlags: [
            { id: 'rf1', element: 'netfiix-support.com (две i)', explanation: 'Опечатка в домене — netfiix вместо netflix', type: 'domain' },
            { id: 'rf2', element: 'netfiix-billing.com', explanation: 'Netflix использует только netflix.com', type: 'link' },
            { id: 'rf3', element: '"через 24 часа"', explanation: 'Давление временем — признак фишинга', type: 'urgency' }
        ],
        isStarred: false,
        isRead: false,
        hasAttachment: false
    }
];

// Email List Item Component
const EmailListItem: React.FC<{
    email: EmailMessage;
    isSelected: boolean;
    onClick: () => void;
}> = ({ email, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full p-4 border-b border-border text-left transition-all hover:bg-muted/50 ${isSelected ? 'bg-cyber-green/10 border-l-4 border-l-cyber-green' : ''
                } ${!email.isRead ? 'bg-card' : 'bg-muted/30'}`}
        >
            <div className="flex items-start gap-3">
                {/* Sender avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${email.isPhishing ? 'bg-red-900/30' : 'bg-cyan-900/30'
                    }`}>
                    <User className={`w-5 h-5 ${email.isPhishing ? 'text-red-400' : 'text-cyan-400'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`font-medium truncate ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {email.from.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                            {email.date}
                        </span>
                    </div>
                    <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                        {email.preview}
                    </p>
                </div>

                {/* Indicators */}
                <div className="flex flex-col items-center gap-1">
                    {email.isStarred && <Star className="w-4 h-4 text-cyber-yellow fill-cyber-yellow" />}
                    {email.hasAttachment && <Paperclip className="w-4 h-4 text-muted-foreground" />}
                    {!email.isRead && <div className="w-2 h-2 rounded-full bg-cyber-green" />}
                </div>
            </div>
        </button>
    );
};

// Email Viewer Component
const EmailViewer: React.FC<{
    email: EmailMessage;
    foundFlags: string[];
    onFlagFind: (flagId: string) => void;
    onVerdict: (verdict: 'phishing' | 'legitimate') => void;
    onBack: () => void;
}> = ({ email, foundFlags, onFlagFind, onVerdict, onBack }) => {
    const [showHints, setShowHints] = useState(false);

    // Highlight suspicious elements in email body
    const renderEmailBody = () => {
        let body = email.body;

        // Simple highlighting for demonstration
        email.redFlags.forEach(flag => {
            if (flag.type === 'link' && body.includes('http')) {
                // Links are already visible
            }
        });

        return body;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Email header */}
            <div className="p-4 border-b border-border">
                <button
                    onClick={onBack}
                    className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1"
                >
                    ← Назад к списку
                </button>

                <h2 className="text-xl font-bold text-foreground mb-2">
                    {email.subject}
                </h2>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${email.isPhishing ? 'bg-red-900/30' : 'bg-cyan-900/30'
                            }`}>
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{email.from.name}</p>
                            <p className="text-sm text-muted-foreground">{email.from.email}</p>
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{email.date}</span>
                </div>
            </div>

            {/* Email body */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="p-4 bg-muted/30 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-foreground text-sm">
                        {renderEmailBody()}
                    </pre>
                </div>

                {/* Red flags section */}
                {email.redFlags.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowHints(!showHints)}
                            className="flex items-center gap-2 text-sm text-cyber-yellow hover:text-cyber-yellow/80"
                        >
                            <Eye className="w-4 h-4" />
                            {showHints ? 'Скрыть подсказки' : `Показать подсказки (${email.redFlags.length})`}
                        </button>

                        {showHints && (
                            <div className="mt-3 space-y-2">
                                {email.redFlags.map(flag => (
                                    <button
                                        key={flag.id}
                                        onClick={() => onFlagFind(flag.id)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${foundFlags.includes(flag.id)
                                            ? 'bg-cyber-red/20 border border-cyber-red'
                                            : 'bg-muted/50 border border-transparent hover:border-muted-foreground'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${foundFlags.includes(flag.id) ? 'text-cyber-red' : 'text-muted-foreground'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{flag.element}</p>
                                                {foundFlags.includes(flag.id) && (
                                                    <p className="text-xs text-muted-foreground mt-1">{flag.explanation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Verdict buttons */}
            <div className="p-4 border-t border-border">
                <p className="text-sm text-center text-muted-foreground mb-3">
                    Это письмо настоящее или фишинг?
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onVerdict('phishing')}
                        className="py-3 rounded-xl bg-cyber-red/20 border border-cyber-red text-cyber-red font-bold hover:bg-cyber-red/30 transition-all flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Фишинг
                    </button>
                    <button
                        onClick={() => onVerdict('legitimate')}
                        className="py-3 rounded-xl bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold hover:bg-cyber-green/30 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Настоящее
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Email Simulator Page
export const EmailSimulatorPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [gameState, setGameState] = useState<GameState>({
        status: 'menu',
        selectedEmail: null,
        foundFlags: [],
        verdict: null,
        score: 0,
        emailsProcessed: 0,
        correctVerdicts: 0,
        streak: 0
    });

    const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS);

    // Select email
    const selectEmail = (email: EmailMessage) => {
        setGameState(prev => ({
            ...prev,
            status: 'reading',
            selectedEmail: email,
            foundFlags: [],
            verdict: null
        }));

        // Mark as read
        setEmails(prev => prev.map(e =>
            e.id === email.id ? { ...e, isRead: true } : e
        ));
    };

    // Find flag
    const findFlag = (flagId: string) => {
        if (!gameState.foundFlags.includes(flagId)) {
            setGameState(prev => ({
                ...prev,
                foundFlags: [...prev.foundFlags, flagId],
                score: prev.score + 5
            }));
        }
    };

    // Submit verdict
    const submitVerdict = (verdict: 'phishing' | 'legitimate') => {
        const isCorrect = gameState.selectedEmail &&
            ((verdict === 'phishing') === gameState.selectedEmail.isPhishing);

        setGameState(prev => ({
            ...prev,
            status: 'verdict',
            verdict,
            score: prev.score + (isCorrect ? 20 : 0),
            emailsProcessed: prev.emailsProcessed + 1,
            correctVerdicts: prev.correctVerdicts + (isCorrect ? 1 : 0),
            streak: isCorrect ? prev.streak + 1 : 0
        }));
    };

    // Check verdict
    const isVerdictCorrect = () => {
        if (!gameState.selectedEmail || !gameState.verdict) return false;
        return (gameState.verdict === 'phishing') === gameState.selectedEmail.isPhishing;
    };

    // Back to inbox
    const backToInbox = () => {
        setGameState(prev => ({
            ...prev,
            status: 'inbox',
            selectedEmail: null,
            foundFlags: [],
            verdict: null
        }));
    };

    // Start game
    const startGame = () => {
        setGameState(prev => ({
            ...prev,
            status: 'inbox'
        }));
    };

    // Feature Gate check
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<Mail className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                {/* Menu Screen */}
                {gameState.status === 'menu' && (
                    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full text-cyber-green text-sm font-medium mb-4">
                                <Mail className="w-4 h-4" />
                                {t('emailSim.badge', 'Симулятор Email')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                📧 {t('emailSim.title', 'Email Детектор')}
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                {t('emailSim.subtitle', 'Научитесь отличать фишинговые письма от настоящих')}
                            </p>
                        </div>

                        {/* Stats */}
                        {gameState.emailsProcessed > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-card rounded-xl border border-border text-center">
                                    <p className="text-2xl font-bold text-cyber-green">{gameState.emailsProcessed}</p>
                                    <p className="text-sm text-muted-foreground">Проверено писем</p>
                                </div>
                                <div className="p-4 bg-card rounded-xl border border-border text-center">
                                    <p className="text-2xl font-bold text-cyber-yellow">{gameState.score}</p>
                                    <p className="text-sm text-muted-foreground">Очки</p>
                                </div>
                                <div className="p-4 bg-card rounded-xl border border-border text-center">
                                    <p className="text-2xl font-bold text-cyan-400">
                                        {gameState.emailsProcessed > 0
                                            ? Math.round((gameState.correctVerdicts / gameState.emailsProcessed) * 100)
                                            : 0}%
                                    </p>
                                    <p className="text-sm text-muted-foreground">Точность</p>
                                </div>
                            </div>
                        )}

                        {/* Start button */}
                        <button
                            onClick={startGame}
                            className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyber-green to-cyan-500 text-black font-bold text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                            <Inbox className="w-8 h-8" />
                            {t('emailSim.openInbox', 'Открыть почту')}
                        </button>

                        {/* How it works */}
                        <div className="cyber-card">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-cyber-green" />
                                Как это работает
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto mb-3">
                                        <Inbox className="w-6 h-6 text-cyber-green" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">1. Откройте письмо</h3>
                                    <p className="text-sm text-muted-foreground">Прочитайте содержимое</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-cyber-yellow/20 flex items-center justify-center mx-auto mb-3">
                                        <Eye className="w-6 h-6 text-cyber-yellow" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">2. Найдите улики</h3>
                                    <p className="text-sm text-muted-foreground">Подозрительные элементы</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">3. Вынесите вердикт</h3>
                                    <p className="text-sm text-muted-foreground">Фишинг или настоящее?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inbox Screen */}
                {gameState.status === 'inbox' && (
                    <div className="h-screen flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-card">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Inbox className="w-5 h-5 text-cyber-green" />
                                    Входящие ({emails.filter(e => !e.isRead).length})
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-cyber-yellow" />
                                    <span className="font-bold text-cyber-yellow">{gameState.score}</span>
                                </div>
                            </div>
                        </div>

                        {/* Email list */}
                        <div className="flex-1 overflow-y-auto">
                            {emails.map(email => (
                                <EmailListItem
                                    key={email.id}
                                    email={email}
                                    isSelected={gameState.selectedEmail?.id === email.id}
                                    onClick={() => selectEmail(email)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reading Screen */}
                {gameState.status === 'reading' && gameState.selectedEmail && (
                    <div className="h-screen">
                        <EmailViewer
                            email={gameState.selectedEmail}
                            foundFlags={gameState.foundFlags}
                            onFlagFind={findFlag}
                            onVerdict={submitVerdict}
                            onBack={backToInbox}
                        />
                    </div>
                )}

                {/* Verdict Screen */}
                {gameState.status === 'verdict' && gameState.selectedEmail && (
                    <div className="max-w-lg mx-auto p-4 md:p-8 text-center space-y-8">
                        {/* Result icon */}
                        <div className={`text-8xl ${isVerdictCorrect() ? 'animate-bounce-slow' : ''}`}>
                            {isVerdictCorrect() ? '✅' : '❌'}
                        </div>

                        {/* Result text */}
                        <div>
                            <h2 className={`text-3xl font-bold ${isVerdictCorrect() ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                {isVerdictCorrect() ? 'Верно!' : 'Неверно!'}
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Это письмо было {gameState.selectedEmail.isPhishing ? 'фишингом' : 'настоящим'}
                            </p>
                        </div>

                        {/* Red flags found */}
                        {gameState.selectedEmail.redFlags.length > 0 && (
                            <div className="cyber-card text-left">
                                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-cyber-red" />
                                    Красные флаги в этом письме
                                </h3>
                                <ul className="space-y-2">
                                    {gameState.selectedEmail.redFlags.map(flag => (
                                        <li key={flag.id} className="flex items-start gap-2 text-sm">
                                            <XCircle className="w-4 h-4 text-cyber-red mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-foreground">{flag.element}</p>
                                                <p className="text-muted-foreground">{flag.explanation}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* XP earned */}
                        <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30">
                            <div className="flex items-center justify-center gap-2">
                                <Award className="w-6 h-6 text-cyber-green" />
                                <span className="text-xl font-bold text-cyber-green">
                                    +{gameState.foundFlags.length * 5 + (isVerdictCorrect() ? 20 : 0)} XP
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={backToInbox}
                            className="w-full py-4 rounded-xl bg-cyber-green text-black font-bold text-lg hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronRight className="w-5 h-5" />
                            Следующее письмо
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmailSimulatorPage;
