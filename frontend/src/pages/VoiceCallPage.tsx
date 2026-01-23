import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { ScenarioContextModal } from '../components/ScenarioContextModal';
import { useAuth } from '../contexts/AuthContext';
import { ttsService } from '../services/ttsService';
import { playSound } from '../services/soundService';
import {
    Mic, Phone, PhoneOff, PhoneIncoming,
    User, Building2, BadgeAlert, Stethoscope, Truck,
    CheckCircle, XCircle, Volume2, VolumeX,
    RotateCcw, ChevronRight, AlertTriangle, Shield,
    Loader2, Play, Headphones
} from 'lucide-react';

// Types
interface VoiceScenario {
    id: string;
    title: string;
    caller: string;
    callerRole: string;
    callerIcon: React.ElementType;
    isScam: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    dialogues: string[];
    redFlags?: string[];      // For scam scenarios
    legitimacySigns?: string[]; // For real scenarios
    explanation: string;
}

type CallPhase = 'idle' | 'context' | 'ringing' | 'active' | 'verdict' | 'result';

interface CallState {
    phase: CallPhase;
    scenario: VoiceScenario | null;
    currentDialogueIndex: number;
    isSpeaking: boolean;
    userVerdict: 'scam' | 'real' | null;
    startTime: number | null;
}

// Voice Call Scenarios (50% scam, 50% legitimate)
const VOICE_SCENARIOS: VoiceScenario[] = [
    // === SCAM SCENARIOS ===
    {
        id: 'scam_bank_security',
        title: 'Служба безопасности банка',
        caller: 'Служба безопасности Kaspi',
        callerRole: 'Сотрудник банка',
        callerIcon: Building2,
        isScam: true,
        difficulty: 'easy',
        dialogues: [
            'Здравствуйте! Вас беспокоит служба безопасности Kaspi Bank.',
            'Мы зафиксировали подозрительную попытку списания с вашей карты на сумму 150 000 тенге.',
            'Для отмены этой транзакции мне нужны данные вашей карты и код из SMS.',
            'Пожалуйста, действуйте быстро, иначе деньги будут списаны!'
        ],
        redFlags: [
            'Запрашивает данные карты по телефону',
            'Создаёт искусственную срочность',
            'Просит код из SMS'
        ],
        explanation: 'Это был мошенник! Банк НИКОГДА не запрашивает полные данные карты, CVV или SMS-коды по телефону. При любых сомнениях положите трубку и позвоните в банк по номеру на карте.'
    },
    {
        id: 'scam_police',
        title: 'Звонок от "полиции"',
        caller: 'Капитан Ермеков',
        callerRole: 'Сотрудник полиции',
        callerIcon: BadgeAlert,
        isScam: true,
        difficulty: 'medium',
        dialogues: [
            'Гражданин, это капитан Ермеков, отдел по борьбе с мошенничеством.',
            'На вас поступило заявление о мошенничестве. Возбуждено уголовное дело.',
            'Вам грозит до 7 лет лишения свободы.',
            'Но это можно решить. Внесите залог 200 000 тенге на специальный счёт, и дело будет закрыто.'
        ],
        redFlags: [
            'Требует деньги за "закрытие дела"',
            'Запугивает уголовным преследованием',
            'Решает вопросы по телефону'
        ],
        explanation: 'Это был мошенник! Полиция НЕ решает вопросы по телефону и НИКОГДА не требует денег для закрытия дела. Официальные органы вызывают повесткой.'
    },
    {
        id: 'scam_relative',
        title: 'Родственник в беде',
        caller: 'Неизвестный',
        callerRole: 'Голос похож на родственника',
        callerIcon: User,
        isScam: true,
        difficulty: 'hard',
        dialogues: [
            'Алло... это я... Мне очень плохо...',
            'Я попал в аварию... Полиция требует деньги чтобы не возбуждать дело...',
            'Пожалуйста, помоги... Нужно 300 000 тенге срочно...',
            'Только маме не говори, она переживать будет...'
        ],
        redFlags: [
            'Просит не рассказывать другим родственникам',
            'Требует деньги срочно',
            'Голос приглушённый и неясный'
        ],
        explanation: 'Это был мошенник! Они меняют голос, чтобы казаться знакомым. Всегда перезванивайте родственнику на известный вам номер для проверки!'
    },

    // === LEGITIMATE SCENARIOS ===
    {
        id: 'real_delivery',
        title: 'Подтверждение доставки',
        caller: 'Kaspi Delivery',
        callerRole: 'Курьер',
        callerIcon: Truck,
        isScam: false,
        difficulty: 'easy',
        dialogues: [
            'Здравствуйте! Это курьер Kaspi Delivery.',
            'У меня для вас заказ номер 7845. Телефон, который вы заказывали вчера.',
            'Я буду у вашего адреса через 20 минут.',
            'Вам удобно сейчас принять заказ? Оплата была онлайн, подпись не нужна.'
        ],
        legitimacySigns: [
            'Знает детали вашего заказа',
            'Не просит никаких данных',
            'Просто уточняет время доставки'
        ],
        explanation: 'Это был настоящий курьер! Легитимные звонки не требуют ваших личных данных, только уточняют детали доставки. Курьер знал номер заказа и что вы заказывали.'
    },
    {
        id: 'real_clinic',
        title: 'Запись к врачу',
        caller: 'Клиника "Здоровье"',
        callerRole: 'Администратор',
        callerIcon: Stethoscope,
        isScam: false,
        difficulty: 'medium',
        dialogues: [
            'Здравствуйте! Это клиника "Здоровье", вы записывались к терапевту.',
            'К сожалению, ваш врач заболел. Мы можем перенести ваш приём на завтра к другому специалисту.',
            'Доктор Айгуль Серикова, приём в 15:00. Вам подходит?',
            'Отлично, я отправлю вам SMS с подтверждением. Ждём вас завтра!'
        ],
        legitimacySigns: [
            'Знает о вашей записи',
            'Не просит данные карты',
            'Предлагает альтернативу, не требует денег'
        ],
        explanation: 'Это был настоящий звонок из клиники! Они знали о вашей записи и просто предложили перенести приём. Никаких запросов личных данных или денег.'
    },
    {
        id: 'real_bank_confirm',
        title: 'Подтверждение операции банком',
        caller: 'Kaspi Bank',
        callerRole: 'Робот-автоинформатор',
        callerIcon: Building2,
        isScam: false,
        difficulty: 'hard',
        dialogues: [
            'Здравствуйте! Это автоматическое уведомление Kaspi Bank.',
            'Вы только что совершили покупку на сумму 45 000 тенге в магазине Технодом.',
            'Если это были вы, нажмите 1. Если вы не совершали эту операцию, нажмите 2 для блокировки карты.',
            'Спасибо за использование Kaspi Bank. Хорошего дня!'
        ],
        legitimacySigns: [
            'Информирует, а не требует данные',
            'Робот-автоинформатор, не живой человек',
            'Не просит код из SMS или данные карты',
            'Соответствует вашей реальной покупке'
        ],
        explanation: 'Это был настоящий звонок от банка! Автоинформаторы только уведомляют о транзакциях. Они НИКОГДА не просят данные карты или SMS-коды - только предлагают подтвердить или заблокировать.'
    }
];

// Helper functions
const getRandomScenario = (): VoiceScenario => {
    return VOICE_SCENARIOS[Math.floor(Math.random() * VOICE_SCENARIOS.length)];
};

// Ringing Animation Component
const RingingScreen: React.FC<{
    caller: string;
    onAnswer: () => void;
    onDecline: () => void;
}> = ({ caller, onAnswer, onDecline }) => {
    const { t } = useTranslation();
    const [ringCount, setRingCount] = useState(0);

    useEffect(() => {
        // Play ringtone
        playSound('call');
        const interval = setInterval(() => {
            setRingCount(prev => prev + 1);
            playSound('call');
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
            <div className="text-center">
                {/* Pulsing phone icon */}
                <div className="relative mb-8">
                    <div className={`w-32 h-32 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto ${ringCount % 2 === 0 ? 'scale-100' : 'scale-110'} transition-transform duration-300`}>
                        <div className={`w-24 h-24 rounded-full bg-cyber-green/30 flex items-center justify-center ${ringCount % 2 === 0 ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                            <PhoneIncoming className="w-12 h-12 text-cyber-green animate-pulse" />
                        </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-cyber-green/50 animate-ping" />
                </div>

                <p className="text-white text-2xl font-bold mb-2">
                    {t('voiceCall.incomingCall', 'Входящий звонок')}
                </p>
                <p className="text-cyber-green text-xl mb-8">{caller}</p>

                <div className="flex gap-8 justify-center">
                    <button
                        onClick={onDecline}
                        className="w-16 h-16 rounded-full bg-cyber-red flex items-center justify-center hover:bg-cyber-red/80 transition-all hover:scale-110"
                    >
                        <PhoneOff className="w-8 h-8 text-white" />
                    </button>
                    <button
                        onClick={onAnswer}
                        className="w-16 h-16 rounded-full bg-cyber-green flex items-center justify-center hover:bg-cyber-green/80 transition-all hover:scale-110 animate-bounce"
                    >
                        <Phone className="w-8 h-8 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Active Call Screen with TTS
const ActiveCallScreen: React.FC<{
    scenario: VoiceScenario;
    currentDialogueIndex: number;
    isSpeaking: boolean;
    onHangUp: () => void;
}> = ({ scenario, currentDialogueIndex, isSpeaking, onHangUp }) => {
    const { t } = useTranslation();
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            ttsService.stop();
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col z-50">
            {/* Call Header */}
            <div className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyber-green/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-cyber-green/30">
                    <scenario.callerIcon className="w-12 h-12 text-cyber-green" />
                </div>
                <h2 className="text-white text-2xl font-bold">{scenario.caller}</h2>
                <p className="text-gray-400">{scenario.callerRole}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                    <span className="text-cyber-green font-mono">{formatDuration(callDuration)}</span>
                </div>
            </div>

            {/* Dialogue Display */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    {isSpeaking ? (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-cyber-green rounded-full animate-pulse"
                                        style={{
                                            height: `${20 + Math.random() * 30}px`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-white text-lg leading-relaxed">
                                {scenario.dialogues[currentDialogueIndex]}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {t('voiceCall.listening', 'Говорит собеседник...')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto" />
                            <p className="text-gray-400">
                                {t('voiceCall.waitingForResponse', 'Ожидание...')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 mb-4">
                <div className="flex justify-center gap-2">
                    {scenario.dialogues.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i <= currentDialogueIndex ? 'bg-cyber-green' : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Call Controls */}
            <div className="p-6 border-t border-gray-800">
                <div className="flex justify-center gap-6">
                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-cyber-red text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={onHangUp}
                        className="w-16 h-16 rounded-full bg-cyber-red text-white flex items-center justify-center hover:bg-cyber-red/80 transition-all hover:scale-105"
                    >
                        <PhoneOff className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Verdict Screen
const VerdictScreen: React.FC<{
    scenario: VoiceScenario;
    onVerdict: (verdict: 'scam' | 'real') => void;
}> = ({ scenario, onVerdict }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
            <div className="max-w-lg w-full cyber-card text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                    <scenario.callerIcon className="w-10 h-10 text-purple-400" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                    {t('voiceCall.verdict.callEnded', 'Звонок завершён')}
                </h2>
                <p className="text-muted-foreground mb-2">
                    {t('voiceCall.verdict.from', 'Звонил')}: <span className="text-foreground">{scenario.caller}</span>
                </p>
                <p className="text-xl text-foreground mb-8">
                    {t('voiceCall.verdict.question', 'Как вы считаете?')}
                </p>

                <div className="grid gap-4">
                    <button
                        onClick={() => onVerdict('scam')}
                        className="w-full py-4 rounded-xl bg-cyber-red/10 border-2 border-cyber-red/50 text-cyber-red font-bold hover:bg-cyber-red/20 transition-all flex items-center justify-center gap-3"
                    >
                        <AlertTriangle className="w-6 h-6" />
                        {t('voiceCall.verdict.isScam', 'Это был мошенник!')}
                    </button>
                    <button
                        onClick={() => onVerdict('real')}
                        className="w-full py-4 rounded-xl bg-cyber-green/10 border-2 border-cyber-green/50 text-cyber-green font-bold hover:bg-cyber-green/20 transition-all flex items-center justify-center gap-3"
                    >
                        <Shield className="w-6 h-6" />
                        {t('voiceCall.verdict.isReal', 'Это был настоящий звонок')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Result Screen
const ResultScreen: React.FC<{
    scenario: VoiceScenario;
    userVerdict: 'scam' | 'real';
    onReplay: () => void;
    onNext: () => void;
}> = ({ scenario, userVerdict, onReplay, onNext }) => {
    const { t } = useTranslation();
    const isCorrect = (scenario.isScam && userVerdict === 'scam') || (!scenario.isScam && userVerdict === 'real');

    useEffect(() => {
        playSound(isCorrect ? 'success' : 'error');
    }, [isCorrect]);

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-lg w-full cyber-card my-8">
                {/* Result Icon */}
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${isCorrect ? 'bg-cyber-green/20' : 'bg-cyber-red/20'
                    }`}>
                    {isCorrect ? (
                        <CheckCircle className="w-12 h-12 text-cyber-green" />
                    ) : (
                        <XCircle className="w-12 h-12 text-cyber-red" />
                    )}
                </div>

                <h2 className={`text-2xl font-bold text-center mb-2 ${isCorrect ? 'text-cyber-green' : 'text-cyber-red'
                    }`}>
                    {isCorrect
                        ? t('voiceCall.result.correct', 'Верно!')
                        : t('voiceCall.result.wrong', 'Ошибка!')}
                </h2>

                <p className="text-center text-lg text-foreground mb-6">
                    {scenario.isScam
                        ? t('voiceCall.result.wasScam', '🚨 Это был мошенник')
                        : t('voiceCall.result.wasReal', '✅ Это был настоящий звонок')}
                </p>

                {/* Explanation */}
                <div className={`p-4 rounded-xl mb-6 ${scenario.isScam ? 'bg-cyber-red/10 border border-cyber-red/30' : 'bg-cyber-green/10 border border-cyber-green/30'
                    }`}>
                    <p className="text-foreground text-sm leading-relaxed">
                        {scenario.explanation}
                    </p>
                </div>

                {/* Signs to notice */}
                {scenario.isScam && scenario.redFlags && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-cyber-red mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {t('voiceCall.result.redFlags', 'Красные флаги:')}
                        </h4>
                        <ul className="space-y-1">
                            {scenario.redFlags.map((flag, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-cyber-red">•</span>
                                    {flag}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!scenario.isScam && scenario.legitimacySigns && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-cyber-green mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {t('voiceCall.result.legitimacySigns', 'Признаки легитимности:')}
                        </h4>
                        <ul className="space-y-1">
                            {scenario.legitimacySigns.map((sign, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-cyber-green">•</span>
                                    {sign}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Score */}
                <div className="flex justify-center gap-4 mb-6">
                    <div className="text-center px-6 py-3 bg-muted/30 rounded-xl">
                        <p className={`text-2xl font-bold ${isCorrect ? 'text-cyber-green' : 'text-cyber-red'}`}>
                            {isCorrect ? '+50' : '+10'}
                        </p>
                        <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onReplay}
                        className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('voiceCall.replay', 'Ещё раз')}
                    </button>
                    <button
                        onClick={onNext}
                        className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                    >
                        {t('voiceCall.next', 'Следующий')}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Voice Call Page
export const VoiceCallPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [callState, setCallState] = useState<CallState>({
        phase: 'idle',
        scenario: null,
        currentDialogueIndex: 0,
        isSpeaking: false,
        userVerdict: null,
        startTime: null
    });

    const [ttsSupported, setTtsSupported] = useState(true);

    // Check TTS support
    useEffect(() => {
        setTtsSupported(ttsService.isSupported());
    }, []);

    // Feature Gate: PRO or higher
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<Mic className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    const startNewCall = useCallback(() => {
        const scenario = getRandomScenario();
        setCallState({
            phase: 'context',
            scenario,
            currentDialogueIndex: 0,
            isSpeaking: false,
            userVerdict: null,
            startTime: null
        });
    }, []);

    const answerCall = useCallback(async () => {
        if (!callState.scenario) return;

        setCallState(prev => ({
            ...prev,
            phase: 'active',
            startTime: Date.now(),
            isSpeaking: true
        }));

        // Start TTS dialogue
        const scenario = callState.scenario;
        for (let i = 0; i < scenario.dialogues.length; i++) {
            if (callState.phase !== 'active') break;

            setCallState(prev => ({
                ...prev,
                currentDialogueIndex: i,
                isSpeaking: true
            }));

            try {
                await ttsService.speak(scenario.dialogues[i], { rate: 0.85 });
                // Pause between dialogues
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.warn('TTS error:', error);
            }
        }

        // Call ended, show verdict screen
        setCallState(prev => ({
            ...prev,
            phase: 'verdict',
            isSpeaking: false
        }));
    }, [callState.scenario, callState.phase]);

    const declineCall = useCallback(() => {
        ttsService.stop();
        setCallState({
            phase: 'idle',
            scenario: null,
            currentDialogueIndex: 0,
            isSpeaking: false,
            userVerdict: null,
            startTime: null
        });
    }, []);

    const hangUp = useCallback(() => {
        ttsService.stop();
        setCallState(prev => ({
            ...prev,
            phase: 'verdict',
            isSpeaking: false
        }));
    }, []);

    const submitVerdict = useCallback((verdict: 'scam' | 'real') => {
        setCallState(prev => ({
            ...prev,
            phase: 'result',
            userVerdict: verdict
        }));
    }, []);

    const replay = useCallback(() => {
        if (callState.scenario) {
            setCallState({
                phase: 'ringing',
                scenario: callState.scenario,
                currentDialogueIndex: 0,
                isSpeaking: false,
                userVerdict: null,
                startTime: null
            });
        }
    }, [callState.scenario]);

    const nextCall = useCallback(() => {
        startNewCall();
    }, [startNewCall]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm font-medium mb-4">
                            <Mic className="w-4 h-4" />
                            {t('voiceCall.badge', 'Голосовой тренажёр')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {t('voiceCall.title', 'Голосовой тренажёр звонков')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('voiceCall.subtitle', 'Научитесь отличать настоящие звонки от мошеннических')}
                        </p>
                    </div>

                    {/* TTS Warning */}
                    {!ttsSupported && (
                        <div className="mb-6 p-4 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-cyber-yellow">
                                {t('voiceCall.ttsNotSupported', 'Ваш браузер не поддерживает голосовой синтез. Тренажёр будет работать в текстовом режиме.')}
                            </p>
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="cyber-card mb-8">
                        <div className="text-center py-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-purple-500/30">
                                <Headphones className="w-12 h-12 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                {t('voiceCall.ready.title', 'Готовы к тренировке?')}
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {t('voiceCall.ready.desc', 'Вам позвонит неизвестный. Это может быть настоящий человек или мошенник. Послушайте и определите, кто это!')}
                            </p>
                            <button
                                onClick={startNewCall}
                                className="px-8 py-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-all flex items-center gap-3 mx-auto hover:scale-105"
                            >
                                <Play className="w-5 h-5" />
                                {t('voiceCall.startTraining', 'Начать тренировку')}
                            </button>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="cyber-card mb-8">
                        <h3 className="font-semibold text-foreground mb-4">
                            {t('voiceCall.howItWorks.title', 'Как это работает?')}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                    <PhoneIncoming className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="font-medium text-foreground mb-1">1. Примите звонок</h4>
                                <p className="text-sm text-muted-foreground">Вам поступит входящий звонок от неизвестного</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                    <Volume2 className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="font-medium text-foreground mb-1">2. Слушайте</h4>
                                <p className="text-sm text-muted-foreground">Головой озвучит диалог. Обращайте внимание на детали</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="font-medium text-foreground mb-1">3. Примите решение</h4>
                                <p className="text-sm text-muted-foreground">Определите: это мошенник или настоящий звонок?</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="cyber-card text-center">
                            <p className="text-2xl font-bold text-purple-400">6</p>
                            <p className="text-xs text-muted-foreground">{t('voiceCall.stats.scenarios', 'Сценариев')}</p>
                        </div>
                        <div className="cyber-card text-center">
                            <p className="text-2xl font-bold text-cyber-red">3</p>
                            <p className="text-xs text-muted-foreground">{t('voiceCall.stats.scams', 'Мошенников')}</p>
                        </div>
                        <div className="cyber-card text-center">
                            <p className="text-2xl font-bold text-cyber-green">3</p>
                            <p className="text-xs text-muted-foreground">{t('voiceCall.stats.real', 'Настоящих')}</p>
                        </div>
                        <div className="cyber-card text-center">
                            <p className="text-2xl font-bold text-foreground">50/50</p>
                            <p className="text-xs text-muted-foreground">{t('voiceCall.stats.chance', 'Шанс')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context modal before call (нейтральное описание, без спойлеров) */}
            {callState.phase === 'context' && callState.scenario && (
                <ScenarioContextModal
                    title={callState.scenario.title}
                    subtitle={callState.scenario.caller}
                    description={t('voiceCall.contextDesc', 'Вам позвонит неизвестный. Это может быть мошенник или настоящий человек / организация. Слушайте внимательно — после звонка вы определите, кто звонил, и получите разбор.')}
                    startLabel={t('voiceCall.startCall', 'Принять звонок')}
                    onStart={() => setCallState(prev => prev.scenario ? { ...prev, phase: 'ringing' } : prev)}
                    onClose={() => setCallState({ phase: 'idle', scenario: null, currentDialogueIndex: 0, isSpeaking: false, userVerdict: null, startTime: null })}
                    showBackButton={true}
                />
            )}

            {/* Call Overlays */}
            {callState.phase === 'ringing' && callState.scenario && (
                <RingingScreen
                    caller={callState.scenario.caller}
                    onAnswer={answerCall}
                    onDecline={declineCall}
                />
            )}

            {callState.phase === 'active' && callState.scenario && (
                <ActiveCallScreen
                    scenario={callState.scenario}
                    currentDialogueIndex={callState.currentDialogueIndex}
                    isSpeaking={callState.isSpeaking}
                    onHangUp={hangUp}
                />
            )}

            {callState.phase === 'verdict' && callState.scenario && (
                <VerdictScreen
                    scenario={callState.scenario}
                    onVerdict={submitVerdict}
                />
            )}

            {callState.phase === 'result' && callState.scenario && callState.userVerdict && (
                <ResultScreen
                    scenario={callState.scenario}
                    userVerdict={callState.userVerdict}
                    onReplay={replay}
                    onNext={nextCall}
                />
            )}
        </DashboardLayout>
    );
};

export default VoiceCallPage;
