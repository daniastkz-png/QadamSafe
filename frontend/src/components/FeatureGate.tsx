import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Crown, Building2 } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

interface FeatureGateProps {
    tier: 'PRO' | 'BUSINESS';
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ tier, title, description, icon }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isBusiness = tier === 'BUSINESS';

    // Default texts if not provided
    const defaultTitle = isBusiness
        ? t('subscription.lockedBusinessTitle', 'Доступно в Business')
        : t('subscription.lockedProTitle', 'Доступно в PRO');

    const defaultDesc = isBusiness
        ? t('subscription.lockedBusinessDesc', 'Обновите тариф до Business для доступа к этой функции.')
        : t('subscription.lockedProDesc', 'Обновите тариф до PRO для доступа к этой функции.');

    return (
        <DashboardLayout>
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-6 relative">
                        {icon || <div className="text-muted-foreground opacity-50"><Lock className="w-12 h-12" /></div>}
                        <div className="absolute -bottom-2 -right-2 bg-card p-2 rounded-full border border-border">
                            <Lock className={`w-6 h-6 ${isBusiness ? 'text-cyber-yellow' : 'text-cyber-green'}`} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            {title || defaultTitle}
                        </h2>
                        <p className="text-muted-foreground">
                            {description || defaultDesc}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/subscription')}
                        className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl text-background font-bold transition-all hover:scale-105 ${isBusiness ? 'bg-cyber-yellow hover:bg-cyber-yellow/90' : 'bg-cyber-green hover:bg-cyber-green/90'
                            }`}
                    >
                        {isBusiness ? <Building2 className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                        {t('subscription.upgradeTo', { plan: tier })}
                    </button>

                    {/* Quick Demo Shortcuts Hint */}
                    <div className="pt-4 text-xs text-muted-foreground/40">
                        Demo: Press <kbd className="font-mono bg-muted px-1 rounded">Cmd+{isBusiness ? 'B' : 'P'}</kbd>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
