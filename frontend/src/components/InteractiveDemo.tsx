import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, MessageSquare } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any; // Translation function from react-i18next
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ navigate, t }) => {
    const [choice, setChoice] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Risky choices: 1 (transfer money)
    const riskyChoices = [1];

    const handleChoice = (choiceNum: number) => {
        setChoice(choiceNum);
        setShowResult(true);
    };

    const handleReset = () => {
        setChoice(null);
        setShowResult(false);
    };

    const handleTryReal = () => {
        navigate('/auth');
    };

    const isRisky = choice !== null && riskyChoices.includes(choice);

    return (
        <div className="pt-12 max-w-2xl mx-auto">
            {/* Demo Card */}
            <div
                className={`relative cyber-card transition-all duration-500 ${showResult && isRisky ? 'bg-cyber-yellow/5 border-cyber-yellow/30' :
                        showResult && !isRisky ? 'bg-cyber-green/5 border-cyber-green/30' :
                            'border-cyber-green/20'
                    }`}
            >
                {/* Shield Icon */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className={`p-3 rounded-full border-2 bg-background transition-all duration-500 ${showResult && isRisky ? 'border-cyber-yellow/50' :
                            showResult && !isRisky ? 'border-cyber-green shadow-[0_0_20px_rgba(0,255,65,0.3)]' :
                                'border-cyber-green/30'
                        }`}>
                        {showResult && isRisky ? (
                            <ShieldAlert className="w-8 h-8 text-cyber-yellow" />
                        ) : showResult && !isRisky ? (
                            <ShieldCheck className="w-8 h-8 text-cyber-green" />
                        ) : (
                            <Shield className="w-8 h-8 text-cyber-green" />
                        )}
                    </div>
                </div>

                <div className="pt-8">
                    {/* Message Card - Messenger Style */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3 mb-3">
                            <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    {t('demo.contact', 'Неизвестный номер')}
                                </p>
                                <p className="text-xs text-muted-foreground">+7 (XXX) XXX-XX-XX</p>
                            </div>
                        </div>
                        <div className="pl-8">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                {t('demo.message', 'Сынок, привет. Пишу с чужого номера — мой телефон сел.\nЯ в поликлинике, можешь срочно перевести 20 000₸?\nЯ потом объясню.')}
                            </p>
                        </div>
                    </div>

                    {/* Choices or Result */}
                    {!showResult ? (
                        <>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                {t('demo.question', 'Что вы сделаете?')}
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => handleChoice(1)}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice1', 'Переведу деньги — ситуация жизненная')}
                                </button>
                                <button
                                    onClick={() => handleChoice(2)}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice2', 'Попрошу голосовое сообщение')}
                                </button>
                                <button
                                    onClick={() => handleChoice(3)}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice3', 'Задам вопрос, который знает только мама')}
                                </button>
                                <button
                                    onClick={() => handleChoice(4)}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice4', 'Перезвоню на её обычный номер')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Result Message */}
                            <div className={`p-4 rounded-lg ${isRisky ? 'bg-cyber-yellow/10 border border-cyber-yellow/20' : 'bg-cyber-green/10 border border-cyber-green/20'
                                }`}>
                                <p className={`font-medium text-sm mb-2 ${isRisky ? 'text-cyber-yellow' : 'text-cyber-green'
                                    }`}>
                                    {isRisky
                                        ? t('demo.riskyTitle', 'Так часто начинаются реальные случаи мошенничества')
                                        : t('demo.cautiousTitle', 'Вы выбрали осторожную стратегию')
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isRisky
                                        ? t('demo.riskyDesc', 'Мошенники используют эмоции и срочность, чтобы вы действовали быстро')
                                        : t('demo.cautiousDesc', 'Проверка источника — важный навык цифровой безопасности')
                                    }
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-2 rounded-lg border border-border hover:border-cyber-green/50 bg-background transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    {t('demo.tryAgain', 'Попробовать снова')}
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
                </div>
            </div>

            {/* Hint */}
            {!showResult && (
                <p className="text-xs text-muted-foreground text-center mt-4 opacity-60">
                    {t('demo.hint', 'Это демонстрация. Попробуйте разные варианты')}
                </p>
            )}
        </div>
    );
};
