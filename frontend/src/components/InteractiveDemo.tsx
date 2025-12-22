import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface InteractiveDemoProps {
    navigate: (path: string) => void;
    t: any; // Translation function from react-i18next
}

// WhatsApp Icon Component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

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
                        <WhatsAppIcon className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
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
