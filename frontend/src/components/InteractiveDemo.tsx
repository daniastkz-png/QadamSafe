import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any; // Translation function from react-i18next
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ navigate, t }) => {
    const [choice, setChoice] = useState<'safe' | 'unsafe' | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleChoice = (isSafe: boolean) => {
        setChoice(isSafe ? 'safe' : 'unsafe');
        setShowResult(true);
    };

    const handleReset = () => {
        setChoice(null);
        setShowResult(false);
    };

    const handleTryReal = () => {
        navigate('/auth');
    };

    return (
        <div className="pt-12 max-w-2xl mx-auto">
            {/* Demo Card */}
            <div
                className={`relative cyber-card transition-all duration-500 ${choice === 'unsafe' ? 'bg-cyber-red/5 border-cyber-red/30' :
                    choice === 'safe' ? 'bg-cyber-green/5 border-cyber-green/30' :
                        'border-cyber-green/20'
                    }`}
            >
                {/* Shield Icon */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className={`p-3 rounded-full border-2 bg-background transition-all duration-500 ${choice === 'unsafe' ? 'border-cyber-red/50 opacity-40' :
                        choice === 'safe' ? 'border-cyber-green shadow-[0_0_20px_rgba(0,255,65,0.3)]' :
                            'border-cyber-green/30'
                        }`}>
                        {choice === 'unsafe' ? (
                            <ShieldAlert className="w-8 h-8 text-cyber-red" />
                        ) : choice === 'safe' ? (
                            <ShieldCheck className="w-8 h-8 text-cyber-green" />
                        ) : (
                            <Shield className="w-8 h-8 text-cyber-green" />
                        )}
                    </div>
                </div>

                <div className="pt-8">
                    {/* Message Card */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    {t('demo.sender', 'Неизвестный отправитель')}
                                </p>
                                <p className="text-xs text-muted-foreground">support@bank-security.com</p>
                            </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                            {t('demo.message', 'Срочно! Ваш счёт заблокирован. Для разблокировки перейдите по ссылке и подтвердите данные в течение 24 часов.')}
                        </p>
                    </div>

                    {/* Choices or Result */}
                    {!showResult ? (
                        <>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                {t('demo.question', 'Что вы сделаете?')}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleChoice(false)}
                                    className="px-4 py-3 rounded-lg border-2 border-border hover:border-cyber-red/50 bg-background hover:bg-cyber-red/5 transition-all text-sm font-medium text-foreground"
                                >
                                    {t('demo.reply', 'Ответить')}
                                </button>
                                <button
                                    onClick={() => handleChoice(true)}
                                    className="px-4 py-3 rounded-lg border-2 border-cyber-green/30 hover:border-cyber-green bg-background hover:bg-cyber-green/10 transition-all text-sm font-medium text-cyber-green"
                                >
                                    {t('demo.verify', 'Проверить источник')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Result Message */}
                            <div className={`flex items-center gap-3 p-4 rounded-lg ${choice === 'unsafe' ? 'bg-cyber-red/10' : 'bg-cyber-green/10'
                                }`}>
                                {choice === 'unsafe' ? (
                                    <AlertTriangle className="w-6 h-6 text-cyber-red flex-shrink-0" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-cyber-green flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${choice === 'unsafe' ? 'text-cyber-red' : 'text-cyber-green'
                                        }`}>
                                        {choice === 'unsafe'
                                            ? t('demo.unsafeTitle', 'Так действуют мошенники')
                                            : t('demo.safeTitle', 'Безопасное решение')
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {choice === 'unsafe'
                                            ? t('demo.unsafeDesc', 'Фишинговые письма создают срочность, чтобы вы действовали необдуманно')
                                            : t('demo.safeDesc', 'Всегда проверяйте источник перед тем, как предоставлять данные')
                                        }
                                    </p>
                                </div>
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
                    {t('demo.hint', 'Это демонстрация. Попробуйте оба варианта')}
                </p>
            )}
        </div>
    );
};
