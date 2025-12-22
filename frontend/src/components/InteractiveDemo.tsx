import React, { useState, useEffect } from 'react';
import { Phone, Package, Landmark, ArrowRight } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any;
}

// Custom Icons
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

interface Scenario {
    id: number;
    type: 'whatsapp' | 'call' | 'sms' | 'telegram';
    icon: React.ReactNode;
    contact: string;
    message: string;
    question: string;
    choices: string[];
    riskyChoices: number[];
}

const scenarios: Scenario[] = [
    {
        id: 1,
        type: 'whatsapp',
        icon: <WhatsAppIcon className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario1.contact',
        message: 'demo.scenario1.message',
        question: 'demo.scenario1.question',
        choices: ['demo.scenario1.choice1', 'demo.scenario1.choice2', 'demo.scenario1.choice3'],
        riskyChoices: [0]
    },
    {
        id: 2,
        type: 'call',
        icon: <Phone className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario2.contact',
        message: 'demo.scenario2.message',
        question: 'demo.scenario2.question',
        choices: ['demo.scenario2.choice1', 'demo.scenario2.choice2', 'demo.scenario2.choice3'],
        riskyChoices: [0]
    },
    {
        id: 3,
        type: 'sms',
        icon: <Landmark className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario3.contact',
        message: 'demo.scenario3.message',
        question: 'demo.scenario3.question',
        choices: ['demo.scenario3.choice1', 'demo.scenario3.choice2', 'demo.scenario3.choice3'],
        riskyChoices: [0]
    },
    {
        id: 4,
        type: 'telegram',
        icon: <TelegramIcon className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario4.contact',
        message: 'demo.scenario4.message',
        question: 'demo.scenario4.question',
        choices: ['demo.scenario4.choice1', 'demo.scenario4.choice2', 'demo.scenario4.choice3'],
        riskyChoices: [0]
    },
    {
        id: 5,
        type: 'sms',
        icon: <Package className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario5.contact',
        message: 'demo.scenario5.message',
        question: 'demo.scenario5.question',
        choices: ['demo.scenario5.choice1', 'demo.scenario5.choice2', 'demo.scenario5.choice3'],
        riskyChoices: [0]
    }
];

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ navigate, t }) => {
    // Initialize with default order, will be shuffled on mount
    const [scenarioOrder, setScenarioOrder] = useState<number[]>([0, 1, 2, 3, 4]);
    const [orderIndex, setOrderIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Fisher-Yates shuffle to randomize scenario order on mount
        const indices = scenarios.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setScenarioOrder(indices);
    }, []);

    const currentScenarioId = scenarioOrder[orderIndex];
    const scenario = scenarios[currentScenarioId];
    const isRisky = selectedChoice !== null && scenario.riskyChoices.includes(selectedChoice);

    useEffect(() => {
        if (isPaused || selectedChoice !== null) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    // Move to next scenario in the shuffled order
                    setOrderIndex((curr) => (curr + 1) % scenarios.length);
                    return 100;
                }
                return prev - 1;
            });
        }, 150); // Update every 150ms -> 15s total duration

        return () => clearInterval(interval);
    }, [isPaused, selectedChoice, scenarioOrder]); // Added scenarioOrder dep

    const handleChoice = (index: number) => {
        setSelectedChoice(index);
        setIsPaused(true);
    };

    const handleNext = () => {
        setSelectedChoice(null);
        setIsPaused(false);
        setOrderIndex((curr) => (curr + 1) % scenarios.length);
        setProgress(100);
    };

    const handleTryReal = () => {
        navigate('/auth');
    };

    return (
        <div className="pt-12 max-w-2xl mx-auto">
            {/* Scenario Card */}
            <div className="relative cyber-card border-cyber-green/20">
                {/* Progress Bar - Only show when rotating */}
                {!selectedChoice && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 rounded-t-lg overflow-hidden">
                        <div
                            className="h-full bg-cyber-green transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="space-y-4 pt-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/50">
                        <div className="flex items-start gap-3 flex-1">
                            {scenario.icon}
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                    {t(scenario.contact, 'Неизвестный номер')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {scenario.type === 'whatsapp' && 'WhatsApp'}
                                    {scenario.type === 'call' && t('demo.call', 'Входящий звонок')}
                                    {scenario.type === 'sms' && 'SMS'}
                                    {scenario.type === 'telegram' && 'Telegram'}
                                </p>
                            </div>
                        </div>
                        {/* Counter deleted */}
                    </div>

                    {/* Message */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {t(scenario.message, '')}
                        </p>
                    </div>

                    {!selectedChoice ? (
                        <>
                            {/* Question */}
                            <div className="pt-2">
                                <p className="text-sm text-muted-foreground text-center mb-3">
                                    {t(scenario.question, 'Что вы сделаете?')}
                                </p>
                            </div>

                            {/* Choice Buttons */}
                            <div className="grid grid-cols-1 gap-2">
                                {scenario.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleChoice(index)}
                                        className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                    >
                                        {t(choice, '')}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-3 h-full">
                                {/* Feedback Block */}
                                <div className={`p-3 rounded-lg border flex flex-col justify-center text-center ${isRisky ? 'bg-cyber-yellow/10 border-cyber-yellow/20' : 'bg-cyber-green/10 border-cyber-green/20'
                                    }`}>
                                    <p className={`text-xs font-semibold leading-snug ${isRisky ? 'text-cyber-yellow' : 'text-cyber-green'
                                        }`}>
                                        {isRisky
                                            ? t('demo.riskyFeedback', 'Так часто начинаются реальные случаи мошенничества')
                                            : t('demo.cautiousFeedback', 'Вы выбрали осторожную стратегию')
                                        }
                                    </p>
                                </div>

                                {/* Try Real Button Block */}
                                <button
                                    onClick={handleTryReal}
                                    className="p-3 rounded-lg cyber-button flex flex-col items-center justify-center text-center group bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/50 transition-all"
                                >
                                    <span className="text-xs font-bold text-cyber-green group-hover:text-white transition-colors mb-1">
                                        QadamSafe
                                    </span>
                                    <span className="text-[10px] text-muted-foreground group-hover:text-cyber-green/80 leading-tight">
                                        {t('demo.tryReal', 'Попробовать реальные сценарии')}
                                    </span>
                                </button>
                            </div>

                            {/* Next Scenario Button */}
                            <button
                                onClick={handleNext}
                                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
                            >
                                {t('demo.nextScenario', 'Следующий сценарий')}
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Disclaimer */}
                    {!selectedChoice && (
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                {t('demo.hint', 'Сценарий основан на реальных случаях мошенничества в Казахстане.\nФормулировки адаптированы в образовательных целях.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
