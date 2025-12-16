import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { BinaryBackground } from '../components/BinaryBackground';

export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const demoRef = useRef<HTMLElement>(null);

    const handleOptionClick = (optionId: string) => {
        setSelectedOption(optionId);
        setShowFeedback(true);
        setShowAnimation(true);
    };

    const resetDemo = () => {
        setSelectedOption(null);
        setShowFeedback(false);
    };

    const scrollToDemo = () => {
        demoRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOptionColor = (optionId: string) => {
        if (!showFeedback || selectedOption !== optionId) return 'border-border hover:border-cyber-green/50';

        const risk = t(`landing.demo.options.${optionId}.risk`);
        if (risk === 'safe') return 'border-cyber-green bg-cyber-green/10';
        if (risk === 'risky') return 'border-cyber-yellow bg-cyber-yellow/10';
        return 'border-cyber-red bg-cyber-red/10';
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            {/* Conditional Animated Binary Background */}
            {showAnimation && <BinaryBackground />}

            {/* Language Switcher - Top Right */}
            <div className="absolute top-6 right-6 w-48 z-50">
                <LanguageSwitcher />
            </div>

            {/* SCREEN 1 - VALUE PROPOSITION HERO */}
            <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                {/* Static gradient background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #0a1628 0%, #000000 100%)',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    {/* Grain texture overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat'
                        }}
                    />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
                    {/* QadamSafe Branding */}
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Shield className="w-12 h-12 text-cyber-green" />
                        <h1 className="text-5xl font-bold text-cyber-green">QadamSafe</h1>
                    </div>

                    {/* Tagline */}
                    <h2 className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
                        {t('landing.hero.tagline')}
                    </h2>

                    {/* Value Points */}
                    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="flex items-start gap-3 p-4 bg-background/40 rounded-lg border border-border/50">
                                <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                <p className="text-gray-200 text-base">
                                    {t(`landing.hero.valuePoint${num}`)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Trust Element */}
                    <p className="text-sm text-gray-400 max-w-xl mx-auto">
                        {t('landing.hero.trustElement')}
                    </p>

                    {/* CTA Button */}
                    <div className="space-y-3">
                        <button
                            onClick={scrollToDemo}
                            className="cyber-button text-xl px-12 py-5 inline-flex items-center gap-2 group"
                        >
                            {t('landing.hero.ctaButton')}
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-sm text-gray-400">
                            {t('landing.hero.timeIndicator')}
                        </p>
                    </div>
                </div>
            </section>

            {/* SCREEN 2 - DEMO SCENARIO */}
            <section ref={demoRef} className="min-h-screen flex items-center justify-center px-4 py-16 relative">
                <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
                    {/* Demo Header */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold text-cyber-green mb-2">
                            {t('landing.demo.header')}
                        </h3>
                        <p className="text-gray-400">
                            {t('landing.demo.context')}
                        </p>
                    </div>

                    {/* Interactive Demo Scenario */}
                    <div className="relative">
                        {/* Delivery message */}
                        <div className="cyber-border bg-background/80 rounded-lg p-5 text-left">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">📦</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm mb-1">
                                        {t('landing.demo.sender')}
                                    </p>
                                    <p className="text-gray-300 text-sm mb-2">
                                        {t('landing.demo.message')}
                                    </p>
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                                    >
                                        https://delivery-reschedule.kz/track/KZ-2847391
                                    </a>
                                </div>
                            </div>

                            {/* Question */}
                            <p className="text-white font-medium mb-3 text-base">
                                {t('landing.demo.question')}
                            </p>

                            {/* Options */}
                            <div className="space-y-2">
                                {['a', 'b', 'c'].map((optionId) => (
                                    <button
                                        key={optionId}
                                        onClick={() => handleOptionClick(optionId)}
                                        disabled={showFeedback}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${getOptionColor(optionId)} ${showFeedback ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                                            }`}
                                    >
                                        <p className="text-sm text-gray-200">
                                            {t(`landing.demo.options.${optionId}.text`)}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* Feedback */}
                            {showFeedback && selectedOption && (
                                <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border">
                                    <p className="text-sm text-gray-300 mb-3">
                                        {t(`landing.demo.options.${selectedOption}.feedback`)}
                                    </p>
                                    <button
                                        onClick={resetDemo}
                                        className="text-sm text-cyber-green hover:text-cyber-green/80 underline"
                                    >
                                        {t('landing.demo.tryAgain')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA after demo */}
                    <div className="mt-12 space-y-4">
                        <p className="text-lg text-gray-300">
                            {t('landing.hero.stat')}
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="cyber-button text-xl px-12 py-5 inline-flex items-center gap-2 group"
                        >
                            {t('landing.hero.cta')}
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="py-8 text-center text-sm text-gray-400 border-t border-border/30">
                © 2026 QadamSafe
            </div>
        </div>
    );
};