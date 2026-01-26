import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
    AlertTriangle,
    Send,
    TrendingUp,
    MapPin,
    Phone,
    Globe,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    Shield,
    Zap,
    Filter,
    Sparkles
} from 'lucide-react';
import {
    submitScamReport,
    getRecentScamReports,
    getScamStatistics,
    upvoteReport,
    analyzeScamReport,
    SCAM_TYPE_LABELS,
    KZ_REGIONS
} from '../services/scamService';
import type { ScamReport, ScamType, RiskLevel } from '../types';

// Risk level colors and labels
const RISK_COLORS: Record<RiskLevel, string> = {
    'LOW': 'text-green-400 bg-green-500/10 border-green-500/30',
    'MEDIUM': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'HIGH': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'CRITICAL': 'text-red-400 bg-red-500/10 border-red-500/30'
};

const RISK_LABELS: Record<RiskLevel, { ru: string; en: string; kk: string }> = {
    'LOW': { ru: 'Низкий', en: 'Low', kk: 'Төмен' },
    'MEDIUM': { ru: 'Средний', en: 'Medium', kk: 'Орташа' },
    'HIGH': { ru: 'Высокий', en: 'High', kk: 'Жоғары' },
    'CRITICAL': { ru: 'Критический', en: 'Critical', kk: 'Сыни' }
};

export const ScamReportPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const lang = i18n.language as 'ru' | 'en' | 'kk';

    // Form state
    const [formData, setFormData] = useState({
        type: '' as ScamType | '',
        title: '',
        description: '',
        region: '',
        city: '',
        phoneNumber: '',
        websiteUrl: '',
        impactEstimate: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // AI Analysis preview
    const [aiPreview, setAiPreview] = useState<{
        category: ScamType;
        confidence: number;
        riskLevel: RiskLevel;
        redFlags: string[];
    } | null>(null);

    // Reports feed
    const [reports, setReports] = useState<ScamReport[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [filterType, setFilterType] = useState<ScamType | 'ALL'>('ALL');

    // Statistics
    const [stats, setStats] = useState<{
        totalReports: number;
        thisMonth: number;
        byType: Record<ScamType, number>;
        topRegions: { region: string; count: number }[];
    } | null>(null);

    // Expanded report
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'feed' | 'report'>('feed');

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // AI analysis on description change (debounced)
    useEffect(() => {
        if (formData.description.length > 30) {
            const timer = setTimeout(() => {
                const analysis = analyzeScamReport(formData.description);
                setAiPreview(analysis);
                if (!formData.type && analysis.category !== 'OTHER') {
                    setFormData(prev => ({ ...prev, type: analysis.category }));
                }
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setAiPreview(null);
        }
    }, [formData.description]);

    const loadData = async () => {
        setLoadingReports(true);
        try {
            const [reportsData, statsData] = await Promise.all([
                getRecentScamReports(30),
                getScamStatistics()
            ]);
            setReports(reportsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading scam data:', error);
        } finally {
            setLoadingReports(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.title || !formData.description) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            await submitScamReport(user.id, user.name || user.email, {
                type: (formData.type as ScamType) || 'OTHER',
                title: formData.title,
                description: formData.description,
                location: formData.region ? {
                    region: formData.region,
                    city: formData.city || undefined
                } : undefined,
                phoneNumber: formData.phoneNumber || undefined,
                websiteUrl: formData.websiteUrl || undefined,
                impactEstimate: formData.impactEstimate ? parseInt(formData.impactEstimate) : undefined
            });

            setSubmitSuccess(true);
            setFormData({
                type: '',
                title: '',
                description: '',
                region: '',
                city: '',
                phoneNumber: '',
                websiteUrl: '',
                impactEstimate: ''
            });
            setAiPreview(null);

            // Reload reports
            loadData();

            // Switch to feed tab after 2 seconds
            setTimeout(() => {
                setActiveTab('feed');
                setSubmitSuccess(false);
            }, 2000);

        } catch (error) {
            console.error('Error submitting report:', error);
            setSubmitError(t('scamReport.submitError', 'Ошибка при отправке. Попробуйте ещё раз.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (reportId: string) => {
        try {
            await upvoteReport(reportId);
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r
            ));
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };

    const formatTimeAgo = (timestamp: any): string => {
        const date = timestamp?.toDate?.() || new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} ${t('scamReport.minutesAgo', 'мин назад')}`;
        if (diffHours < 24) return `${diffHours} ${t('scamReport.hoursAgo', 'ч назад')}`;
        return `${diffDays} ${t('scamReport.daysAgo', 'дн назад')}`;
    };

    const filteredReports = filterType === 'ALL'
        ? reports
        : reports.filter(r => r.type === filterType);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-sm font-medium mb-4">
                        <Shield className="w-4 h-4" />
                        {t('scamReport.badge', 'Казахстанская база мошенничества')}
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('scamReport.title', 'Новости угроз')}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('scamReport.subtitle', 'Сообщайте о мошенничестве и помогайте защитить других. Все отчёты проверяются и анализируются ИИ.')}
                    </p>
                </div>

                {/* Statistics Banner */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-cyber-green">{stats.totalReports}</div>
                            <div className="text-sm text-muted-foreground">{t('scamReport.totalReports', 'Всего отчётов')}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{stats.thisMonth}</div>
                            <div className="text-sm text-muted-foreground">{t('scamReport.thisMonth', 'За этот месяц')}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-orange-400">
                                {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[1] || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0]
                                    ? SCAM_TYPE_LABELS[Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0][0] as ScamType]?.[lang] || 'Топ тип'
                                    : t('scamReport.topType', 'Топ тип')}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{stats.topRegions[0]?.count || 0}</div>
                            <div className="text-sm text-muted-foreground truncate">
                                {stats.topRegions[0]?.region || t('scamReport.topRegion', 'Топ регион')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'feed'
                                ? 'bg-cyber-green text-black'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 inline-block mr-2" />
                        {t('scamReport.feedTab', 'Лента угроз')}
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'report'
                                ? 'bg-cyber-green text-black'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                        {t('scamReport.reportTab', 'Сообщить')}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'feed' ? (
                    <div className="space-y-4">
                        {/* Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${filterType === 'ALL'
                                        ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('scamReport.filterAll', 'Все')}
                            </button>
                            {Object.entries(SCAM_TYPE_LABELS).slice(0, 6).map(([type, labels]) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as ScamType)}
                                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${filterType === type
                                            ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                                            : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {labels[lang]}
                                </button>
                            ))}
                        </div>

                        {/* Reports List */}
                        {loadingReports ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-cyber-green" />
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="text-center py-12 bg-card border border-border rounded-xl">
                                <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">{t('scamReport.noReports', 'Пока нет отчётов')}</p>
                                <button
                                    onClick={() => setActiveTab('report')}
                                    className="mt-4 px-4 py-2 bg-cyber-green text-black rounded-lg font-medium"
                                >
                                    {t('scamReport.beFirst', 'Сообщите первым')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredReports.map(report => (
                                    <div
                                        key={report.id}
                                        className="bg-card border border-border rounded-xl p-4 hover:border-cyber-green/30 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Risk indicator */}
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${report.riskLevel === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                                                    report.riskLevel === 'HIGH' ? 'bg-orange-500' :
                                                        report.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${RISK_COLORS[report.riskLevel || 'MEDIUM']}`}>
                                                        {SCAM_TYPE_LABELS[report.type]?.[lang] || report.type}
                                                    </span>
                                                    {report.status === 'verified' && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            {t('scamReport.verified', 'Проверено')}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeAgo(report.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className="font-medium text-foreground">{report.title}</h3>

                                                <p className={`text-sm text-muted-foreground mt-1 ${expandedReportId === report.id ? '' : 'line-clamp-2'
                                                    }`}>
                                                    {report.description}
                                                </p>

                                                {/* Expanded content */}
                                                {expandedReportId === report.id && (
                                                    <div className="mt-3 space-y-2 text-sm">
                                                        {report.location?.region && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <MapPin className="w-4 h-4" />
                                                                {report.location.city && `${report.location.city}, `}
                                                                {report.location.region}
                                                            </div>
                                                        )}
                                                        {report.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Phone className="w-4 h-4" />
                                                                {report.phoneNumber}
                                                            </div>
                                                        )}
                                                        {report.websiteUrl && (
                                                            <div className="flex items-center gap-2 text-red-400">
                                                                <Globe className="w-4 h-4" />
                                                                {report.websiteUrl}
                                                            </div>
                                                        )}
                                                        {report.aiAnalysis?.redFlags && report.aiAnalysis.redFlags.length > 0 && (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                                <span className="text-purple-400 text-xs">{t('scamReport.redFlags', 'Красные флаги')}:</span>
                                                                {report.aiAnalysis.redFlags.map((flag, i) => (
                                                                    <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs">
                                                                        {flag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mt-3">
                                                    <button
                                                        onClick={() => setExpandedReportId(
                                                            expandedReportId === report.id ? null : report.id
                                                        )}
                                                        className="text-xs text-muted-foreground hover:text-cyber-green flex items-center gap-1"
                                                    >
                                                        {expandedReportId === report.id ? (
                                                            <><ChevronUp className="w-4 h-4" /> {t('scamReport.showLess', 'Свернуть')}</>
                                                        ) : (
                                                            <><ChevronDown className="w-4 h-4" /> {t('scamReport.showMore', 'Подробнее')}</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpvote(report.id)}
                                                        className="text-xs text-muted-foreground hover:text-cyber-green flex items-center gap-1"
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                        {report.upvotes || 0} {t('scamReport.seenThis', 'тоже видели')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Report Form */
                    <div className="bg-card border border-border rounded-xl p-6">
                        {submitSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('scamReport.thankYou', 'Спасибо за сообщение!')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t('scamReport.thankYouDesc', 'Ваш отчёт поможет защитить других людей от мошенников.')}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Zap className="w-4 h-4 text-purple-400" />
                                    {t('scamReport.aiHint', 'ИИ автоматически определит тип мошенничества по вашему описанию')}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('scamReport.titleLabel', 'Заголовок')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder={t('scamReport.titlePlaceholder', 'Например: Звонок от "службы безопасности Kaspi"')}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('scamReport.descriptionLabel', 'Описание')} *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder={t('scamReport.descriptionPlaceholder', 'Подробно опишите, что произошло. Чем больше деталей, тем лучше...')}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none"
                                        required
                                    />

                                    {/* AI Preview */}
                                    {aiPreview && (
                                        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-medium text-purple-400">
                                                    {t('scamReport.aiAnalysis', 'ИИ-анализ')}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                                    {t('scamReport.detectedType', 'Тип')}: {SCAM_TYPE_LABELS[aiPreview.category]?.[lang]}
                                                </span>
                                                <span className={`px-2 py-1 rounded ${RISK_COLORS[aiPreview.riskLevel]}`}>
                                                    {t('scamReport.riskLevel', 'Риск')}: {RISK_LABELS[aiPreview.riskLevel]?.[lang]}
                                                </span>
                                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                                    {t('scamReport.confidence', 'Уверенность')}: {aiPreview.confidence}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Type (can override AI) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('scamReport.typeLabel', 'Тип мошенничества')}
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ScamType }))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground"
                                    >
                                        <option value="">{t('scamReport.selectType', 'Выберите тип (или ИИ определит автоматически)')}</option>
                                        {Object.entries(SCAM_TYPE_LABELS).map(([type, labels]) => (
                                            <option key={type} value={type}>{labels[lang]}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('scamReport.regionLabel', 'Регион')}
                                        </label>
                                        <select
                                            value={formData.region}
                                            onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground"
                                        >
                                            <option value="">{t('scamReport.selectRegion', 'Выберите регион')}</option>
                                            {KZ_REGIONS.map(region => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('scamReport.cityLabel', 'Город')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                            placeholder={t('scamReport.cityPlaceholder', 'Например: Алматы')}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Optional details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('scamReport.phoneLabel', 'Номер мошенника')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="+7 (xxx) xxx-xx-xx"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('scamReport.websiteLabel', 'Поддельный сайт')}
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.websiteUrl}
                                            onChange={e => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                            placeholder="https://fake-site.kz"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Impact estimate */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('scamReport.impactLabel', 'Сумма ущерба (если есть)')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.impactEstimate}
                                            onChange={e => setFormData(prev => ({ ...prev, impactEstimate: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-cyber-green focus:border-transparent text-foreground placeholder:text-muted-foreground pr-16"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">₸</span>
                                    </div>
                                </div>

                                {/* Error */}
                                {submitError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                                        <XCircle className="w-5 h-5" />
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.title || !formData.description}
                                    className="w-full py-4 bg-cyber-green text-black font-bold rounded-lg hover:bg-cyber-green-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> {t('scamReport.submitting', 'Отправка...')}</>
                                    ) : (
                                        <><Send className="w-5 h-5" /> {t('scamReport.submit', 'Отправить отчёт')}</>
                                    )}
                                </button>

                                <p className="text-xs text-muted-foreground text-center">
                                    {t('scamReport.disclaimer', 'Ваш отчёт будет проверен модератором перед публикацией')}
                                </p>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ScamReportPage;
