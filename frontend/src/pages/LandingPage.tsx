import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Shield, ChevronDown,
    Eye, Menu, X, GraduationCap,
    ArrowRight, Sparkles
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Footer } from '../components/Footer';



export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'social-proof', 'what-you-learn', 'who-its-for', 'how-it-works', 'pricing', 'faq', 'testimonials'];
            const scrollPosition = window.scrollY + 100;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-cyber-green" />
                            <span className="text-xl font-bold text-cyber-green">QadamSafe</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection('what-you-learn')}
                                className={`text-sm font-medium transition-all duration-300 ${activeSection === 'what-you-learn'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-cyber-green'
                                    }`}
                            >
                                {t('landing.nav.features')}
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className={`text-sm font-medium transition-all duration-300 ${activeSection === 'how-it-works'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-cyber-green'
                                    }`}
                            >
                                {t('landing.nav.howItWorks')}
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className={`text-sm font-medium transition-all duration-300 ${activeSection === 'faq'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-cyber-green'
                                    }`}
                            >
                                {t('landing.nav.faq')}
                            </button>
                        </div>

                        {/* Right side: CTA Buttons & Language */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-5 py-2 text-sm font-medium bg-cyber-green text-background rounded-md hover:bg-cyber-green/90 transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                                >
                                    {t('landing.nav.startFree')}
                                </button>
                            </div>

                            <LanguageSwitcher direction="down" />

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-cyber-green hover:bg-cyber-green/10 rounded-lg transition-all"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-7 h-7" />
                                ) : (
                                    <Menu className="w-7 h-7" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-card border-l border-border shadow-2xl flex flex-col p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-cyber-green" />
                                <span className="text-lg font-bold text-cyber-green">QadamSafe</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2">
                            <button
                                onClick={() => scrollToSection('what-you-learn')}
                                className="block w-full text-left px-4 py-3 rounded-lg text-lg font-medium text-muted-foreground hover:text-cyber-green hover:bg-cyber-green/5 transition-all"
                            >
                                {t('landing.nav.features')}
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="block w-full text-left px-4 py-3 rounded-lg text-lg font-medium text-muted-foreground hover:text-cyber-green hover:bg-cyber-green/5 transition-all"
                            >
                                {t('landing.nav.howItWorks')}
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="block w-full text-left px-4 py-3 rounded-lg text-lg font-medium text-muted-foreground hover:text-cyber-green hover:bg-cyber-green/5 transition-all"
                            >
                                {t('landing.nav.faq')}
                            </button>
                        </div>

                        <div className="pt-6 mt-6 border-t border-border">
                            <button
                                onClick={() => {
                                    navigate('/auth');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold bg-cyber-green text-background rounded-lg hover:bg-cyber-green/90 transition-all"
                            >
                                {t('landing.nav.startFree')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO Section - Minimalist */}
            <section id="hero" className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cyber-green/3" />

                {/* Animated grid pattern (subtle) */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

                    {/* Animated Shield Icon */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border border-cyber-green/20 animate-[spin_20s_linear_infinite]">
                            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-cyber-green/50 rounded-full" />
                            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-cyber-red/50 rounded-full" />
                            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-cyber-green/50 rounded-full" />
                        </div>
                        {/* Inner pulsing circle */}
                        <div className="absolute inset-4 rounded-full bg-cyber-green/5 animate-pulse" />
                        {/* Shield icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-16 h-16 text-cyber-green" />
                        </div>
                    </div>

                    {/* Main heading - Clean and bold */}
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                        {t('landing.hero.title')}
                        <br />
                        <span className="text-cyber-green">{t('landing.hero.titleHighlight')}</span>
                    </h1>

                    {/* Subtitle - One clear sentence */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('landing.hero.subtitle')}
                    </p>

                    {/* Single CTA Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold bg-cyber-green text-background rounded-lg hover:bg-cyber-green/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]"
                        >
                            <Shield className="w-5 h-5" />
                            {t('landing.hero.cta')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Subtle trust indicator */}
                    <p className="text-sm text-muted-foreground/60 pt-4">
                        {t('landing.hero.trustIndicator')}
                    </p>
                </div>
            </section>

            {/* MISSION Section - Honest & Minimal */}
            <section id="social-proof" className="py-16 px-4 border-y border-border/50">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        {t('landing.mission.text')}
                        <span className="text-foreground font-medium"> {t('landing.mission.highlight1')} </span>
                        и
                        <span className="text-foreground font-medium"> {t('landing.mission.highlight2')}</span>
                    </p>

                    <div className="flex items-center justify-center gap-8 mt-8 text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyber-green" />
                            <span className="text-sm">{t('landing.mission.free')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyber-green" />
                            <span className="text-sm">{t('landing.mission.ai')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-cyber-green" />
                            <span className="text-sm">{t('landing.mission.allAges')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES Section - Minimalist 3 Points */}
            <section id="what-you-learn" className="py-24 px-4 bg-background">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
                        {t('landing.features.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-cyber-green/10 rounded-2xl flex items-center justify-center">
                                <Eye className="w-8 h-8 text-cyber-green" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                                {t('landing.features.threat.title')}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t('landing.features.threat.desc')}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-cyber-green/10 rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8 text-cyber-green" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                                {t('landing.features.simulation.title')}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t('landing.features.simulation.desc')}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-cyber-green/10 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-cyber-green" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                                {t('landing.features.ai.title')}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t('landing.features.ai.desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* HOW IT WORKS Section - Simplified */}
            <section id="how-it-works" className="py-24 px-4 bg-cyber-green/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
                        {t('landing.howItWorks.title')}
                    </h2>

                    {/* 3 Steps - Horizontal */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-16">
                        {/* Step 1 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyber-green text-background rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <span className="text-foreground font-medium">{t('landing.howItWorks.step1')}</span>
                        </div>

                        <ArrowRight className="hidden md:block w-6 h-6 text-muted-foreground" />
                        <ChevronDown className="md:hidden w-6 h-6 text-muted-foreground" />

                        {/* Step 2 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyber-green text-background rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <span className="text-foreground font-medium">{t('landing.howItWorks.step2')}</span>
                        </div>

                        <ArrowRight className="hidden md:block w-6 h-6 text-muted-foreground" />
                        <ChevronDown className="md:hidden w-6 h-6 text-muted-foreground" />

                        {/* Step 3 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyber-green text-background rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <span className="text-foreground font-medium">{t('landing.howItWorks.step3')}</span>
                        </div>
                    </div>

                    {/* Single Screenshot */}
                    <div className="relative max-w-3xl mx-auto">
                        <div className="rounded-2xl border border-border/50 overflow-hidden shadow-2xl shadow-cyber-green/10">
                            <img
                                src="/step2-decision.png"
                                alt="Пример симуляции мошенничества в QadamSafe"
                                className="w-full h-auto"
                            />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            {t('landing.howItWorks.imageCaption')}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section - Simple */}
            <section className="py-20 px-4 bg-background">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        {t('landing.cta.title')}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {t('landing.cta.subtitle')}
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-cyber-green text-background rounded-lg hover:bg-cyber-green/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]"
                    >
                        <Shield className="w-5 h-5" />
                        {t('landing.cta.button')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* FAQ Section - Simplified */}
            <section id="faq" className="py-20 px-4 bg-cyber-green/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        {t('landing.faq.title')}
                    </h2>


                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((index) => (
                            <div
                                key={index}
                                className="cyber-card cursor-pointer transition-all duration-300 hover:border-cyber-green/50"
                                onClick={() => toggleFaq(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground pr-4">
                                        {t(`landing.faq.q${index}`)}
                                    </h3>
                                    <ChevronDown
                                        className={`w-5 h-5 text-cyber-green flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                                {openFaq === index && (
                                    <p className="mt-4 text-muted-foreground leading-relaxed animate-fadeIn">
                                        {t(`landing.faq.a${index}`)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div >
            </section >

            {/* Footer */}
            < Footer />

            {/* CSS Animations */}
            < style > {`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style >
        </div >
    );
};