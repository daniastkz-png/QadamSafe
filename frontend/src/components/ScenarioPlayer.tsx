import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Scenario, ScenarioStep, ScenarioOption } from '../types';
import { ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ScenarioPlayerProps {
    scenario: Scenario;
    onComplete: (decisions: any[]) => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const ScenarioPlayer: React.FC<ScenarioPlayerProps> = ({ scenario, onComplete }) => {
    const { t, i18n } = useTranslation();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [decisions, setDecisions] = useState<any[]>([]);

    const currentStep = scenario.content.steps[currentStepIndex];

    // Shuffle options once when step changes
    const shuffledOptions = useMemo(() => {
        if (!currentStep?.options) return [];
        return shuffleArray(currentStep.options);
    }, [currentStep]);

    const getLocalizedContent = (step: ScenarioStep) => {
        if (i18n.language === 'en' && step.contentEn) return step.contentEn;
        if (i18n.language === 'kk' && step.contentKk) return step.contentKk;
        return step.content;
    };

    const getLocalizedOptionText = (option: ScenarioOption) => {
        if (i18n.language === 'en' && option.textEn) return option.textEn;
        if (i18n.language === 'kk' && option.textKk) return option.textKk;
        return option.text;
    };

    const getLocalizedExplanation = (option: ScenarioOption) => {
        if (i18n.language === 'en' && option.explanationEn) return option.explanationEn;
        if (i18n.language === 'kk' && option.explanationKk) return option.explanationKk;
        return option.explanation || '';
    };

    const getOutcomeIcon = (outcomeType: string) => {
        switch (outcomeType) {
            case 'safe':
                return <CheckCircle className="w-6 h-6 text-cyber-green" />;
            case 'risky':
                return <AlertTriangle className="w-6 h-6 text-cyber-yellow" />;
            case 'dangerous':
                return <XCircle className="w-6 h-6 text-cyber-red" />;
            default:
                return null;
        }
    };

    const getOutcomeColor = (outcomeType: string) => {
        switch (outcomeType) {
            case 'safe':
                return 'border-cyber-green/50 bg-cyber-green/5';
            case 'risky':
                return 'border-cyber-yellow/50 bg-cyber-yellow/5';
            case 'dangerous':
                return 'border-cyber-red/50 bg-cyber-red/5';
            default:
                return '';
        }
    };

    const handleOptionSelect = (option: ScenarioOption) => {
        setSelectedOption(option.id);
        setShowExplanation(true);

        // Record decision
        const decision = {
            stepId: currentStep.id,
            optionId: option.id,
            outcomeType: option.outcomeType,
            timestamp: new Date().toISOString(),
        };
        setDecisions([...decisions, decision]);
    };

    const handleNext = () => {
        if (!selectedOption) return;

        const selected = shuffledOptions.find(opt => opt.id === selectedOption);

        // Check if there's a next step defined by the option (branching)
        if (selected?.nextStepId) {
            const nextStepIndex = scenario.content.steps.findIndex(
                step => step.id === selected.nextStepId
            );
            if (nextStepIndex !== -1) {
                setCurrentStepIndex(nextStepIndex);
                setSelectedOption(null);
                setShowExplanation(false);
                return;
            }
        }

        // Otherwise, go to next step in sequence
        if (currentStepIndex < scenario.content.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            // Scenario complete
            onComplete(decisions);
        }
    };

    const isLastStep = currentStepIndex === scenario.content.steps.length - 1;
    const selectedOptionData = shuffledOptions.find(opt => opt.id === selectedOption);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                        {t('scenario.step')} {currentStepIndex + 1} / {scenario.content.steps.length}
                    </span>
                    <span className="text-sm text-cyber-green">
                        {scenario.isLegitimate ? t('scenario.legitimate') : t('scenario.potential_threat')}
                    </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                    <div
                        className="bg-cyber-green h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentStepIndex + 1) / scenario.content.steps.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="cyber-card mb-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
                        <span className="text-cyber-green font-bold">{currentStepIndex + 1}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-cyber-green mb-1">
                            {t(`scenario.${currentStep.type}`)}
                        </h3>
                        <p className="text-lg text-foreground leading-relaxed">
                            {getLocalizedContent(currentStep)}
                        </p>
                    </div>
                </div>

                {/* Options */}
                {currentStep.options && currentStep.options.length > 0 && (
                    <div className="space-y-3 mt-6">
                        {shuffledOptions.map((option) => {
                            const isSelected = selectedOption === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !showExplanation && handleOptionSelect(option)}
                                    disabled={showExplanation}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                        ? getOutcomeColor(option.outcomeType)
                                        : 'border-border hover:border-cyber-green/50 bg-card'
                                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {isSelected && showExplanation && (
                                            <div className="flex-shrink-0 mt-1">
                                                {getOutcomeIcon(option.outcomeType)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-foreground font-medium">
                                                {getLocalizedOptionText(option)}
                                            </p>
                                            {isSelected && showExplanation && (
                                                <div className="mt-3 pt-3 border-t border-border">
                                                    <p className="text-sm text-muted-foreground">
                                                        {getLocalizedExplanation(option)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Next Button */}
            {(showExplanation || currentStep.type === 'information') && (
                <button
                    onClick={handleNext}
                    className="cyber-button w-full flex items-center justify-center gap-2"
                >
                    {isLastStep && !selectedOptionData?.nextStepId ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            {t('scenario.completeScenario')}
                        </>
                    ) : (
                        <>
                            {t('scenario.nextStep')}
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};
