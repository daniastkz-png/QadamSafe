import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any;
}

// WhatsApp Icon Component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
        choices: ['demo.scenario1.choice1', 'demo.scenario1.choice2', 'demo.scenario1.choice3', 'demo.scenario1.choice4'],
        riskyChoices: [0]
    },
    {
        id: 2,
        type: 'call',
        icon: <Phone className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario2.contact',
        message: 'demo.scenario2.message',
        question: 'demo.scenario2.question',
        choices: ['demo.scenario2.choice1', 'demo.scenario2.choice2', 'demo.scenario2.choice3', 'demo.scenario2.choice4'],
        riskyChoices: [0]
    },
    {
        id: 3,
        type: 'sms',
        icon: <MessageSquare className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario3.contact',
        message: 'demo.scenario3.message',
        question: 'demo.scenario3.question',
        choices: ['demo.scenario3.choice1', 'demo.scenario3.choice2', 'demo.scenario3.choice3', 'demo.scenario3.choice4'],
        riskyChoices: [0]
    },
    {
        id: 4,
        type: 'telegram',
        icon: <MessageSquare className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario4.contact',
        message: 'demo.scenario4.message',
        question: 'demo.scenario4.question',
        choices: ['demo.scenario4.choice1', 'demo.scenario4.choice2', 'demo.scenario4.choice3', 'demo.scenario4.choice4'],
        riskyChoices: [0]
    },
    {
        id: 5,
        type: 'sms',
        icon: <MessageSquare className="w-5 h-5 text-cyber-green" />,
        contact: 'demo.scenario5.contact',
        message: 'demo.scenario5.message',
        question: 'demo.scenario5.question',
        choices: ['demo.scenario5.choice1', 'demo.scenario5.choice2', 'demo.scenario5.choice3', 'demo.scenario5.choice4'],
        riskyChoices: [0]
    }
];

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ navigate, t }) => {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    const scenario = scenarios[currentScenario];
    const isRisky = selectedChoice !== null && scenario.riskyChoices.includes(selectedChoice);

    useEffect(() => {
        if (isPaused || selectedChoice !== null) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    // Move to next scenario
                    setCurrentScenario((curr) => (curr + 1) % scenarios.length);
                    return 100;
                }
                return prev - 1;
            });
        }, 100); // Update every 100ms for smooth animation (10s total)

        return () => clearInterval(interval);
    }, [isPaused, selectedChoice]);

    const handleChoice = (index: number) => {
        setSelectedChoice(index);
        setIsPaused(true);
    };

    const handleNext = () => {
        setSelectedChoice(null);
        setIsPaused(false);
        setCurrentScenario((curr) => (curr + 1) % scenarios.length);
        setProgress(100);
    };

    const handleTryReal = () => {
        navigate('/auth');
    };

    return (
        <div className="pt-12 max-w-2xl mx-auto">
            {/* Scenario Card */}
            <div className="relative cyber-card border-cyber-green/20">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 rounded-t-lg overflow-hidden">
                    <div
                        className="h-full bg-cyber-green transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

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
                        <span className="text-xs text-muted-foreground">
                            {currentScenario + 1}/5
                        </span>
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
                        <div className="space-y-4">
                            {/* Feedback */}
                            <div className={`p-4 rounded-lg border ${isRisky ? 'bg-cyber-yellow/10 border-cyber-yellow/20' : 'bg-cyber-green/10 border-cyber-green/20'
                                }`}>
                                <p className={`text-sm font-medium ${isRisky ? 'text-cyber-yellow' : 'text-cyber-green'
                                    }`}>
                                    {isRisky
                                        ? t('demo.riskyFeedback', 'Так часто начинаются реальные случаи мошенничества')
                                        : t('demo.cautiousFeedback', 'Вы выбрали осторожную стратегию')
                                    }
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleNext}
                                    className="flex-1 px-4 py-2 rounded-lg border border-border hover:border-cyber-green/50 bg-background transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    {t('demo.nextScenario', 'Следующий сценарий')}
                                </button>
                                <button
                                    onClick={handleTryReal}
                                    className="flex-1 cyber-button text-sm py-2"
                                >
                                    {t('demo.tryReal', 'Реальные сценарии')}
                                </button>
                            </div>
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
