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

// Generate PDF Certificate (simplified - creates downloadable HTML)
const generateCertificatePDF = (certificate: CertificateData, userName: string) => {
    const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const certificateId = `QS-${Date.now().toString(36).toUpperCase()}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Сертификат - ${certificate.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
        }
        
        .certificate {
            width: 800px;
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 25px 80px rgba(0, 255, 65, 0.15), 0 0 0 4px #00ff41;
            position: relative;
            overflow: hidden;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #00ff41, #00d4ff, #00ff41);
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 200px;
            font-weight: 700;
            color: rgba(0, 255, 65, 0.03);
            pointer-events: none;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #00ff41 0%, #00d4ff 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
        }
        
        .title {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 10px;
        }
        
        .main-title {
            font-size: 36px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 10px;
        }
        
        .body {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .certifies {
            font-size: 14px;
            color: #888;
            margin-bottom: 15px;
        }
        
        .name {
            font-size: 42px;
            font-weight: 700;
            color: #00cc33;
            margin-bottom: 20px;
            position: relative;
            display: inline-block;
        }
        
        .name::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, #00ff41, transparent);
        }
        
        .achievement {
            font-size: 18px;
            color: #444;
            margin-bottom: 10px;
        }
        
        .course-name {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a2e;
            background: linear-gradient(90deg, #00ff41, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px dashed #eee;
        }
        
        .date-section, .id-section {
            text-align: center;
        }
        
        .label {
            font-size: 12px;
            color: #888;
            margin-bottom: 5px;
        }
        
        .value {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        .qr-section {
            text-align: center;
        }
        
        .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #f0f0f0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #888;
            margin: 0 auto 5px;
        }
        
        .verify-text {
            font-size: 10px;
            color: #888;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                border: 2px solid #00ff41;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">QS</div>
        
        <div class="header">
            <div class="logo">🛡️</div>
            <div class="title">Сертификат об обучении</div>
            <div class="main-title">QadamSafe</div>
        </div>
        
        <div class="body">
            <div class="certifies">Настоящим подтверждается, что</div>
            <div class="name">${userName}</div>
            <div class="achievement">успешно завершил(а) курс</div>
            <div class="course-name">${certificate.title}</div>
        </div>
        
        <div class="footer">
            <div class="date-section">
                <div class="label">Дата выдачи</div>
                <div class="value">${currentDate}</div>
            </div>
            
            <div class="qr-section">
                <div class="qr-placeholder">QR</div>
                <div class="verify-text">Проверить на qadamsafe.web.app</div>
            </div>
            
            <div class="id-section">
                <div class="label">ID сертификата</div>
                <div class="value">${certificateId}</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QadamSafe_Certificate_${certificate.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
