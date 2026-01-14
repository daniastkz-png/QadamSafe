import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Shield, Mail, MessageSquare, CheckCircle, ChevronDown, ChevronRight,
    Eye, AlertTriangle, Menu, X, Users, GraduationCap, Building2,
    ArrowRight, Star, Award, Clock, Sparkles
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Footer } from '../components/Footer';
import { InteractiveDemo } from '../components/InteractiveDemo';

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({
    end,
    suffix = '',
    duration = 2000
}) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

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
        setMobileMenuOpen(false);
    };

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'social-proof', 'what-you-learn', 'who-its-for', 'how-it-works', 'pricing', 'faq'];
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
                                className={`text-sm font-medium transition-all duration-300 ${activeSection === 'what-you-learn'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-cyber-green'
                                    }`}
                            >
                                {t('landing.nav.whatYouLearn')}
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
                                onClick={() => scrollToSection('pricing')}
                                className={`text-sm font-medium transition-all duration-300 ${activeSection === 'pricing'
                                    ? 'text-cyber-green'
                                    : 'text-muted-foreground hover:text-cyber-green'
                                    }`}
                            >
                                {t('landing.nav.access')}
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
                            {['what-you-learn', 'how-it-works', 'pricing', 'faq'].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => scrollToSection(section)}
                                    className="block w-full text-left px-4 py-3 rounded-lg text-lg font-medium text-muted-foreground hover:text-cyber-green hover:bg-cyber-green/5 transition-all"
                                >
                                    {t(`landing.nav.${section === 'pricing' ? 'access' : section.replace('-', '')}`)}
                                </button>
                            ))}
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

            {/* HERO Section */}
            <section id="hero" className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cyber-green/5" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    {/* Main heading */}
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-snug md:leading-tight max-w-3xl mx-auto">
                        {t('landing.hero.title')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('landing.hero.subtitle')}
                    </p>

                    {/* Urgency element */}
                    <div className="flex items-center justify-center gap-2 text-cyber-yellow">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm md:text-base font-medium">
                            {t('landing.urgency', '🔥 Каждый день 300+ казахстанцев становятся жертвами мошенников')}
                        </span>
                    </div>

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

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF Section */}
            <section id="social-proof" className="py-16 px-4 bg-cyber-green/5 border-y border-cyber-green/20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {/* Stat 1 */}
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-cyber-green">
                                <AnimatedCounter end={500} suffix="+" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('landing.socialProof.users', 'пользователей обучено')}
                            </p>
                        </div>

                        {/* Stat 2 */}
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-cyber-green">
                                <AnimatedCounter end={15} suffix="+" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('landing.socialProof.schools', 'школ и организаций')}
                            </p>
                        </div>

                        {/* Stat 3 */}
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-cyber-green">
                                <AnimatedCounter end={95} suffix="%" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('landing.socialProof.satisfaction', 'довольных пользователей')}
                            </p>
                        </div>

                        {/* Stat 4 */}
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-cyber-green">
                                <AnimatedCounter end={2000} suffix="+" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('landing.socialProof.scenarios', 'сценариев пройдено')}
                            </p>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-12 pt-8 border-t border-border/50">
                        <p className="text-center text-sm text-muted-foreground mb-6">
                            {t('landing.socialProof.trustedBy', 'Нам доверяют образовательные учреждения Казахстана')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                            <div className="flex items-center gap-2 text-foreground">
                                <GraduationCap className="w-6 h-6" />
                                <span className="font-medium">NIS</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                                <Building2 className="w-6 h-6" />
                                <span className="font-medium">SDU</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                                <GraduationCap className="w-6 h-6" />
                                <span className="font-medium">Astana IT</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                                <Building2 className="w-6 h-6" />
                                <span className="font-medium">KBTU</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT YOU LEARN Section */}
            <section id="what-you-learn" className="py-20 px-4 bg-background">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
                        {t('landing.whatYouLearn.title')}
                    </h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        {t('landing.whatYouLearn.subtitle', 'Практические навыки защиты от современных цифровых угроз')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card 1 */}
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg group-hover:bg-cyber-green/20 transition-colors">
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
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg group-hover:bg-cyber-green/20 transition-colors">
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
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg group-hover:bg-cyber-green/20 transition-colors">
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
                        <div className="cyber-card group hover:border-cyber-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-green/10 rounded-lg group-hover:bg-cyber-green/20 transition-colors">
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

            {/* WHO IT'S FOR Section */}
            <section id="who-its-for" className="py-20 px-4 bg-cyber-green/5">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
                        {t('landing.whoItsFor.title', 'Кому подходит QadamSafe')}
                    </h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        {t('landing.whoItsFor.subtitle', 'Платформа создана для тех, кто хочет защитить себя и близких')}
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Students */}
                        <div className="relative group">
                            <div className="cyber-card h-full border-2 border-transparent hover:border-cyber-green/50 transition-all duration-300">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyber-green/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-10 h-10 text-cyber-green" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {t('landing.whoItsFor.students.title', 'Школьники и студенты')}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {t('landing.whoItsFor.students.desc', '7-25 лет — самая уязвимая возрастная группа для онлайн-мошенничества')}
                                    </p>
                                    <ul className="text-left space-y-2 pt-4">
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.students.benefit1', 'Научатся распознавать фишинг')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.students.benefit2', 'Защитят личные данные')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.students.benefit3', 'Избегут потери денег')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Parents */}
                        <div className="relative group">
                            <div className="cyber-card h-full border-2 border-cyber-green/30 bg-cyber-green/5 hover:border-cyber-green/50 transition-all duration-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 bg-cyber-green text-background text-xs font-bold rounded-full">
                                        {t('landing.whoItsFor.popular', 'Популярно')}
                                    </span>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyber-green/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-10 h-10 text-cyber-green" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {t('landing.whoItsFor.parents.title', 'Родители')}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {t('landing.whoItsFor.parents.desc', 'Хотят защитить детей от мошенников и сами научиться кибербезопасности')}
                                    </p>
                                    <ul className="text-left space-y-2 pt-4">
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.parents.benefit1', 'Научите детей безопасности')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.parents.benefit2', 'Защитите семейный бюджет')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.parents.benefit3', 'Будьте спокойны за близких')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Schools */}
                        <div className="relative group">
                            <div className="cyber-card h-full border-2 border-transparent hover:border-cyber-green/50 transition-all duration-300">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyber-green/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Building2 className="w-10 h-10 text-cyber-green" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {t('landing.whoItsFor.schools.title', 'Школы и организации')}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {t('landing.whoItsFor.schools.desc', 'Современная программа по цифровой грамотности для учеников')}
                                    </p>
                                    <ul className="text-left space-y-2 pt-4">
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.schools.benefit1', 'Готовые учебные материалы')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.schools.benefit2', 'Статистика прогресса')}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                                            {t('landing.whoItsFor.schools.benefit3', 'Сертификаты для учеников')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Before/After */}
                    <div className="mt-16 grid md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-cyber-red/10 border border-cyber-red/30">
                            <h3 className="text-lg font-bold text-cyber-red mb-4 flex items-center gap-2">
                                <X className="w-5 h-5" />
                                {t('landing.results.before', 'До обучения')}
                            </h3>
                            <ul className="space-y-3 text-foreground">
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-red">❌</span>
                                    {t('landing.results.before1', 'Кликают на подозрительные ссылки')}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-red">❌</span>
                                    {t('landing.results.before2', 'Делятся кодами из SMS')}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-red">❌</span>
                                    {t('landing.results.before3', 'Верят «службе безопасности банка»')}
                                </li>
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-cyber-green/10 border border-cyber-green/30">
                            <h3 className="text-lg font-bold text-cyber-green mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                {t('landing.results.after', 'После обучения')}
                            </h3>
                            <ul className="space-y-3 text-foreground">
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-green">✅</span>
                                    {t('landing.results.after1', 'Распознают 95% мошеннических схем')}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-green">✅</span>
                                    {t('landing.results.after2', 'Проверяют источники информации')}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-cyber-green">✅</span>
                                    {t('landing.results.after3', 'Защищают личные данные')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS Section */}
            <section id="how-it-works" className="py-20 px-4 bg-background">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
                        {t('landing.howItWorks.title')}
                    </h2>

                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Step 1 */}
                            <div className="text-center space-y-4 group">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10 group-hover:bg-cyber-green/20 transition-colors">
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
                            <div className="text-center space-y-4 group">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10 group-hover:bg-cyber-green/20 transition-colors">
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
                            <div className="text-center space-y-4 group">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-cyber-green/10 border-2 border-cyber-green rounded-full flex items-center justify-center mx-auto relative z-10 group-hover:bg-cyber-green/20 transition-colors">
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

                                <div className="absolute top-4 left-4 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg border border-cyber-green/30">
                                    <span className="text-cyber-green font-bold text-lg">
                                        {t(`landing.howItWorks.step${currentSlide + 1}Title`)}
                                    </span>
                                </div>
                            </div>

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

            {/* PRICING Section */}
            <section id="pricing" className="py-20 px-4 bg-cyber-green/5">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
                        {t('landing.access.title')}
                    </h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        {t('landing.pricing.subtitle', 'Выберите подходящий план для вашего обучения')}
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free */}
                        <div className="cyber-card border-2 relative group hover:border-cyber-green/30 transition-all">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {t('landing.access.freeTitle')}
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-bold text-foreground">0 ₸</span>
                                        <span className="text-muted-foreground">/{t('subscription.perMonth', 'мес')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('landing.access.freeDesc')}
                                    </p>
                                </div>

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

                                <button
                                    onClick={() => navigate('/auth')}
                                    className="w-full py-3 rounded-lg border-2 border-cyber-green text-cyber-green font-medium hover:bg-cyber-green/10 transition-all"
                                >
                                    {t('landing.nav.startFree')}
                                </button>
                            </div>
                        </div>

                        {/* Pro */}
                        <div className="cyber-card border-2 border-cyber-green bg-cyber-green/5 relative group shadow-[0_0_40px_rgba(0,255,65,0.15)]">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="px-4 py-1.5 bg-cyber-green text-background text-sm font-bold rounded-full flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    {t('landing.pricing.popular', 'Популярный')}
                                </span>
                            </div>
                            <div className="space-y-6 pt-2">
                                <div>
                                    <h3 className="text-2xl font-bold text-cyber-green">
                                        {t('landing.access.proTitle')}
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-bold text-foreground">4 900 ₸</span>
                                        <span className="text-muted-foreground">/{t('subscription.perMonth', 'мес')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('landing.access.proDesc')}
                                    </p>
                                </div>

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
                                        <Sparkles className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground font-medium">{t('landing.pricing.aiScenarios', 'ИИ-сценарии')}</span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => navigate('/auth')}
                                    className="w-full cyber-button py-3"
                                >
                                    {t('landing.access.proCta')}
                                </button>
                            </div>
                        </div>

                        {/* Business */}
                        <div className="cyber-card border-2 relative group hover:border-cyber-green/30 transition-all">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {t('landing.access.businessTitle')}
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-bold text-foreground">9 900 ₸</span>
                                        <span className="text-muted-foreground">/{t('subscription.perMonth', 'мес')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('landing.access.businessDesc')}
                                    </p>
                                </div>

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
                                        <Award className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground font-medium">{t('landing.pricing.certificates', 'Сертификаты')}</span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => navigate('/auth')}
                                    className="w-full py-3 rounded-lg border-2 border-cyber-green text-cyber-green font-medium hover:bg-cyber-green/10 transition-all"
                                >
                                    {t('landing.access.businessCta')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Feature comparison */}
                    <div className="mt-12 p-6 rounded-2xl bg-background border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-6 text-center">
                            {t('landing.pricing.compare', 'Сравнение тарифов')}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">{t('landing.pricing.feature', 'Функция')}</th>
                                        <th className="text-center py-3 px-4 text-foreground font-medium">Free</th>
                                        <th className="text-center py-3 px-4 text-cyber-green font-medium">Pro</th>
                                        <th className="text-center py-3 px-4 text-foreground font-medium">Business</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 px-4 text-foreground">{t('landing.pricing.basicScenarios', 'Базовые сценарии')}</td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 px-4 text-foreground">{t('landing.pricing.allScenarios', 'Все сценарии')}</td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 px-4 text-foreground">{t('landing.pricing.aiScenarios', 'ИИ-сценарии')}</td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td className="py-3 px-4 text-foreground">{t('landing.pricing.teamManagement', 'Управление командой')}</td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-foreground">{t('landing.pricing.certificates', 'Сертификаты')}</td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                                        <td className="text-center py-3 px-4"><CheckCircle className="w-5 h-5 text-cyber-green mx-auto" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-4 bg-background">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        {t('landing.faq.title')}
                    </h2>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
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
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-cyber-green/10 to-background">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        {t('landing.finalCta.title', 'Готовы защитить себя от мошенников?')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('landing.finalCta.subtitle', 'Начните бесплатное обучение прямо сейчас. Регистрация занимает 1 минуту.')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="cyber-button text-lg px-10 py-4 inline-flex items-center gap-2 group"
                        >
                            {t('landing.hero.cta')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('landing.finalCta.noCard', 'Без привязки карты • Отмена в любой момент')}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* CSS Animations */}
            <style>{`
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
            `}</style>
        </div>
    );
};