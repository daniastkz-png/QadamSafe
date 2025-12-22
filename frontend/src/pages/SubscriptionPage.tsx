import React from 'react';
import { useTranslation } from 'react-i18next';
import { TopNavBar } from '../components/TopNavBar';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Building2, AlertCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export const SubscriptionPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const plans = [
        {
            tier: 'FREE',
            name: t('subscription.free'),
            price: '0 ₸',
            icon: <Check className="w-8 h-8" />,
            badge: 'Для знакомства с платформой и базовыми сценариями угроз',
            features: [
                t('subscription.freeFeature1'),
                t('subscription.freeFeature2'),
                t('subscription.freeFeature3'),
            ],
        },
        {
            tier: 'PRO',
            name: t('subscription.pro'),
            price: '2.490 ₸',
            period: t('subscription.perMonth', 'в месяц'),
            billingCycle: t('subscription.billedMonthly', 'Списывается каждый месяц'),
            icon: <Crown className="w-8 h-8" />,
            badge: 'Для личного использования',
            features: [
                t('subscription.proFeature1'),
                t('subscription.proFeature2'),
                t('subscription.proFeature3'),
                t('subscription.proFeature4'),
            ],
            popular: true,
        },
        {
            tier: 'BUSINESS',
            name: t('subscription.business'),
            price: '5.900 ₸',
            period: t('subscription.per3Months', 'за 3 месяца'),
            billingCycle: t('subscription.billed3Months', 'Списывается каждые 3 месяца'),
            pricePerMonth: '1.967 ₸',
            savings: '21%',
            icon: <Building2 className="w-8 h-8" />,
            badge: 'Для команд и образовательных учреждений',
            bestValue: true,
            features: [
                t('subscription.businessFeature1'),
                t('subscription.businessFeature2'),
                t('subscription.businessFeature3'),
                t('subscription.businessFeature5'),
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

            <div className="max-w-7xl mx-auto p-8">
                <h1 className="text-4xl font-bold text-cyber-green mb-4">
                    {t('subscription.title')}
                </h1>
                <p className="text-muted-foreground mb-8">
                    {t('subscription.currentPlan')}: <span className="text-cyber-green font-semibold">{user?.subscriptionTier}</span>
                </p>

                {/* Demo Notice */}
                <div className="cyber-border-yellow bg-cyber-yellow/10 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-cyber-yellow flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{t('subscription.upgradeNote')}</p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = user?.subscriptionTier === plan.tier;

                        return (
                            <div
                                key={plan.tier}
                                className={`cyber-card relative ${plan.bestValue
                                    ? 'border-cyber-green shadow-[0_0_40px_rgba(0,255,65,0.3)]'
                                    : plan.popular
                                        ? 'border-cyber-green/50 shadow-[0_0_30px_rgba(0,255,65,0.2)]'
                                        : ''
                                    } ${isCurrent ? 'bg-cyber-green/5' : ''}`}
                            >
                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div
                                        className={`p-4 rounded-lg ${isCurrent ? 'bg-cyber-green/20 text-cyber-green' : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {plan.icon}
                                    </div>
                                </div>

                                {/* Name & Price */}
                                <h3 className="text-2xl font-bold text-foreground text-center mb-2">
                                    {plan.name}
                                </h3>

                                {/* Personal Use Badge */}
                                {plan.badge && (
                                    <div className="text-center mb-3">
                                        <span className="inline-block px-3 py-1 bg-cyber-green/10 border border-cyber-green/30 rounded-full text-xs text-cyber-green font-medium">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Price Section */}
                                <div className="text-center mb-4">
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-4xl font-bold text-cyber-green">
                                            {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="text-muted-foreground text-sm">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>

                                    {/* Savings Badge for Business */}
                                    {plan.savings && (
                                        <div className="mt-2 flex items-center justify-center gap-2">
                                            <span className="inline-block px-3 py-1 bg-cyber-green/20 border border-cyber-green rounded-full text-xs font-bold text-cyber-green">
                                                Экономия {plan.savings}
                                            </span>
                                        </div>
                                    )}

                                    {/* Price per month for Business */}
                                    {plan.pricePerMonth && (
                                        <div className="mt-2">
                                            <span className="text-sm text-muted-foreground">
                                                = {plan.pricePerMonth} в месяц
                                            </span>
                                        </div>
                                    )}

                                    {/* Billing Cycle */}
                                    {plan.billingCycle && (
                                        <div className="mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {plan.billingCycle}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                <button
                                    disabled={isCurrent}
                                    className={`w-full py-3 rounded-md font-semibold transition-all ${isCurrent
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : 'cyber-button'
                                        }`}
                                >
                                    {isCurrent ? t('subscription.current') : t('subscription.upgrade')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Footer />
        </div>
    );
};
