import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProtectionStatsCard } from '../components/ProtectionStats'; // We updated this
import { useAuth } from '../contexts/AuthContext';
// import {
//     Trophy, Target, Award, Calendar
// } from 'lucide-react';
import { StreakWidget } from '../components/StreakWidget';
// import { LeaderboardWidget } from '../components/LeaderboardWidget';
import DailyChallengeWidget from '../components/DailyChallengeWidget';
import { ImmunityHistoryWidget } from '../components/ImmunityHistoryWidget';

export const ProgressPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Mock data for now (later we can pull from API/Context)
    // Ideally we should have a useProgress hook or similar
    const mockStats = {
        scenariosCompleted: 3, // dynamic
        totalScenarios: 15,
        perfectScenarios: 1,
        totalXP: 450,
        rank: user?.rank || 1,
        // Mock list of completed IDs to test radar categories
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
                        {/* Streak Widget */}
                        <StreakWidget currentStreak={5} frozen={false} />

                        {/* Daily Challenges */}
                        <DailyChallengeWidget />
                    </div>

                    {/* Immunity History Chart */}
                    <div className="animate-fade-in-up delay-100">
                        <ImmunityHistoryWidget />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};
