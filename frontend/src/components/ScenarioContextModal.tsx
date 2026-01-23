import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, Shield, Play, ArrowLeft } from 'lucide-react';

export interface ScenarioContextModalProps {
    title: string;
    subtitle?: string;
    description: string;
    redFlags?: string[];
    legitimacySigns?: string[];
    summary?: string;
    isScam?: boolean;
    startLabel?: string;
    onStart: () => void;
    onClose?: () => void;
    showBackButton?: boolean;
}

export const ScenarioContextModal: React.FC<ScenarioContextModalProps> = ({
    title,
    subtitle,
    description,
    redFlags = [],
    legitimacySigns = [],
    summary,
    startLabel,
    onStart,
    onClose,
    showBackButton = true,
}) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto cyber-card border-2 border-cyber-green/30 shadow-[0_0_40px_rgba(0,255,65,0.15)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                            aria-label={t('common.close', 'Закрыть')}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {/* Контекст сценария */}
                    <div>
                        <h3 className="text-sm font-semibold text-cyber-green mb-2">
                            {t('scenarioContext.about', 'О сценарии')}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </div>

                    {/* Как распознать: красные флаги или признаки легитимности */}
                    {redFlags.length > 0 && (
                        <div className="p-4 rounded-xl bg-cyber-red/10 border border-cyber-red/30">
                            <h4 className="text-sm font-semibold text-cyber-red mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {t('scenarioContext.howToRecognizeScam', 'Как распознать мошенника')}
                            </h4>
                            <ul className="space-y-1.5">
                                {redFlags.map((flag, i) => (
                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                        <span className="text-cyber-red mt-0.5">•</span>
                                        <span>{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {legitimacySigns.length > 0 && (
                        <div className="p-4 rounded-xl bg-cyber-green/10 border border-cyber-green/30">
                            <h4 className="text-sm font-semibold text-cyber-green mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {t('scenarioContext.legitimacySigns', 'Признаки настоящего человека/организации')}
                            </h4>
                            <ul className="space-y-1.5">
                                {legitimacySigns.map((sign, i) => (
                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                        <span className="text-cyber-green mt-0.5">•</span>
                                        <span>{sign}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Итоги / Запомните */}
                    {summary && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                            <h4 className="text-sm font-semibold text-foreground mb-2">
                                {t('scenarioContext.remember', 'Запомните')}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {summary}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-border">
                    {showBackButton && onClose && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('common.back', 'Назад')}
                        </button>
                    )}
                    <button
                        onClick={onStart}
                        className={`py-3 rounded-xl bg-cyber-green text-background font-bold hover:bg-cyber-green/90 transition-colors flex items-center justify-center gap-2 ${showBackButton && onClose ? 'flex-1' : 'w-full'}`}
                    >
                        <Play className="w-4 h-4" />
                        {startLabel || t('scenarioContext.start', 'Начать сценарий')}
                    </button>
                </div>
            </div>
        </div>
    );
};
