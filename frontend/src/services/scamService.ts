import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { ScamReport, ScamType, RiskLevel } from '../types';

// Kazakhstan regions for location selection
export const KZ_REGIONS = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Алматинская область',
    'Акмолинская область',
    'Актюбинская область',
    'Атырауская область',
    'Восточно-Казахстанская область',
    'Жамбылская область',
    'Западно-Казахстанская область',
    'Карагандинская область',
    'Костанайская область',
    'Кызылординская область',
    'Мангистауская область',
    'Павлодарская область',
    'Северо-Казахстанская область',
    'Туркестанская область',
    'Улытауская область',
    'Абай область',
    'Жетысу область'
];

// Scam type labels for UI
export const SCAM_TYPE_LABELS: Record<ScamType, { ru: string; en: string; kk: string }> = {
    'PHONE_SCAM': { ru: 'Телефонное мошенничество', en: 'Phone Scam', kk: 'Телефон алаяқтығы' },
    'SMS_PHISHING': { ru: 'SMS-фишинг', en: 'SMS Phishing', kk: 'SMS-фишинг' },
    'WHATSAPP_SCAM': { ru: 'WhatsApp мошенничество', en: 'WhatsApp Scam', kk: 'WhatsApp алаяқтығы' },
    'FAKE_WEBSITE': { ru: 'Поддельный сайт', en: 'Fake Website', kk: 'Жалған сайт' },
    'INVESTMENT_SCAM': { ru: 'Инвестиционное мошенничество', en: 'Investment Scam', kk: 'Инвестициялық алаяқтық' },
    'JOB_SCAM': { ru: 'Мошенничество с работой', en: 'Job Scam', kk: 'Жұмыс алаяқтығы' },
    'ROMANCE_SCAM': { ru: 'Романтическое мошенничество', en: 'Romance Scam', kk: 'Романтикалық алаяқтық' },
    'LOTTERY_SCAM': { ru: 'Лотерея / Выигрыш', en: 'Lottery / Prize Scam', kk: 'Лотерея / Ұтыс алаяқтығы' },
    'BANK_IMPERSONATION': { ru: 'Под видом банка', en: 'Bank Impersonation', kk: 'Банк атынан' },
    'GOVERNMENT_IMPERSONATION': { ru: 'Под видом госорганов', en: 'Government Impersonation', kk: 'Мемлекеттік орган атынан' },
    'OTHER': { ru: 'Другое', en: 'Other', kk: 'Басқа' }
};

// Keywords for AI auto-categorization
const SCAM_KEYWORDS: Record<ScamType, string[]> = {
    'PHONE_SCAM': ['позвонили', 'звонок', 'голос', 'разговор', 'трубка'],
    'SMS_PHISHING': ['смс', 'sms', 'сообщение', 'ссылка', 'перейдите'],
    'WHATSAPP_SCAM': ['whatsapp', 'вотсап', 'ватсап', 'мессенджер'],
    'FAKE_WEBSITE': ['сайт', 'страница', 'домен', 'url', 'ввел данные', 'форма'],
    'INVESTMENT_SCAM': ['инвестиц', 'доход', 'прибыль', 'заработок', 'крипт', 'биткоин', 'торговля'],
    'JOB_SCAM': ['работа', 'вакансия', 'менеджер', 'wildberries', 'ozon', 'маркетплейс', 'выкуп', 'взнос'],
    'ROMANCE_SCAM': ['познакомились', 'отношения', 'любовь', 'свидание', 'деньги на билет'],
    'LOTTERY_SCAM': ['выигра', 'приз', 'лотерея', 'розыгрыш', 'победитель'],
    'BANK_IMPERSONATION': ['банк', 'kaspi', 'halyk', 'карта', 'блокировка', 'перевод', 'безопасност'],
    'GOVERNMENT_IMPERSONATION': ['egov', 'полиц', 'суд', 'налог', 'штраф', 'министерств'],
    'OTHER': []
};

// Risk keywords for severity assessment
const HIGH_RISK_KEYWORDS = ['перевел', 'потерял', 'украли', 'списали', 'взломали', 'доступ к карте'];
const CRITICAL_KEYWORDS = ['все деньги', 'кредит', 'заем', 'ипотека', 'пенсия', 'сбережения'];

/**
 * AI-powered scam categorization
 */
export const analyzeScamReport = (description: string): {
    category: ScamType;
    confidence: number;
    riskLevel: RiskLevel;
    redFlags: string[];
} => {
    const lowerDesc = description.toLowerCase();
    const scores: Record<ScamType, number> = {} as Record<ScamType, number>;
    const redFlags: string[] = [];

    // Score each category based on keyword matches
    for (const [type, keywords] of Object.entries(SCAM_KEYWORDS)) {
        scores[type as ScamType] = 0;
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword)) {
                scores[type as ScamType] += 1;
                if (!redFlags.includes(keyword)) {
                    redFlags.push(keyword);
                }
            }
        }
    }

    // Find the category with highest score
    let maxScore = 0;
    let bestCategory: ScamType = 'OTHER';
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = type as ScamType;
        }
    }

    // Calculate confidence (0-100)
    const confidence = Math.min(100, maxScore * 25);

    // Assess risk level
    let riskLevel: RiskLevel = 'LOW';
    for (const keyword of HIGH_RISK_KEYWORDS) {
        if (lowerDesc.includes(keyword)) {
            riskLevel = 'HIGH';
            break;
        }
    }
    for (const keyword of CRITICAL_KEYWORDS) {
        if (lowerDesc.includes(keyword)) {
            riskLevel = 'CRITICAL';
            break;
        }
    }
    if (riskLevel === 'LOW' && maxScore > 0) {
        riskLevel = 'MEDIUM';
    }

    return {
        category: bestCategory,
        confidence,
        riskLevel,
        redFlags: redFlags.slice(0, 5) // Top 5 red flags
    };
};

/**
 * Submit a new scam report
 */
export const submitScamReport = async (
    userId: string,
    userName: string,
    data: {
        type: ScamType;
        title: string;
        description: string;
        location?: { city?: string; region?: string };
        phoneNumber?: string;
        websiteUrl?: string;
        impactEstimate?: number;
    }
): Promise<string> => {
    // AI analysis
    const analysis = analyzeScamReport(data.description);

    const report: Omit<ScamReport, 'id'> = {
        type: data.type || analysis.category,
        title: data.title,
        description: data.description,
        location: data.location,
        phoneNumber: data.phoneNumber,
        websiteUrl: data.websiteUrl,
        impactEstimate: data.impactEstimate,
        reportedBy: userId,
        reporterName: userName,
        createdAt: Timestamp.now(),
        status: 'pending',
        riskLevel: analysis.riskLevel,
        aiAnalysis: {
            category: analysis.category,
            confidence: analysis.confidence,
            summary: `Обнаружены признаки: ${SCAM_TYPE_LABELS[analysis.category].ru}`,
            redFlags: analysis.redFlags
        },
        upvotes: 0
    };

    const docRef = await addDoc(collection(db, 'scamReports'), report);
    return docRef.id;
};

/**
 * Get recent verified scam reports (for the news feed)
 */
export const getRecentScamReports = async (limitCount: number = 20): Promise<ScamReport[]> => {
    const q = query(
        collection(db, 'scamReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ScamReport));
};

/**
 * Get reports by type
 */
export const getReportsByType = async (type: ScamType): Promise<ScamReport[]> => {
    const q = query(
        collection(db, 'scamReports'),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ScamReport));
};

/**
 * Upvote a report (to indicate "I've seen this too")
 */
export const upvoteReport = async (reportId: string): Promise<void> => {
    const reportRef = doc(db, 'scamReports', reportId);
    await updateDoc(reportRef, {
        upvotes: increment(1)
    });
};

/**
 * Get statistics for the dashboard
 */
export const getScamStatistics = async (): Promise<{
    totalReports: number;
    thisMonth: number;
    byType: Record<ScamType, number>;
    topRegions: { region: string; count: number }[];
}> => {
    const snapshot = await getDocs(collection(db, 'scamReports'));
    const reports = snapshot.docs.map(doc => doc.data() as ScamReport);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const byType: Partial<Record<ScamType, number>> = {};
    const byRegion: Record<string, number> = {};
    let thisMonth = 0;

    reports.forEach(report => {
        // Count by type
        byType[report.type] = (byType[report.type] || 0) + 1;

        // Count by region
        if (report.location?.region) {
            byRegion[report.location.region] = (byRegion[report.location.region] || 0) + 1;
        }

        // Count this month
        const reportDate = report.createdAt?.toDate?.() || new Date(report.createdAt);
        if (reportDate >= monthStart) {
            thisMonth++;
        }
    });

    // Sort regions by count
    const topRegions = Object.entries(byRegion)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        totalReports: reports.length,
        thisMonth,
        byType: byType as Record<ScamType, number>,
        topRegions
    };
};
