import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Shield, CheckCircle, Target, TrendingUp, Award, Clock } from 'lucide-react';

export const WelcomePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = async () => {
        if (user && !user.hasSeenWelcome) {
            try {
                const updatedUser = await authAPI.markWelcomeSeen();
                updateUser(updatedUser);
            } catch (error) {
                console.error('Failed to mark welcome as seen:', error);
            }
        }
        navigate('/training');
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 p-8 ml-64">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block cyber-border rounded-lg p-6 mb-6">
                        <Shield className="w-20 h-20 text-cyber-green" />
                    </div>
                    <h1 className="text-5xl font-bold text-cyber-green mb-4">
                        {t('welcome.title')}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {t('welcome.subtitle')}
                    </p>
                </div>

                {/* Intro */}
                <div className="cyber-card mb-8">
                    <p className="text-lg text-foreground leading-relaxed text-center">
                        {t('welcome.intro')}
                    </p>
                </div>

                {/* Why Now - Urgency Block */}
                <div className="cyber-card mb-8 border-2 border-cyber-yellow/50 bg-cyber-yellow/5">
                    {/* Main Hook */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-cyber-yellow mb-3">
                            {t('welcome.whyNow.title')}
                        </h2>
                        <p className="text-xl text-cyber-red font-semibold mb-2">
                            {t('welcome.whyNow.mainStat')}
                        </p>
                        <p className="text-gray-300">
                            {t('welcome.whyNow.mainContext')}
                        </p>
                    </div>

                    {/* Micro Challenge */}
                    <div className="bg-background/50 border border-cyber-yellow/30 rounded-lg p-4 mb-6 text-center">
                        <p className="text-lg text-foreground font-medium mb-2">
                            {t('welcome.whyNow.challenge')}
                        </p>
                        <p className="text-sm text-gray-400">
                            {t('welcome.whyNow.challengeHint')}
                        </p>
                    </div>

                    {/* Supporting Stats */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-background/50 border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-8 h-8 text-cyber-green flex-shrink-0" />
                                <div>
                                    <p className="text-2xl font-bold text-cyber-green">15 минут</p>
                                    <p className="text-sm text-gray-400">{t('welcome.whyNow.stat2')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background/50 border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-8 h-8 text-cyber-blue flex-shrink-0" />
                                <div>
                                    <p className="text-2xl font-bold text-cyber-blue">90%</p>
                                    <p className="text-sm text-gray-400">{t('welcome.whyNow.stat3')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Safety Message */}
                    <div className="bg-cyber-green/10 border border-cyber-green/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-cyber-green flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            {t('welcome.whyNow.safetyMessage')}
                        </p>
                    </div>

                    {/* Trust Element */}
                    <p className="text-xs text-gray-500 mb-4 text-center">
                        {t('welcome.whyNow.trustElement')}
                    </p>

                    {/* CTA */}
                    <div className="text-center">
                        <button
                            onClick={handleGetStarted}
                            className="cyber-button text-lg px-8 py-3"
                        >
                            {t('welcome.whyNow.cta')}
                        </button>
                    </div>
                </div>

                {/* How It Works */}
                <div className="cyber-card mb-8">
                    <h2 className="text-2xl font-semibold text-cyber-green mb-6 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        {t('welcome.howItWorks')}
                    </h2>
                    <div className="space-y-4">
                        <Step number={1} text={t('welcome.step1')} />
                        <Step number={2} text={t('welcome.step2')} />
                        <Step number={3} text={t('welcome.step3')} />
                        <Step number={4} text={t('welcome.step4')} />
                    </div>
                </div>

                {/* What You'll Learn */}
                <div className="cyber-card mb-8">
                    <h2 className="text-2xl font-semibold text-cyber-green mb-6 flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        {t('welcome.whatYouLearn')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skill icon={<Shield />} text={t('welcome.skill1')} />
                        <Skill icon={<Target />} text={t('welcome.skill2')} />
                        <Skill icon={<TrendingUp />} text={t('welcome.skill3')} />
                        <Skill icon={<Award />} text={t('welcome.skill4')} />
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button onClick={handleGetStarted} className="cyber-button text-lg px-12 py-4">
                        {t('welcome.getStarted')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Step: React.FC<{ number: number; text: string }> = ({ number, text }) => {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-green text-black font-bold flex items-center justify-center">
                {number}
            </div>
            <p className="text-foreground pt-1">{text}</p>
        </div>
    );
};

const Skill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
            <div className="text-cyber-green">{icon}</div>
            <p className="text-foreground">{text}</p>
        </div>
    );
};
