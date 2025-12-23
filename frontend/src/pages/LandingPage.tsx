import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Phone, MessageSquare, CheckCircle, ChevronDown, ChevronRight, Eye, AlertTriangle, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Footer } from '../components/Footer';
import { InteractiveDemo } from '../components/InteractiveDemo';

export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'what-you-learn', 'how-it-works', 'access', 'faq'];
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

    // Slides data for how-it-works carousel
    const howItWorksSlides = [
        { image: '/step1-scenario.png', step: 1 },
        { image: '/step2-decision.png', step: 2 },
        { image: '/step3-feedback-v2.png', step: 3 },
    ];

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % howItWorksSlides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [howItWorksSlides.length]);

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
                                className={`text-lg font-medium transition-colors ${activeSection === 'what-you-learn'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('landing.nav.whatYouLearn')}
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className={`text-lg font-medium transition-colors ${activeSection === 'how-it-works'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('landing.nav.howItWorks')}
                            </button>
                            <button
                                onClick={() => scrollToSection('access')}
                                className={`text-lg font-medium transition-colors ${activeSection === 'access'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('landing.nav.access')}
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className={`text-lg font-medium transition-colors ${activeSection === 'faq'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('landing.nav.faq')}
                            </button>
                        </div>

                        {/* Right side: CTA Buttons, Language Switcher & Mobile Menu Button */}
                        <div className="flex items-center gap-3">
                            {/* Desktop CTA Buttons */}
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:text-cyber-green transition-colors"
                                >
                                    {t('landing.nav.login')}
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-5 py-2 text-sm font-medium bg-cyber-green text-background rounded-md hover:bg-cyber-green/90 transition-all"
                                >
                                    {t('landing.nav.startFree')}
                                </button>
                            </div>

                            <LanguageSwitcher />

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
                            <div className="px-4 py-3 space-y-1">
                                <button
                                    onClick={() => {
                                        scrollToSection('what-you-learn');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    {t('landing.nav.whatYouLearn')}
                                </button>
                                <button
                                    onClick={() => {
                                        scrollToSection('how-it-works');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    {t('landing.nav.howItWorks')}
                                </button>
                                <button
                                    onClick={() => {
                                        scrollToSection('access');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    {t('landing.nav.access')}
                                </button>
                                <button
                                    onClick={() => {
                                        scrollToSection('faq');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    {t('landing.nav.faq')}
                                </button>

                                {/* Divider */}
                                <div className="border-t border-border my-2"></div>

                                {/* Mobile CTA Buttons */}
                                <button
                                    onClick={() => {
                                        navigate('/auth');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-foreground hover:text-cyber-green hover:bg-muted transition-colors"
                                >
                                    {t('landing.nav.login')}
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/auth');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full px-4 py-3 rounded-md text-sm font-medium bg-cyber-green text-background hover:bg-cyber-green/90 transition-all text-center"
                                >
                                    {t('landing.nav.startFree')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO Section */}
            <section id="hero" className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cyber-green/5" />

                {/* Animated threat icons */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <Mail className="absolute top-20 left-10 w-8 h-8 text-cyber-red animate-float" style={{ animationDelay: '0s' }} />
                    <Phone className="absolute top-40 right-20 w-6 h-6 text-cyber-yellow animate-float" style={{ animationDelay: '1s' }} />
                    <MessageSquare className="absolute bottom-40 left-20 w-7 h-7 text-cyber-red animate-float" style={{ animationDelay: '2s' }} />
                    <AlertTriangle className="absolute bottom-20 right-10 w-8 h-8 text-cyber-yellow animate-float" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    {/* Main heading */}
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-snug md:leading-tight max-w-3xl mx-auto">
                        {t('landing.hero.title')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('landing.hero.subtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="cyber-button text-lg px-8 py-4 inline-flex items-center gap-2 group"
                        >
                            {t('landing.hero.cta')}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => scrollToSection('what-you-learn')}
                            className="px-8 py-4 text-lg font-medium text-foreground border-2 border-border hover:border-cyber-green rounded-md transition-all"
                        >
                            {t('landing.hero.ctaSecondary')}
                        </button>
                    </div>

                    {/* Interactive Demo */}
                    <InteractiveDemo navigate={navigate} t={t} />
                </div>
            </section>

            {/* WHAT YOU LEARN Section */}
            <section id="what-you-learn" className="py-20 px-4 bg-background">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        {t('landing.whatYouLearn.title')}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card 1 */}
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg">
                                    <Eye className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                                        {t('landing.whatYouLearn.card1Title')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t('landing.whatYouLearn.card1Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg">
                                    <MessageSquare className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                                        {t('landing.whatYouLearn.card2Title')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t('landing.whatYouLearn.card2Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                                        {t('landing.whatYouLearn.card3Title')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t('landing.whatYouLearn.card3Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                                        {t('landing.whatYouLearn.card4Title')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t('landing.whatYouLearn.card4Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS Section */}
            <section id="how-it-works" className="py-20 px-4 bg-cyber-green/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
                        {t('landing.howItWorks.title')}
                    </h2>

                    <div className="relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Step 1 */}
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10">
                                        <Mail className="w-8 h-8 text-cyber-green" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-green text-background rounded-full flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t('landing.howItWorks.step1Title')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.howItWorks.step1Desc')}
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10">
                                        <CheckCircle className="w-8 h-8 text-cyber-green" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-green text-background rounded-full flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t('landing.howItWorks.step2Title')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.howItWorks.step2Desc')}
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10">
                                        <Shield className="w-8 h-8 text-cyber-green" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-green text-background rounded-full flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t('landing.howItWorks.step3Title')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.howItWorks.step3Desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image Carousel */}
                    <div className="mt-16">
                        <div className="relative max-w-4xl mx-auto">
                            {/* Main Image Container */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-cyber-green/30 bg-background/50 backdrop-blur-sm shadow-2xl shadow-cyber-green/10">
                                <div
                                    className="flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {howItWorksSlides.map((slide, index) => (
                                        <div
                                            key={index}
                                            className={`w-full flex-shrink-0 flex items-center justify-center bg-cyber-green/5 ${(slide.step === 2 || slide.step === 3) ? 'p-0' : 'p-8 md:p-12'}`}
                                        >
                                            <img
                                                src={slide.image}
                                                alt={`Step ${slide.step}`}
                                                className={`h-auto object-contain rounded-xl shadow-2xl border border-white/10 ${(slide.step === 2 || slide.step === 3) ? 'w-full' : 'w-full max-w-sm md:max-w-md'}`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Step indicator overlay */}
                                <div className="absolute top-4 left-4 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg border border-cyber-green/30">
                                    <span className="text-cyber-green font-bold text-lg">
                                        {t(`landing.howItWorks.step${currentSlide + 1}Title`)}
                                    </span>
                                </div>
                            </div>

                            {/* Dots Navigation */}
                            <div className="flex justify-center gap-3 mt-6">
                                {howItWorksSlides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                                            ? 'bg-cyber-green w-8'
                                            : 'bg-border hover:bg-cyber-green/50'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ACCESS Section */}
            <section id="access" className="py-20 px-4 bg-background">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        {t('landing.access.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free Access */}
                        <div className="cyber-card border-2">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-foreground">
                                    {t('landing.access.freeTitle')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.access.freeDesc')}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.freeFeature1')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.freeFeature2')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.freeFeature3')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Pro Access */}
                        <div className="cyber-card border-2 border-cyber-green bg-cyber-green/5 relative">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-cyber-green">
                                    {t('landing.access.proTitle')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.access.proDesc')}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.proFeature1')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.proFeature2')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.proFeature3')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.proFeature4')}</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={() => navigate('/subscription')}
                                    className="w-full cyber-button mt-4"
                                >
                                    {t('landing.access.proCta')}
                                </button>
                            </div>
                        </div>

                        {/* Business Access */}
                        <div className="cyber-card border-2 border-cyber-green bg-cyber-green/5">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-cyber-green">
                                    {t('landing.access.businessTitle')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('landing.access.businessDesc')}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.businessFeature1')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.businessFeature2')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.businessFeature3')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{t('landing.access.businessFeature4')}</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={() => navigate('/subscription')}
                                    className="w-full cyber-button mt-4"
                                >
                                    {t('landing.access.businessCta')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-4 bg-cyber-green/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        {t('landing.faq.title')}
                    </h2>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((index) => (
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
                                    <p className="mt-4 text-muted-foreground leading-relaxed">
                                        {t(`landing.faq.a${index}`)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Add custom animation styles */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};