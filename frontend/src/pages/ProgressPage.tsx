import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProtectionStatsCard } from '../components/ProtectionStats';
import { useAuth } from '../contexts/AuthContext';
// TODO: These components don't exist yet - uncomment when created
// import { StreakWidget } from '../components/StreakWidget';
// import { ImmunityHistoryWidget } from '../components/ImmunityHistoryWidget';
import DailyChallengeWidget from '../components/DailyChallengeWidget';

export const ProgressPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const mockStats = {
        scenariosCompleted: 3,
        totalScenarios: 15,
        perfectScenarios: 1,
        totalXP: 450,
        rank: user?.rank || 1,
        completedScenarioIds: ['kaspi_sms', 'kaspi_call', 'whatsapp_relative']
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {t('progress.title', 'Ваш прогресс')}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('progress.subtitle', 'Отслеживайте развитие своих навыков')}
                            </p>
                        </div>
                    </div>

                    {/* Main Stats with Radar */}
                    <div className="grid md:grid-cols-1 gap-6">
                        <ProtectionStatsCard
                            {...mockStats}
                        />
                    </div>

                    {/* Gamification Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* TODO: StreakWidget not yet implemented */}
                        {/* <StreakWidget currentStreak={5} frozen={false} /> */}

                        {/* Daily Challenges */}
                        <DailyChallengeWidget />
                    </div>

                    {/* TODO: ImmunityHistoryWidget not yet implemented */}
                    {/* <div className="animate-fade-in-up delay-100">
                        <ImmunityHistoryWidget />
                    </div> */}

                </div>
            </div>
        </DashboardLayout>
    );
};
