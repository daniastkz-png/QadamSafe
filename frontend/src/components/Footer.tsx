import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - About */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-cyber-green" />
                            <span className="text-xl font-bold text-cyber-green">QadamSafe</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                            {t('footer.description', 'Интерактивная платформа для практического обучения кибербезопасности через реальные сценарии.')}
                        </p>
                    </div>

                    {/* Right Column - Contacts */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            {t('footer.contacts', 'Контакты')}
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                <span className="text-foreground">Email:</span>{' '}
                                <a
                                    href="mailto:support@qadamsafe.com"
                                    className="hover:text-cyber-green transition-colors"
                                >
                                    support@qadamsafe.com
                                </a>
                            </p>
                            <p>
                                <span className="text-foreground">{t('footer.city', 'Город')}:</span>{' '}
                                {t('footer.location', 'Астана, Казахстан')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-6"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    {/* Copyright */}
                    <p>
                        © 2025 QadamSafe. {t('footer.allRightsReserved', 'Все права защищены')}.
                    </p>

                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        <a
                            href="https://docs.google.com/document/d/1vogsED7qmFDngi_aOVfaIAPJETFsKN3vEM6YU942q48/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyber-green transition-colors px-2"
                        >
                            {t('footer.publicOffer', 'Публичная оферта')}
                        </a>
                        <span className="text-border">·</span>
                        <a
                            href="https://docs.google.com/document/d/1Wrmbuh5Wqu9h3D9Po8D4nJXat82AGohY5iEI5BksEBc/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyber-green transition-colors px-2"
                        >
                            {t('footer.privacyPolicy', 'Политика конфиденциальности')}
                        </a>
                        <span className="text-border">·</span>
                        <a
                            href="https://docs.google.com/document/d/1hY6l9QvTcPnflv4e-33yiOEXH4Yc2uaJxcRoxYvo7fw/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyber-green transition-colors px-2"
                        >
                            {t('footer.termsOfUse', 'Условия использования')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
