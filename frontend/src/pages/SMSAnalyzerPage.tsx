import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    MessageSquare, AlertTriangle, Shield, ShieldCheck, ShieldX,
    Search, Clipboard, Trash2, Clock, Zap, CheckCircle,
    Info, AlertCircle, RotateCcw
} from 'lucide-react';

// Types
interface AnalysisResult {
    riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    riskScore: number; // 0-100
    threats: ThreatIndicator[];
    recommendations: string[];
    summary: string;
}

interface ThreatIndicator {
    type: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
    found: string;
}

// Common scam patterns for Kazakhstan
const SCAM_PATTERNS = {
    urgencyWords: [
        'срочно', 'немедленно', 'сейчас', 'быстро', 'экстренно', 'важно',
        'последний шанс', 'только сегодня', 'истекает', 'заблокирован',
        'шұғыл', 'тезірек', 'urgent', 'immediately', 'now'
    ],
    bankKeywords: [
        'банк', 'карта', 'счёт', 'kaspi', 'halyk', 'forte', 'jusan',
        'перевод', 'блокировка', 'подтверждение', 'cvv', 'пин-код',
        'pin', 'код из смс', 'sms код', 'одноразовый пароль'
    ],
    prizeScam: [
        'выигра', 'приз', 'победитель', 'лотерея', 'розыгрыш', 'подарок',
        'бесплатно', 'акция', 'бонус', 'миллион', 'тенге', 'доллар'
    ],
    threatWords: [
        'заблокирован', 'арест', 'штраф', 'суд', 'полиция', 'долг',
        'задолженность', 'блокировка', 'претензия', 'иск'
    ],
    suspiciousLinks: [
        'bit.ly', 'tinyurl', 'goo.gl', 't.co', 'rb.gy', 'cutt.ly',
        '.xyz', '.top', '.work', '.click', '.loan'
    ],
    dataRequests: [
        'введите', 'отправьте', 'сообщите', 'перешлите', 'подтвердите',
        'укажите', 'напишите', 'ответьте', 'перезвоните'
    ],
    fakeNumbers: [
        '+7 777', '+7 700', '+7 747', '8 777', '8 700'
    ]
};

// SMS Analyzer Logic
const analyzeSMS = (text: string): AnalysisResult => {
    const threats: ThreatIndicator[] = [];
    let riskScore = 0;
    const lowerText = text.toLowerCase();

    // Check for urgency words
    const urgencyMatches = SCAM_PATTERNS.urgencyWords.filter(word =>
        lowerText.includes(word.toLowerCase())
    );
    if (urgencyMatches.length > 0) {
        threats.push({
            type: 'urgency',
            description: 'Давление срочностью - классический признак мошенничества',
            severity: urgencyMatches.length > 2 ? 'danger' : 'warning',
            found: urgencyMatches.join(', ')
        });
        riskScore += urgencyMatches.length * 10;
    }

    // Check for bank-related scams
    const bankMatches = SCAM_PATTERNS.bankKeywords.filter(word =>
        lowerText.includes(word.toLowerCase())
    );
    if (bankMatches.length > 0) {
        threats.push({
            type: 'banking',
            description: 'Упоминание банковских данных - возможна попытка фишинга',
            severity: bankMatches.length > 2 ? 'danger' : 'warning',
            found: bankMatches.join(', ')
        });
        riskScore += bankMatches.length * 15;
    }

    // Check for prize/gift scams
    const prizeMatches = SCAM_PATTERNS.prizeScam.filter(word =>
        lowerText.includes(word.toLowerCase())
    );
    if (prizeMatches.length > 0) {
        threats.push({
            type: 'prize',
            description: 'Обещание выигрыша/приза - частая схема мошенничества',
            severity: prizeMatches.length > 2 ? 'danger' : 'warning',
            found: prizeMatches.join(', ')
        });
        riskScore += prizeMatches.length * 12;
    }

    // Check for threatening language
    const threatMatches = SCAM_PATTERNS.threatWords.filter(word =>
        lowerText.includes(word.toLowerCase())
    );
    if (threatMatches.length > 0) {
        threats.push({
            type: 'threat',
            description: 'Угрозы и запугивание - тактика мошенников',
            severity: 'danger',
            found: threatMatches.join(', ')
        });
        riskScore += threatMatches.length * 15;
    }

    // Check for suspicious links
    const linkMatches = SCAM_PATTERNS.suspiciousLinks.filter(domain =>
        lowerText.includes(domain.toLowerCase())
    );
    if (linkMatches.length > 0) {
        threats.push({
            type: 'links',
            description: 'Подозрительные ссылки - могут вести на фишинговые сайты',
            severity: 'danger',
            found: linkMatches.join(', ')
        });
        riskScore += 25;
    }

    // Check for URL pattern
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlRegex);
    if (urls && urls.length > 0) {
        threats.push({
            type: 'url',
            description: 'Содержит ссылку - будьте осторожны при переходе',
            severity: 'warning',
            found: urls.join(', ')
        });
        riskScore += 10;
    }

    // Check for data requests
    const dataMatches = SCAM_PATTERNS.dataRequests.filter(word =>
        lowerText.includes(word.toLowerCase())
    );
    if (dataMatches.length > 0 && (bankMatches.length > 0 || threats.length > 0)) {
        threats.push({
            type: 'data_request',
            description: 'Запрос личных данных - никогда не передавайте данные по SMS',
            severity: 'danger',
            found: dataMatches.join(', ')
        });
        riskScore += 20;
    }

    // Check for phone number requests
    const phoneRegex = /(\+?7|8)[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
        threats.push({
            type: 'phone',
            description: 'Номер телефона для перезвона - может быть платным или мошенническим',
            severity: 'info',
            found: phones.join(', ')
        });
        riskScore += 5;
    }

    // Calculate final risk level
    riskScore = Math.min(riskScore, 100);

    let riskLevel: AnalysisResult['riskLevel'];
    let summary: string;

    if (riskScore >= 70) {
        riskLevel = 'critical';
        summary = 'Высокая вероятность мошенничества! Не отвечайте и не переходите по ссылкам.';
    } else if (riskScore >= 50) {
        riskLevel = 'high';
        summary = 'Сообщение содержит признаки мошенничества. Будьте очень осторожны.';
    } else if (riskScore >= 30) {
        riskLevel = 'medium';
        summary = 'Обнаружены подозрительные элементы. Проверьте отправителя.';
    } else if (riskScore >= 10) {
        riskLevel = 'low';
        summary = 'Незначительные признаки риска. Сообщение вероятно безопасно.';
    } else {
        riskLevel = 'safe';
        summary = 'Сообщение выглядит безопасным. Признаков мошенничества не обнаружено.';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (threats.some(t => t.type === 'banking')) {
        recommendations.push('Никогда не сообщайте CVV, PIN-код или SMS-код');
        recommendations.push('Позвоните в банк по официальному номеру для проверки');
    }
    if (threats.some(t => t.type === 'links' || t.type === 'url')) {
        recommendations.push('Не переходите по ссылкам из SMS');
        recommendations.push('Проверьте домен сайта перед вводом данных');
    }
    if (threats.some(t => t.type === 'prize')) {
        recommendations.push('Настоящие розыгрыши не требуют оплаты для получения приза');
    }
    if (threats.some(t => t.type === 'urgency' || t.type === 'threat')) {
        recommendations.push('Не принимайте решений под давлением');
        recommendations.push('Возьмите паузу и проверьте информацию');
    }
    if (recommendations.length === 0 && riskLevel === 'safe') {
        recommendations.push('Продолжайте быть бдительными');
    }

    return {
        riskLevel,
        riskScore,
        threats,
        recommendations,
        summary
    };
};

// Risk Level Badge Component
const RiskBadge: React.FC<{ level: AnalysisResult['riskLevel'] }> = ({ level }) => {
    const config = {
        safe: { color: 'cyber-green', text: 'Безопасно', icon: ShieldCheck },
        low: { color: 'cyber-blue', text: 'Низкий риск', icon: Shield },
        medium: { color: 'cyber-yellow', text: 'Средний риск', icon: AlertCircle },
        high: { color: 'orange-400', text: 'Высокий риск', icon: AlertTriangle },
        critical: { color: 'cyber-red', text: 'Критический!', icon: ShieldX },
    };

    const { color, text, icon: Icon } = config[level];

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${color}/10 border border-${color}/30`}>
            <Icon className={`w-5 h-5 text-${color}`} />
            <span className={`font-bold text-${color}`}>{text}</span>
        </div>
    );
};

// Threat Card Component
const ThreatCard: React.FC<{ threat: ThreatIndicator }> = ({ threat }) => {
    const severityConfig = {
        info: { color: 'cyber-blue', icon: Info },
        warning: { color: 'cyber-yellow', icon: AlertCircle },
        danger: { color: 'cyber-red', icon: AlertTriangle },
    };

    const { color, icon: Icon } = severityConfig[threat.severity];

    return (
        <div className={`p-4 rounded-xl border border-${color}/30 bg-${color}/5`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">{threat.description}</p>
                    <p className={`text-sm text-${color}`}>
                        Найдено: <span className="font-mono">{threat.found}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Example SMS Messages
const EXAMPLE_MESSAGES = [
    {
        label: 'Банковское мошенничество',
        text: 'Ваша карта Kaspi заблокирована! Срочно перейдите по ссылке bit.ly/kaspi-unlock для разблокировки. Введите данные карты и код из SMS.',
    },
    {
        label: 'Фальшивый выигрыш',
        text: 'Поздравляем! Вы выиграли 500 000 тенге в розыгрыше! Для получения приза отправьте 5000 тенге на карту и перезвоните: +7 777 123 45 67',
    },
    {
        label: 'Угрозы',
        text: 'У вас обнаружена задолженность 150 000 тенге. Если не оплатите сегодня, будет возбуждено уголовное дело. Срочно свяжитесь: 8 700 555 12 34',
    },
    {
        label: 'Безопасное сообщение',
        text: 'Ваш заказ #12345 доставлен в пункт выдачи по адресу: ул. Абая 150. Ожидаем вас до 20:00.',
    },
];

// Main SMS Analyzer Page
export const SMSAnalyzerPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Feature Gate: PRO or higher
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<MessageSquare className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    const [smsText, setSmsText] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [history, setHistory] = useState<{ text: string; result: AnalysisResult }[]>([]);

    const handleAnalyze = async () => {
        if (!smsText.trim()) return;

        setIsAnalyzing(true);

        // Simulate analysis delay for better UX
        await new Promise(r => setTimeout(r, 800));

        const analysisResult = analyzeSMS(smsText);
        setResult(analysisResult);

        // Add to history
        setHistory(prev => [{ text: smsText, result: analysisResult }, ...prev.slice(0, 9)]);

        setIsAnalyzing(false);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setSmsText(text);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    const handleClear = () => {
        setSmsText('');
        setResult(null);
    };

    const handleExample = (text: string) => {
        setSmsText(text);
        setResult(null);
    };

    const riskColor = useMemo(() => {
        if (!result) return 'muted';
        const colors = {
            safe: 'cyber-green',
            low: 'cyber-blue',
            medium: 'cyber-yellow',
            high: 'orange-400',
            critical: 'cyber-red',
        };
        return colors[result.riskLevel];
    }, [result]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 md:p-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full text-cyan-400 text-sm font-medium mb-4">
                            <MessageSquare className="w-4 h-4" />
                            {t('smsAnalyzer.badge', 'Анализ SMS')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {t('smsAnalyzer.title', 'Проверка SMS на мошенничество')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('smsAnalyzer.subtitle', 'Вставьте подозрительное сообщение для анализа')}
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="cyber-card mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-cyan-400" />
                                {t('smsAnalyzer.inputTitle', 'Текст сообщения')}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePaste}
                                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                    title={t('smsAnalyzer.paste', 'Вставить')}
                                >
                                    <Clipboard className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                    title={t('smsAnalyzer.clear', 'Очистить')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            placeholder={t('smsAnalyzer.placeholder', 'Вставьте сюда текст SMS-сообщения для проверки...')}
                            className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-foreground placeholder:text-muted-foreground"
                        />

                        <button
                            onClick={handleAnalyze}
                            disabled={!smsText.trim() || isAnalyzing}
                            className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('smsAnalyzer.analyzing', 'Анализируем...')}
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    {t('smsAnalyzer.analyze', 'Проверить сообщение')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Examples */}
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('smsAnalyzer.examples', 'Примеры для тестирования:')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_MESSAGES.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExample(example.text)}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {example.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Risk Score Card */}
                            <div className={`cyber-card border-2 border-${riskColor}/30 bg-gradient-to-br from-${riskColor}/5 to-transparent`}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div>
                                        <RiskBadge level={result.riskLevel} />
                                        <p className="mt-3 text-lg text-foreground">{result.summary}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-5xl font-bold text-${riskColor}`}>
                                            {result.riskScore}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('smsAnalyzer.riskScore', 'Уровень угрозы')}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${result.riskScore >= 70 ? 'from-red-500 to-orange-500' :
                                            result.riskScore >= 50 ? 'from-orange-500 to-yellow-500' :
                                                result.riskScore >= 30 ? 'from-yellow-500 to-green-500' :
                                                    'from-green-500 to-cyan-500'
                                            } rounded-full transition-all duration-500`}
                                        style={{ width: `${result.riskScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Threats Found */}
                            {result.threats.length > 0 && (
                                <div className="cyber-card">
                                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-cyber-yellow" />
                                        {t('smsAnalyzer.threatsFound', 'Обнаруженные угрозы')} ({result.threats.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {result.threats.map((threat, index) => (
                                            <ThreatCard key={index} threat={threat} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {result.recommendations.length > 0 && (
                                <div className="cyber-card border-cyber-green/30 bg-cyber-green/5">
                                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-cyber-green" />
                                        {t('smsAnalyzer.recommendations', 'Рекомендации')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2 text-foreground">
                                                <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0 mt-1" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t('smsAnalyzer.checkAnother', 'Проверить другое')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {history.length > 0 && !result && (
                        <div className="cyber-card">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                {t('smsAnalyzer.history', 'История проверок')}
                            </h3>
                            <div className="space-y-3">
                                {history.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSmsText(item.text);
                                            setResult(item.result);
                                        }}
                                        className="w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <RiskBadge level={item.result.riskLevel} />
                                            <span className="text-sm text-muted-foreground">
                                                {item.result.riskScore}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.text}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Educational Info */}
                    <div className="mt-8 cyber-card border-purple-500/30 bg-purple-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {t('smsAnalyzer.tips.title', 'Как распознать мошенничество')}
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('smsAnalyzer.tips.tip1', 'Банки никогда не просят CVV или PIN-код по SMS')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('smsAnalyzer.tips.tip2', 'Не переходите по подозрительным ссылкам')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('smsAnalyzer.tips.tip3', 'Настоящие выигрыши не требуют предоплаты')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('smsAnalyzer.tips.tip4', 'При сомнениях позвоните в организацию напрямую')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default SMSAnalyzerPage;
