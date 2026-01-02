import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { ScenarioPlayer } from '../components/ScenarioPlayer';
import { firebaseScenariosAPI } from '../services/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Scenario } from '../types';

export const ScenarioPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadScenario = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await firebaseScenariosAPI.getById(id);
                setScenario(data as Scenario);
            } catch (err) {
                console.error('Failed to load scenario:', err);
                setError(t('common.error', 'Произошла ошибка при загрузке сценария'));
            } finally {
                setLoading(false);
            }
        };

        loadScenario();
    }, [id, t]);

    const handleComplete = async (decisions: any[]) => {
        if (!scenario || !id) return;

        try {
            // Calculate score
            const safeDecisions = decisions.filter((d: any) => d.outcomeType === 'safe').length;
            const totalDecisions = decisions.length;
            const score = Math.round((safeDecisions / totalDecisions) * scenario.pointsReward);
            const mistakes = totalDecisions - safeDecisions;

            await firebaseScenariosAPI.complete(id, {
                score,
                mistakes,
                decisions
            });

            // Navigate back to training page after short delay or show success message there
            // For now, let's go back to training list
            navigate('/training');
        } catch (err) {
            console.error('Failed to save progress:', err);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyber-green" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !scenario) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-background p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-cyber-red/10 border border-cyber-red/30 p-6 rounded-lg text-center">
                            <h2 className="text-xl font-bold text-cyber-red mb-2">
                                {error || t('scenario.notFound', 'Сценарий не найден')}
                            </h2>
                            <button
                                onClick={() => navigate('/training')}
                                className="text-muted-foreground hover:text-foreground underline"
                            >
                                {t('common.backToTraining', 'Вернуться к обучению')}
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto p-4 sm:p-8">
                    <button
                        onClick={() => navigate('/training')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.back', 'Назад')}
                    </button>

                    <h1 className="text-2xl font-bold text-cyber-green mb-6">
                        {scenario.title}
                    </h1>

                    <ScenarioPlayer
                        scenario={scenario}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};
