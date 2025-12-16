import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Building2, AlertCircle } from 'lucide-react';

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
            price: '9.900 ₸',
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
            price: '19.900 ₸',
            icon: <Building2 className="w-8 h-8" />,
            badge: 'Для команд и образовательных учреждений',
            features: [
                t('subscription.businessFeature1'),
                t('subscription.businessFeature2'),
                t('subscription.businessFeature3'),
                t('subscription.businessFeature5'),
            ],
        },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 p-8 ml-64">
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
                                className={`cyber-card relative ${plan.popular
                                    ? 'border-cyber-green/50 shadow-[0_0_30px_rgba(0,255,65,0.2)]'
                                    : ''
                                    } ${isCurrent ? 'bg-cyber-green/5' : ''}`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyber-green text-black px-4 py-1 rounded-full text-sm font-semibold">
                                        Popular
                                    </div>
                                )}

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

                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-cyber-green">
                                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                                    </span>
                                    {typeof plan.price === 'number' && plan.price > 0 && (
                                        <span className="text-muted-foreground ml-2">
                                            / {t('subscription.perMonth')}
                                        </span>
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
        </div>
    );
};
