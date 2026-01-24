import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Globe, MousePointer2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PhishingSimulation: React.FC = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    // Animation sequence
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 6); // 6 steps loop
        }, 2500); // 2.5s per step
        return () => clearInterval(interval);
    }, []);

    // Helper to determine simulation state
    const isTyping = step === 1;
    const isHovering = step === 2;
    const isAttackDetected = step >= 3;

    return (
        <div className="w-full max-w-md mx-auto perspective-1000">
            {/* Main Window Frame */}
            <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:rotate-y-2 hover:scale-[1.02]">

                {/* Browser Header */}
                <div className="bg-muted/50 border-b border-border p-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>

                    {/* Fake Address Bar */}
                    <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-colors duration-500 ${isAttackDetected ? 'bg-red-500/10 text-red-500' : 'bg-background text-muted-foreground'}`}>
                        <Globe className="w-3 h-3" />
                        <span className="opacity-50">https://</span>
                        <span className={isAttackDetected ? 'font-bold' : ''}>
                            securre-bank.com
                        </span>
                        <span className="opacity-50">/login</span>
                        {isAttackDetected && <AlertTriangle className="w-3 h-3 ml-auto animate-pulse" />}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-4 relative">

                    {/* Brand Logo/Placeholder */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground font-medium">{t('landing.phishingSimulation.emailLabel')}</label>
                            <div className="h-9 w-full bg-muted/30 rounded border border-border px-3 flex items-center text-sm">
                                <span className="text-foreground">victim@email.com</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground font-medium">{t('landing.phishingSimulation.passwordLabel')}</label>
                            <div className="h-9 w-full bg-muted/30 rounded border border-border px-3 flex items-center">
                                <div className="flex gap-1">
                                    {isTyping || step > 1 ? (
                                        Array(8).fill(0).map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                        ))
                                    ) : (
                                        <div className="w-0.5 h-5 bg-primary/50 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className={`mt-6 h-10 w-full rounded flex items-center justify-center text-sm font-medium transition-all duration-300 ${isAttackDetected
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : isHovering
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                        {isAttackDetected ? (
                            <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {t('landing.phishingSimulation.blocked')}
                            </span>
                        ) : (
                            t('landing.phishingSimulation.logIn')
                        )}
                    </div>

                    {/* Simulated Cursor */}
                    <div
                        className="absolute pointer-events-none transition-all duration-[2000ms] ease-in-out z-20"
                        style={{
                            top: step === 0 ? '60%' : step === 1 ? '55%' : step === 2 ? '75%' : '75%',
                            left: step === 0 ? '80%' : step === 1 ? '70%' : step === 2 ? '50%' : '50%',
                            opacity: step > 3 ? 0 : 1
                        }}
                    >
                        <MousePointer2 className="w-6 h-6 text-foreground fill-foreground drop-shadow-lg" />
                    </div>

                    {/* Alert Overlay */}
                    {isAttackDetected && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-3 animate-bounce">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h4 className="text-lg font-bold text-red-500 mb-1">{t('landing.phishingSimulation.warningTitle')}</h4>
                            <p className="text-xs text-muted-foreground">
                                {t('landing.phishingSimulation.warningText')} <span className="font-mono text-foreground">securre-bank.com</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Status Bar */}
                <div className="bg-muted/30 p-2 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>{t('landing.phishingSimulation.guardActive')}</span>
                    <div className="flex gap-1.5 items-center">
                        <div className={`w-2 h-2 rounded-full ${isAttackDetected ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                        {isAttackDetected ? t('landing.phishingSimulation.threatFound') : t('landing.phishingSimulation.monitoring')}
                    </div>
                </div>
            </div>

            {/* Reflection/Shadow effect for realism */}
            <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full" />
        </div>
    );
};
