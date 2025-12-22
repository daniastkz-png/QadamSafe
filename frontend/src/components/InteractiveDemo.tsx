import React, { useState, useEffect } from 'react';
import { MessageSquare, Mic } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any; // Translation function from react-i18next
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ navigate, t }) => {
    const [isTyping, setIsTyping] = useState(true);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // Show typing indicator for 2 seconds
        const typingTimer = setTimeout(() => {
            setIsTyping(false);
            setShowMessage(true);
        }, 2000);

        return () => clearTimeout(typingTimer);
    }, []);

    return (
        <div className="pt-12 max-w-2xl mx-auto">
            {/* Message Card */}
            <div className="relative cyber-card border-cyber-green/20">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                        <MessageSquare className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                                {t('demo.contact', 'Неизвестный номер')}
                            </p>
                            <p className="text-xs text-muted-foreground">+7 (XXX) XXX-XX-XX</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {t('demo.justNow', 'Только что')}
                        </span>
                    </div>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-2 py-2 animate-fade-in">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-cyber-green/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-cyber-green/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-cyber-green/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {t('demo.typing', 'Печатает...')}
                            </span>
                        </div>
                    )}

                    {/* Message Content */}
                    {showMessage && (
                        <div className="space-y-4 animate-slide-fade-in">
                            {/* Text Message */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                    {t('demo.message', 'Сынок, привет. Пишу с чужого номера — мой телефон сел.\nЯ сейчас в поликлинике, можешь срочно перевести 20 000₸?\nЯ потом объясню.')}
                                </p>
                            </div>

                            {/* Voice Message Indicator */}
                            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                                <div className="p-2 bg-cyber-green/10 rounded-full">
                                    <Mic className="w-4 h-4 text-cyber-green" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">
                                        {t('demo.voiceNote', 'Голосовое сообщение')}
                                    </p>
                                    <p className="text-sm text-foreground mt-0.5">
                                        {t('demo.voiceFamiliar', 'Голос звучит знакомо')}
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground">0:15</div>
                            </div>

                            {/* Question */}
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground text-center mb-3">
                                    {t('demo.question', 'Что вы сделаете?')}
                                </p>
                            </div>

                            {/* Choice Buttons */}
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice1', 'Переведу деньги — ситуация жизненная')}
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice2', 'Попрошу голосовое сообщение')}
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice3', 'Задам вопрос, который знает только мама')}
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-3 rounded-lg border border-border hover:border-cyber-green/50 bg-background hover:bg-muted/30 transition-all text-sm font-medium text-foreground text-left"
                                >
                                    {t('demo.choice4', 'Перезвоню на её обычный номер')}
                                </button>
                            </div>

                            {/* Disclaimer */}
                            <div className="pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                    {t('demo.hint', 'Сценарий основан на реальных случаях мошенничества в Казахстане.\nФормулировки адаптированы в образовательных целях.')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes slide-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-fade-in {
                    animation: slide-fade-in 0.6s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
