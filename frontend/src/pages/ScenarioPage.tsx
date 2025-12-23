import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopNavBar } from '../components/TopNavBar';
import { ScenarioPlayer } from '../components/ScenarioPlayer';
import { firebaseScenariosAPI } from '../services/firebase';
import type { Scenario } from '../types';
import { ArrowLeft } from 'lucide-react';

export const ScenarioPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadScenario();
    }, [id]);

    const loadScenario = async () => {
        if (!id) return;

        try {
            const data = await firebaseScenariosAPI.getById(id);
            setScenario(data as Scenario);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (decisions: any[]) => {
        if (!scenario) return;

        try {
            // Calculate score and mistakes based on outcome types
            let score = 0;
            let mistakes = 0;

            decisions.forEach((decision) => {
                if (decision.outcomeType === 'safe') {
                    score += 10;
                } else if (decision.outcomeType === 'risky') {
                    score += 5;
                    mistakes += 1;
                } else if (decision.outcomeType === 'dangerous') {
                    mistakes += 1;
                }
            });

            await firebaseScenariosAPI.complete(scenario.id, {
                score,
                mistakes,
                decisions,
            });

            // Navigate back to training page
            navigate('/training');
        } catch (err) {
            console.error('Failed to complete scenario:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <TopNavBar />
                <div className="max-w-7xl mx-auto p-8">
                    <div className="text-center py-20">
                        <div className="text-cyber-green text-xl animate-pulse-glow">
                            {t('common.loading')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !scenario) {
        return (
            <div className="min-h-screen bg-background">
                <TopNavBar />
                <div className="max-w-7xl mx-auto p-8">
                    <div className="cyber-card text-center py-12">
                        <p className="text-cyber-red mb-4">{error || t('scenario.notFound')}</p>
                        <button
                            onClick={() => navigate('/training')}
                            className="cyber-button inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('scenario.backToTraining')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <TopNavBar />

            <div className="max-w-7xl mx-auto px-4 py-6 sm:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/training')}
                        className="text-cyber-green hover:text-cyber-green/80 transition-colors inline-flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('scenario.backToTraining')}
                    </button>
                    <h1 className="text-4xl font-bold text-cyber-green">
                        {scenario.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">{scenario.description}</p>
                </div>

                {/* Scenario Player */}
                <ScenarioPlayer scenario={scenario} onComplete={handleComplete} />
            </div>
        </div>
    );
};
