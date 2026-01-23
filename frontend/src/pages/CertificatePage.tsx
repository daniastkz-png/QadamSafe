import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Award, Download, Share2, CheckCircle, Lock,
    Shield, Star, Trophy, Calendar, Sparkles
} from 'lucide-react';

// Certificate data type
interface CertificateData {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    requirement: string;
    isUnlocked: boolean;
    unlockedAt?: Date;
    icon: React.ReactNode;
    color: string;
    bgGradient: string;
}

// Certificate Preview Component
const CertificatePreview: React.FC<{
    certificate: CertificateData;
    userName: string;
    onDownload: () => void;
}> = ({ certificate, userName, onDownload }) => {
    const { t } = useTranslation();
    const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    if (!certificate.isUnlocked) {
        return (
            <div className="relative cyber-card opacity-60">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground max-w-[200px]">
                            {certificate.requirement}
                        </p>
                    </div>
                </div>
                <div className="p-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${certificate.bgGradient} flex items-center justify-center mb-4 opacity-50`}>
                        {certificate.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{certificate.title}</h3>
                    <p className="text-sm text-muted-foreground">{certificate.description}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`cyber-card border-2 ${certificate.color} overflow-hidden group hover:shadow-xl transition-all`}>
            {/* Certificate Header */}
            <div className={`bg-gradient-to-r ${certificate.bgGradient} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            {certificate.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{certificate.title}</h3>
                            <p className="text-white/70 text-sm">{certificate.description}</p>
                        </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6">
                {/* Mini Certificate Preview */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            <Shield className="w-10 h-10 text-cyber-green" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                            {t('certificate.certifies', 'Сертификат подтверждает')}
                        </p>
                        <h4 className="text-xl font-bold text-foreground mb-1">{userName}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('certificate.completed', 'успешно завершил(а)')}
                        </p>
                        <p className="text-lg font-semibold text-cyber-green mb-3">
                            {certificate.title}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {currentDate}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyber-green text-background rounded-lg font-medium hover:bg-cyber-green/90 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        {t('certificate.download', 'Скачать PDF')}
                    </button>
                    <button className="px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-all">
                        <Share2 className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Generate PDF Certificate (opens print dialog for Save as PDF)
const generateCertificatePDF = (certificate: CertificateData, userName: string) => {
    const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const certificateId = `QS-${Date.now().toString(36).toUpperCase()}`;

    // Create a new window for printing
    const win = window.open('', '', 'height=800,width=1100');
    if (!win) return;

    win.document.write('<html><head><title>Certificate - ' + certificate.title + '</title>');
    win.document.write(`
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
            
            body { 
                margin: 0; 
                padding: 0; 
                background: #f0fdf4;
                font-family: 'Inter', sans-serif;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            
            .certificate {
                width: 1000px;
                height: 700px;
                background: white;
                position: relative;
                padding: 40px;
                box-shadow: 0 0 50px rgba(0,0,0,0.1);
                overflow: hidden;
                border: 20px solid #ecfdf5;
                outline: 2px solid #059669;
                outline-offset: -10px;
            }

            .corner-deco {
                position: absolute;
                width: 150px;
                height: 150px;
                border: 2px solid #059669;
                z-index: 1;
            }
            .top-left { top: 20px; left: 20px; border-right: none; border-bottom: none; }
            .top-right { top: 20px; right: 20px; border-left: none; border-bottom: none; }
            .bottom-left { bottom: 20px; left: 20px; border-right: none; border-top: none; }
            .bottom-right { bottom: 20px; right: 20px; border-left: none; border-top: none; }

            .content {
                height: 100%;
                border: 1px solid #d1fae5;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                position: relative;
                z-index: 2;
                background-image: radial-gradient(#059669 0.5px, transparent 0.5px);
                background-size: 20px 20px;
                background-color: rgba(255,255,255,0.95);
            }

            .header { margin-bottom: 40px; }
            
            .logo {
                font-size: 40px;
                margin-bottom: 20px;
                display: inline-block;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            }

            .title {
                font-family: 'Playfair Display', serif;
                font-size: 60px;
                font-weight: 700;
                color: #065f46;
                text-transform: uppercase;
                letter-spacing: 4px;
                margin: 0;
            }

            .subtitle {
                font-size: 18px;
                color: #059669;
                text-transform: uppercase;
                letter-spacing: 6px;
                margin-top: 10px;
            }

            .recipient-section { margin: 40px 0; width: 80%; }
            
            .presented-to {
                font-style: italic;
                color: #6b7280;
                font-size: 18px;
                margin-bottom: 20px;
            }

            .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                font-weight: 700;
                color: #111827;
                border-bottom: 2px solid #059669;
                padding-bottom: 15px;
                margin: 0 auto;
                width: 100%;
            }

            .description {
                margin-top: 20px;
                font-size: 18px;
                line-height: 1.6;
                color: #374151;
            }

            .footer {
                width: 80%;
                display: flex;
                justify-content: space-between;
                margin-top: 60px;
            }

            .sign-box {
                text-align: center;
                width: 250px;
            }

            .signature {
                font-family: 'Playfair Display', cursive;
                font-size: 30px;
                color: #059669;
                border-bottom: 1px solid #9ca3af;
                padding-bottom: 10px;
                margin-bottom: 10px;
                font-style: italic;
            }

            .sign-label {
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .certificate-id {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 12px;
                color: #9ca3af;
                font-family: monospace;
            }

            @media print {
                body { background: none; -webkit-print-color-adjust: exact; }
                .certificate { box-shadow: none; margin: 0; page-break-inside: avoid; }
            }
        </style>
    `);
    win.document.write('</head><body>');

    win.document.write(`
        <div class="certificate">
            <div class="corner-deco top-left"></div>
            <div class="corner-deco top-right"></div>
            <div class="corner-deco bottom-left"></div>
            <div class="corner-deco bottom-right"></div>
            
            <div class="content">
                <div class="header">
                    <div class="logo">🛡️ QadamSafe</div>
                    <h1 class="title">Certificate</h1>
                    <div class="subtitle">of Completion</div>
                </div>

                <div class="recipient-section">
                    <div class="presented-to">This certificate is proudly presented to</div>
                    <div class="recipient-name">${userName}</div>
                    <div class="description">
                        For successfully completing the <strong>${certificate.title}</strong> training module
                        and demonstrating commitment to digital safety excellence.
                    </div>
                </div>

                <div class="footer">
                    <div class="sign-box">
                        <div class="signature">QadamAI System</div>
                        <div class="sign-label">Verified By</div>
                    </div>
                    <div class="sign-box">
                        <div class="signature">${currentDate}</div>
                        <div class="sign-label">Date Issued</div>
                    </div>
                </div>

                <div class="certificate-id">ID: ${certificateId} • Verify at qadamsafe.kz</div>
            </div>
        </div>
    `);

    win.document.write('</body></html>');
    win.document.close();
    win.focus();

    // Auto print after images load (fake delay)
    setTimeout(() => {
        win.print();
        // win.close(); // Optional: close after print
    }, 500);
};

export const CertificatePage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Feature Gate: BUSINESS only
    if (user && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="BUSINESS"
                icon={<Award className="w-12 h-12 text-cyber-yellow opacity-50" />}
            />
        );
    }

    // Define available certificates
    const certificates: CertificateData[] = [
        {
            id: 'basic',
            title: t('certificate.basic.title', 'Основы кибербезопасности'),
            titleEn: 'Cybersecurity Basics',
            description: t('certificate.basic.desc', 'Прошёл все базовые сценарии'),
            requirement: t('certificate.basic.req', 'Пройдите все 5 сценариев'),
            isUnlocked: (user?.securityScore || 0) >= 50,
            icon: <Shield className="w-8 h-8 text-white" />,
            color: 'border-cyber-green/50',
            bgGradient: 'from-cyber-green to-emerald-500',
        },
        {
            id: 'advanced',
            title: t('certificate.advanced.title', 'Продвинутая защита'),
            titleEn: 'Advanced Protection',
            description: t('certificate.advanced.desc', 'Прошёл все сценарии без ошибок'),
            requirement: t('certificate.advanced.req', 'Пройдите все сценарии без ошибок'),
            isUnlocked: false, // Would check actual data
            icon: <Trophy className="w-8 h-8 text-white" />,
            color: 'border-cyber-yellow/50',
            bgGradient: 'from-cyber-yellow to-orange-500',
        },
        {
            id: 'ai-master',
            title: t('certificate.aiMaster.title', 'Мастер ИИ-сценариев'),
            titleEn: 'AI Scenarios Master',
            description: t('certificate.aiMaster.desc', 'Прошёл 10 ИИ-сценариев'),
            requirement: t('certificate.aiMaster.req', 'Пройдите 10 ИИ-сценариев'),
            isUnlocked: false,
            icon: <Sparkles className="w-8 h-8 text-white" />,
            color: 'border-purple-500/50',
            bgGradient: 'from-purple-500 to-pink-500',
        },
        {
            id: 'streak-master',
            title: t('certificate.streak.title', 'Мастер постоянства'),
            titleEn: 'Consistency Master',
            description: t('certificate.streak.desc', '30-дневная серия обучения'),
            requirement: t('certificate.streak.req', 'Занимайтесь 30 дней подряд'),
            isUnlocked: false,
            icon: <Star className="w-8 h-8 text-white" />,
            color: 'border-cyan-500/50',
            bgGradient: 'from-cyan-500 to-blue-500',
        },
    ];

    const unlockedCount = certificates.filter(c => c.isUnlocked).length;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto p-4 md:p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full text-cyber-green text-sm font-medium mb-4">
                            <Award className="w-4 h-4" />
                            {t('certificate.badge', 'Сертификаты')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {t('certificate.title', 'Ваши сертификаты')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('certificate.subtitle', 'Подтвердите свои навыки официальными сертификатами')}
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="cyber-card mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {t('certificate.progress', 'Прогресс сертификатов')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('certificate.unlocked', 'Получено {{count}} из {{total}}', {
                                            count: unlockedCount,
                                            total: certificates.length
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-cyber-green">
                                    {Math.round((unlockedCount / certificates.length) * 100)}%
                                </div>
                            </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyber-green to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${(unlockedCount / certificates.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Certificates Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {certificates.map(certificate => (
                            <CertificatePreview
                                key={certificate.id}
                                certificate={certificate}
                                userName={user?.name || user?.email?.split('@')[0] || 'Пользователь'}
                                onDownload={() => generateCertificatePDF(certificate, user?.name || user?.email?.split('@')[0] || 'Пользователь')}
                            />
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('certificate.info', 'Сертификаты QadamSafe признаются в образовательных учреждениях Казахстана')}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
