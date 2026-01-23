import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { ScenarioContextModal } from '../components/ScenarioContextModal';
import { useAuth } from '../contexts/AuthContext';
import {
    Phone, PhoneOff, PhoneIncoming, AlertTriangle,
    User, Building2, BadgeAlert,
    CheckCircle, XCircle, Clock, RotateCcw,
    ChevronRight, Play, MessageSquare, Zap
} from 'lucide-react';

// Types
interface CallScenario {
    id: string;
    title: string;
    caller: string;
    callerRole: string;
    callerIcon: React.ElementType;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    dialogues: Dialogue[];
    correctEnding: string;
    redFlags?: string[];
}

interface Dialogue {
    id: string;
    speaker: 'caller' | 'user';
    text: string;
    isScamTactic?: string;
    options?: DialogueOption[];
}

interface DialogueOption {
    id: string;
    text: string;
    isSafe: boolean;
    nextDialogueId: string | 'end_safe' | 'end_scammed';
    feedback: string;
}

interface CallState {
    status: 'ringing' | 'active' | 'ended';
    currentDialogueIndex: number;
    selectedOptions: { dialogueId: string; optionId: string; isSafe: boolean }[];
    score: number;
    startTime: number | null;
    endTime: number | null;
}

// Call scenarios data
const CALL_SCENARIOS: CallScenario[] = [
    {
        id: 'bank_security',
        title: 'Служба безопасности банка',
        caller: 'Служба безопасности Kaspi',
        callerRole: 'Сотрудник банка',
        callerIcon: Building2,
        difficulty: 'easy',
        description: 'Вам звонят якобы из службы безопасности банка и сообщают о подозрительной активности.',
        correctEnding: 'Правильно! Настоящий банк никогда не просит данные карты по телефону.',
        redFlags: [
            'Создание паники и срочности («деньги списываются сейчас!»)',
            'Запрос данных карты и кода из SMS по телефону',
            'Давление и уход от ответа на проверочные вопросы (ID сотрудника)',
        ],
        dialogues: [
            {
                id: 'd1',
                speaker: 'caller',
                text: 'Здравствуйте! Вас беспокоит служба безопасности Kaspi Bank. Мы зафиксировали подозрительную попытку списания 150 000 тенге с вашей карты. Это вы совершали операцию?',
                isScamTactic: 'Создание паники',
            },
            {
                id: 'd2',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o1',
                        text: 'Нет, это не я! Что мне делать?',
                        isSafe: false,
                        nextDialogueId: 'd3_unsafe',
                        feedback: 'Мошенники используют страх, чтобы вы действовали импульсивно.'
                    },
                    {
                        id: 'o2',
                        text: 'Подождите, я сам позвоню в банк по официальному номеру.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Отлично! Всегда перезванивайте в банк самостоятельно по номеру с карты.'
                    },
                    {
                        id: 'o3',
                        text: 'Откуда вы звоните? Назовите свой ID сотрудника.',
                        isSafe: true,
                        nextDialogueId: 'd3_suspicious',
                        feedback: 'Хороший ход! Мошенники обычно не могут предоставить реальные данные.'
                    }
                ]
            },
            {
                id: 'd3_unsafe',
                speaker: 'caller',
                text: 'Не волнуйтесь, мы поможем! Для отмены транзакции мне нужны данные вашей карты и код из SMS, который сейчас придёт.',
                isScamTactic: 'Запрос конфиденциальных данных',
            },
            {
                id: 'd4_unsafe',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o4',
                        text: 'Хорошо, диктую: номер карты 4400...',
                        isSafe: false,
                        nextDialogueId: 'end_scammed',
                        feedback: 'Вы передали данные мошенникам! Банк НИКОГДА не запрашивает полные данные карты и SMS-коды.'
                    },
                    {
                        id: 'o5',
                        text: 'Стоп! Банк не просит такие данные. Вы мошенник!',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Правильно! Вы распознали мошенника. Настоящий банк никогда не просит CVV и SMS-коды.'
                    }
                ]
            },
            {
                id: 'd3_suspicious',
                speaker: 'caller',
                text: 'Эм... мой ID... минутку... Это срочно! У вас нет времени! Деньги списываются прямо сейчас!',
                isScamTactic: 'Давление и срочность',
            },
            {
                id: 'd4_suspicious',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o6',
                        text: 'Ладно-ладно, что нужно делать?',
                        isSafe: false,
                        nextDialogueId: 'd3_unsafe',
                        feedback: 'Не поддавайтесь давлению! Настоящий сотрудник банка представится полностью.'
                    },
                    {
                        id: 'o7',
                        text: 'Если вы не можете назвать ID - это мошенничество. Я вешаю трубку.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Превосходно! Вы не поддались на манипуляции и прекратили разговор.'
                    }
                ]
            }
        ]
    },
    {
        id: 'police_call',
        title: 'Звонок от "полиции"',
        caller: 'Капитан Ермеков',
        callerRole: 'Сотрудник полиции',
        callerIcon: BadgeAlert,
        difficulty: 'medium',
        description: 'Звонящий представляется сотрудником полиции и сообщает о возбуждённом уголовном деле.',
        correctEnding: 'Полиция не решает вопросы по телефону и не требует оплаты для "закрытия дела".',
        redFlags: [
            'Запугивание властями и уголовным делом',
            'Требует деньги за «закрытие дела» по телефону',
            'Уход от ответа на проверочные вопросы (номер дела, явка в отделение)',
        ],
        dialogues: [
            {
                id: 'd1',
                speaker: 'caller',
                text: 'Гражданин, это капитан Ермеков, отдел по борьбе с мошенничеством. На вас поступило заявление о мошенничестве. Возбуждено уголовное дело. Вам грозит до 7 лет лишения свободы.',
                isScamTactic: 'Запугивание авторитетом',
            },
            {
                id: 'd2',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o1',
                        text: 'Как это? Я ничего не делал! Это ошибка!',
                        isSafe: false,
                        nextDialogueId: 'd3_hook',
                        feedback: 'Мошенники используют страх перед властями для манипуляции.'
                    },
                    {
                        id: 'o2',
                        text: 'Назовите номер дела и ваш полный ID. Я сам приду в отделение.',
                        isSafe: true,
                        nextDialogueId: 'd3_verify',
                        feedback: 'Правильно! Настоящий полицейский без проблем предоставит эти данные.'
                    },
                    {
                        id: 'o3',
                        text: 'Полиция не звонит. Я буду общаться только при личной явке с повесткой.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Отлично! Полиция вызывает официальной повесткой, а не телефонными звонками.'
                    }
                ]
            },
            {
                id: 'd3_hook',
                speaker: 'caller',
                text: 'Это можно решить. Внесите залог 200 000 тенге на специальный счёт, и дело будет закрыто до суда. Это ваш единственный шанс.',
                isScamTactic: 'Вымогательство денег',
            },
            {
                id: 'd4_hook',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o4',
                        text: 'Хорошо, куда переводить деньги?',
                        isSafe: false,
                        nextDialogueId: 'end_scammed',
                        feedback: 'Вы стали жертвой! Полиция НИКОГДА не требует оплаты по телефону.'
                    },
                    {
                        id: 'o5',
                        text: 'Это незаконно! Полиция не берёт залоги по телефону!',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Верно! Вы распознали схему вымогательства.'
                    }
                ]
            },
            {
                id: 'd3_verify',
                speaker: 'caller',
                text: 'Послушайте, это... закрытая информация. Дело срочное! Если не решим сейчас - вас арестуют!',
                isScamTactic: 'Уход от ответа + давление',
            },
            {
                id: 'd4_verify',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o6',
                        text: 'Тогда присылайте наряд. Я буду разговаривать только с повесткой.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Браво! Вы не поддались на устрашение.'
                    },
                    {
                        id: 'o7',
                        text: 'Ладно, что нужно сделать, чтобы это закончилось?',
                        isSafe: false,
                        nextDialogueId: 'd3_hook',
                        feedback: 'Осторожно! Мошенник переходит к вымогательству денег.'
                    }
                ]
            }
        ]
    },
    {
        id: 'relative_trouble',
        title: 'Родственник в беде',
        caller: 'Неизвестный',
        callerRole: 'Голос похож на родственника',
        callerIcon: User,
        difficulty: 'hard',
        description: 'Звонящий притворяется вашим родственником попавшим в беду и срочно просит деньги.',
        correctEnding: 'Всегда перезванивайте родственникам напрямую для проверки!',
        redFlags: [
            'Эмоциональная манипуляция («помоги», «мне плохо»)',
            'Просит не говорить другим родственникам («маме не говори»)',
            'Требует срочный перевод денег, не даёт проверить по другому каналу',
        ],
        dialogues: [
            {
                id: 'd1',
                speaker: 'caller',
                text: '(приглушённый, взволнованный голос) Алло... это я... Мне очень плохо... Я попал в аварию... Полиция требует деньги чтобы не возбуждать дело... Помоги, пожалуйста...',
                isScamTactic: 'Эмоциональная манипуляция',
            },
            {
                id: 'd2',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o1',
                        text: 'О боже! Сколько нужно денег? Куда перевести?',
                        isSafe: false,
                        nextDialogueId: 'd3_panic',
                        feedback: 'Стоп! Сначала нужно убедиться, что это действительно ваш родственник.'
                    },
                    {
                        id: 'o2',
                        text: 'Подожди, как тебя зовут? Назови имя мамы/папы.',
                        isSafe: true,
                        nextDialogueId: 'd3_verify',
                        feedback: 'Отлично! Проверочные вопросы помогут выявить мошенника.'
                    },
                    {
                        id: 'o3',
                        text: 'Я сейчас перезвоню тебе на обычный номер.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Идеально! Всегда перезванивайте на известный вам номер.'
                    }
                ]
            },
            {
                id: 'd3_panic',
                speaker: 'caller',
                text: 'Нужно 300 000 тенге... срочно... наличкой курьеру или на карту... Только маме не говори, она переживать будет...',
                isScamTactic: 'Изоляция жертвы',
            },
            {
                id: 'd4_panic',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o4',
                        text: 'Хорошо, никому не скажу. Диктуй номер карты.',
                        isSafe: false,
                        nextDialogueId: 'end_scammed',
                        feedback: 'Вы отправили деньги мошенникам! "Не говори родителям" - красный флаг!'
                    },
                    {
                        id: 'o5',
                        text: 'Стоп. Я позвоню маме и уточню, что случилось.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Правильно! Проверка через других членов семьи спасёт ваши деньги.'
                    }
                ]
            },
            {
                id: 'd3_verify',
                speaker: 'caller',
                text: 'Ты что, не узнаёшь меня?! Мне плохо, голова кружится после удара... Не время для вопросов! Помоги!',
                isScamTactic: 'Уход от ответа через эмоции',
            },
            {
                id: 'd4_verify',
                speaker: 'user',
                text: '',
                options: [
                    {
                        id: 'o6',
                        text: 'Ладно, говори что делать...',
                        isSafe: false,
                        nextDialogueId: 'd3_panic',
                        feedback: 'Осторожно! Мошенник продолжает манипулировать.'
                    },
                    {
                        id: 'o7',
                        text: 'Если не можешь ответить на простой вопрос - ты не мой родственник.',
                        isSafe: true,
                        nextDialogueId: 'end_safe',
                        feedback: 'Отлично! Настоящий родственник легко ответит на личные вопросы.'
                    }
                ]
            }
        ]
    }
];

// Ringing Animation Component
const RingingAnimation: React.FC<{ onAnswer: () => void; onDecline: () => void; caller: string }> = ({ onAnswer, onDecline, caller }) => {
    const { t } = useTranslation();
    const [ringCount, setRingCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRingCount(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="text-center">
                {/* Pulsing phone icon */}
                <div className="relative mb-8">
                    <div className={`w-32 h-32 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto ${ringCount % 2 === 0 ? 'scale-100' : 'scale-110'} transition-transform`}>
                        <div className={`w-24 h-24 rounded-full bg-cyber-green/30 flex items-center justify-center ${ringCount % 2 === 0 ? 'scale-110' : 'scale-100'} transition-transform`}>
                            <PhoneIncoming className="w-12 h-12 text-cyber-green animate-pulse" />
                        </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-cyber-green/50 animate-ping" />
                </div>

                <p className="text-white text-2xl font-bold mb-2">{t('callSimulator.incomingCall', 'Входящий звонок')}</p>
                <p className="text-cyber-green text-xl mb-8">{caller}</p>

                <div className="flex gap-8 justify-center">
                    <button
                        onClick={onDecline}
                        className="w-16 h-16 rounded-full bg-cyber-red flex items-center justify-center hover:bg-cyber-red/80 transition-colors"
                    >
                        <PhoneOff className="w-8 h-8 text-white" />
                    </button>
                    <button
                        onClick={onAnswer}
                        className="w-16 h-16 rounded-full bg-cyber-green flex items-center justify-center hover:bg-cyber-green/80 transition-colors animate-bounce"
                    >
                        <Phone className="w-8 h-8 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Call Interface Component
const CallInterface: React.FC<{
    scenario: CallScenario;
    callState: CallState;
    onSelectOption: (dialogueId: string, option: DialogueOption) => void;
    onHangUp: () => void;
}> = ({ scenario, callState, onSelectOption, onHangUp }) => {
    const { t } = useTranslation();
    const [showTactic, setShowTactic] = useState<string | null>(null);

    const currentDialogue = scenario.dialogues.find((d, index) => {
        if (callState.currentDialogueIndex === index) return true;
        // Find by ID for branching dialogues
        const lastSelection = callState.selectedOptions[callState.selectedOptions.length - 1];
        if (lastSelection) {
            const option = scenario.dialogues
                .flatMap(dial => dial.options || [])
                .find(opt => opt.id === lastSelection.optionId);
            if (option && option.nextDialogueId === d.id) return true;
        }
        return false;
    });

    // Get dialogue chain
    const displayedDialogues = scenario.dialogues.slice(0, callState.currentDialogueIndex + 1).filter(d =>
        d.speaker === 'caller' || callState.selectedOptions.some(so =>
            scenario.dialogues.find(dial => dial.id === d.id)?.options?.some(opt => opt.id === so.optionId)
        )
    );

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col z-50">
            {/* Call Header */}
            <div className="p-6 text-center border-b border-gray-800">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-green/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3 border-2 border-cyber-green/30">
                    <scenario.callerIcon className="w-10 h-10 text-cyber-green" />
                </div>
                <h2 className="text-white text-xl font-bold">{scenario.caller}</h2>
                <p className="text-gray-400 text-sm">{scenario.callerRole}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-cyber-green text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                    {t('callSimulator.callActive', 'Звонок активен')}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayedDialogues.map((dialogue) => (
                    <div key={dialogue.id}>
                        {dialogue.speaker === 'caller' && (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <scenario.callerIcon className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                        <p className="text-white">{dialogue.text}</p>
                                    </div>
                                    {dialogue.isScamTactic && (
                                        <button
                                            onClick={() => setShowTactic(showTactic === dialogue.id ? null : dialogue.id)}
                                            className="mt-2 text-xs text-cyber-yellow flex items-center gap-1 hover:underline"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            {t('callSimulator.showTactic', 'Показать тактику мошенника')}
                                        </button>
                                    )}
                                    {showTactic === dialogue.id && dialogue.isScamTactic && (
                                        <div className="mt-2 p-2 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg text-sm text-cyber-yellow">
                                            ⚠️ <strong>Тактика:</strong> {dialogue.isScamTactic}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {dialogue.speaker === 'user' && callState.selectedOptions.find(so =>
                            dialogue.options?.some(opt => opt.id === so.optionId)
                        ) && (
                                <div className="flex justify-end">
                                    <div className="bg-cyber-green rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                                        <p className="text-black font-medium">
                                            {dialogue.options?.find(opt =>
                                                callState.selectedOptions.some(so => so.optionId === opt.id)
                                            )?.text}
                                        </p>
                                    </div>
                                </div>
                            )}
                    </div>
                ))}

                {/* Current Options */}
                {currentDialogue?.options && !callState.selectedOptions.find(so =>
                    currentDialogue.options?.some(opt => opt.id === so.optionId)
                ) && (
                        <div className="space-y-2 mt-4">
                            <p className="text-gray-400 text-sm text-center mb-3">
                                {t('callSimulator.chooseResponse', 'Выберите ваш ответ:')}
                            </p>
                            {currentDialogue.options.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => onSelectOption(currentDialogue.id, option)}
                                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left text-white transition-colors border border-gray-700 hover:border-cyber-green/50"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    )}
            </div>

            {/* Call Controls */}
            <div className="p-6 border-t border-gray-800">
                <button
                    onClick={onHangUp}
                    className="w-full py-4 rounded-xl bg-cyber-red text-white font-bold flex items-center justify-center gap-2 hover:bg-cyber-red/80 transition-colors"
                >
                    <PhoneOff className="w-5 h-5" />
                    {t('callSimulator.hangUp', 'Завершить звонок')}
                </button>
            </div>
        </div>
    );
};

// Results Screen
const ResultsScreen: React.FC<{
    scenario: CallScenario;
    callState: CallState;
    onReplay: () => void;
    onNext: () => void;
    onExit: () => void;
}> = ({ scenario, callState, onReplay, onNext }) => {
    const { t } = useTranslation();

    const safeChoices = callState.selectedOptions.filter(o => o.isSafe).length;
    const totalChoices = callState.selectedOptions.length;
    const wasScammed = callState.selectedOptions.some(o => {
        const option = scenario.dialogues
            .flatMap(d => d.options || [])
            .find(opt => opt.id === o.optionId);
        return option?.nextDialogueId === 'end_scammed';
    });

    const score = wasScammed ? 0 : Math.round((safeChoices / Math.max(totalChoices, 1)) * 100);
    const xpEarned = wasScammed ? 5 : score >= 80 ? 50 : score >= 50 ? 30 : 15;

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
            <div className="max-w-lg w-full cyber-card text-center">
                {/* Result Icon */}
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${wasScammed ? 'bg-cyber-red/20' : 'bg-cyber-green/20'
                    }`}>
                    {wasScammed ? (
                        <XCircle className="w-12 h-12 text-cyber-red" />
                    ) : (
                        <CheckCircle className="w-12 h-12 text-cyber-green" />
                    )}
                </div>

                <h2 className={`text-2xl font-bold mb-2 ${wasScammed ? 'text-cyber-red' : 'text-cyber-green'}`}>
                    {wasScammed
                        ? t('callSimulator.result.scammed', 'Вы стали жертвой!')
                        : t('callSimulator.result.safe', 'Отлично! Вы распознали мошенника!')}
                </h2>

                <p className="text-muted-foreground mb-6">{scenario.correctEnding}</p>

                {/* Score */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-muted/30 rounded-xl">
                        <p className={`text-2xl font-bold ${wasScammed ? 'text-cyber-red' : 'text-cyber-green'}`}>{score}%</p>
                        <p className="text-xs text-muted-foreground">{t('callSimulator.score', 'Оценка')}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold text-cyber-yellow">+{xpEarned}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">{safeChoices}/{totalChoices}</p>
                        <p className="text-xs text-muted-foreground">{t('callSimulator.safeChoices', 'Верных')}</p>
                    </div>
                </div>

                {/* Review choices */}
                <div className="text-left mb-6">
                    <h3 className="font-semibold text-foreground mb-3">{t('callSimulator.yourChoices', 'Ваши ответы:')}</h3>
                    <div className="space-y-2">
                        {callState.selectedOptions.map((selection, index) => {
                            const option = scenario.dialogues
                                .flatMap(d => d.options || [])
                                .find(opt => opt.id === selection.optionId);
                            return (
                                <div key={index} className={`p-3 rounded-lg border ${selection.isSafe
                                    ? 'bg-cyber-green/5 border-cyber-green/30'
                                    : 'bg-cyber-red/5 border-cyber-red/30'
                                    }`}>
                                    <div className="flex items-start gap-2">
                                        {selection.isSafe ? (
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-cyber-red flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className="text-sm text-foreground">{option?.text}</p>
                                            <p className={`text-xs mt-1 ${selection.isSafe ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                                {option?.feedback}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onReplay}
                        className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('callSimulator.replay', 'Повторить')}
                    </button>
                    <button
                        onClick={onNext}
                        className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                    >
                        {t('callSimulator.next', 'Следующий')}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Call Simulator Page
export const CallSimulatorPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Feature Gate: PRO or higher
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<Phone className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    const [selectedScenario, setSelectedScenario] = useState<CallScenario | null>(null);
    const [callState, setCallState] = useState<CallState | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [pendingScenario, setPendingScenario] = useState<CallScenario | null>(null);
    const [showContextModal, setShowContextModal] = useState(false);

    const startCall = (scenario: CallScenario) => {
        setSelectedScenario(scenario);
        setCallState({
            status: 'ringing',
            currentDialogueIndex: 0,
            selectedOptions: [],
            score: 0,
            startTime: null,
            endTime: null
        });
    };

    const answerCall = () => {
        if (callState) {
            setCallState({
                ...callState,
                status: 'active',
                startTime: Date.now()
            });
        }
    };

    const declineCall = () => {
        setSelectedScenario(null);
        setCallState(null);
    };

    const handleSelectOption = useCallback((dialogueId: string, option: DialogueOption) => {
        if (!callState || !selectedScenario) return;

        const newSelectedOptions = [
            ...callState.selectedOptions,
            { dialogueId, optionId: option.id, isSafe: option.isSafe }
        ];

        if (option.nextDialogueId === 'end_safe' || option.nextDialogueId === 'end_scammed') {
            setCallState({
                ...callState,
                status: 'ended',
                selectedOptions: newSelectedOptions,
                endTime: Date.now()
            });
            setShowResults(true);
        } else {
            // Find next dialogue index
            const nextIndex = selectedScenario.dialogues.findIndex(d => d.id === option.nextDialogueId);
            setCallState({
                ...callState,
                currentDialogueIndex: nextIndex !== -1 ? nextIndex : callState.currentDialogueIndex + 1,
                selectedOptions: newSelectedOptions
            });
        }
    }, [callState, selectedScenario]);

    const hangUp = () => {
        if (callState) {
            setCallState({
                ...callState,
                status: 'ended',
                endTime: Date.now()
            });
            setShowResults(true);
        }
    };

    const replay = () => {
        if (selectedScenario) {
            setShowResults(false);
            setCallState({
                status: 'ringing',
                currentDialogueIndex: 0,
                selectedOptions: [],
                score: 0,
                startTime: null,
                endTime: null
            });
        }
    };

    const nextScenario = () => {
        if (selectedScenario) {
            const currentIndex = CALL_SCENARIOS.findIndex(s => s.id === selectedScenario.id);
            const nextIndex = (currentIndex + 1) % CALL_SCENARIOS.length;
            setShowResults(false);
            startCall(CALL_SCENARIOS[nextIndex]);
        }
    };

    const exitSimulator = () => {
        setSelectedScenario(null);
        setCallState(null);
        setShowResults(false);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-cyber-green bg-cyber-green/10 border-cyber-green/30';
            case 'medium': return 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/30';
            case 'hard': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/30';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return t('callSimulator.difficulty.easy', 'Лёгкий');
            case 'medium': return t('callSimulator.difficulty.medium', 'Средний');
            case 'hard': return t('callSimulator.difficulty.hard', 'Сложный');
            default: return difficulty;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-400 text-sm font-medium mb-4">
                            <Phone className="w-4 h-4" />
                            {t('callSimulator.badge', 'Симулятор звонков')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {t('callSimulator.title', 'Тренажёр мошеннических звонков')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('callSimulator.subtitle', 'Научитесь распознавать и противостоять телефонным мошенникам')}
                        </p>
                    </div>

                    {/* Scenario Cards */}
                    <div className="grid gap-6">
                        {CALL_SCENARIOS.map(scenario => (
                            <div key={scenario.id} className="cyber-card hover:shadow-lg transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                                        <scenario.callerIcon className="w-7 h-7 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{scenario.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getDifficultyColor(scenario.difficulty)}`}>
                                                {getDifficultyLabel(scenario.difficulty)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                {scenario.dialogues.length} реплик
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                ~2-3 мин
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setPendingScenario(scenario); setShowContextModal(true); }}
                                        className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        {t('callSimulator.startCall', 'Начать')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tips */}
                    <div className="mt-8 cyber-card border-purple-500/30 bg-purple-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {t('callSimulator.tips.title', 'Советы при подозрительных звонках')}
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('callSimulator.tips.tip1', 'Настоящие сотрудники банка никогда не просят CVV, PIN или SMS-коды')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('callSimulator.tips.tip2', 'При любых сомнениях положите трубку и перезвоните по официальному номеру')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('callSimulator.tips.tip3', 'Полиция не решает вопросы по телефону и не требует оплаты')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('callSimulator.tips.tip4', 'Если "родственник" просит деньги - перезвоните ему на известный номер')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context modal before call */}
            {showContextModal && pendingScenario && (
                <ScenarioContextModal
                    title={pendingScenario.title}
                    subtitle={pendingScenario.caller}
                    description={pendingScenario.description}
                    redFlags={pendingScenario.redFlags}
                    summary={pendingScenario.correctEnding}
                    isScam={true}
                    startLabel={t('callSimulator.startCall', 'Начать звонок')}
                    onStart={() => { startCall(pendingScenario); setShowContextModal(false); setPendingScenario(null); }}
                    onClose={() => { setShowContextModal(false); setPendingScenario(null); }}
                    showBackButton={true}
                />
            )}

            {/* Call Overlays */}
            {selectedScenario && callState?.status === 'ringing' && (
                <RingingAnimation
                    caller={selectedScenario.caller}
                    onAnswer={answerCall}
                    onDecline={declineCall}
                />
            )}

            {selectedScenario && callState?.status === 'active' && (
                <CallInterface
                    scenario={selectedScenario}
                    callState={callState}
                    onSelectOption={handleSelectOption}
                    onHangUp={hangUp}
                />
            )}

            {selectedScenario && callState && showResults && (
                <ResultsScreen
                    scenario={selectedScenario}
                    callState={callState}
                    onReplay={replay}
                    onNext={nextScenario}
                    onExit={exitSimulator}
                />
            )}
        </DashboardLayout>
    );
};

export default CallSimulatorPage;
