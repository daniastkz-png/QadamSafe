export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'USER' | 'ADMIN' | string;
    language: string;
    subscriptionTier: 'FREE' | 'PRO' | 'BUSINESS' | string;
    securityScore: number;
    rank: number;
    hasSeenWelcome: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface Scenario {
    id: string;
    title: string;
    titleEn?: string;
    titleKk?: string;
    description: string;
    descriptionEn?: string;
    descriptionKk?: string;
    type: 'EMAIL_PHISHING' | 'SMS_PHISHING' | 'FAKE_WEBSITE' | 'SOCIAL_ENGINEERING' | 'MALWARE_DETECTION' | 'PHISHING' | 'INVESTMENT_SCAM' | 'AI_GENERATED' | string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    requiredTier: 'FREE' | 'PRO' | 'BUSINESS';
    pointsReward: number;
    order: number;
    prerequisiteScenarioId?: string;
    isLegitimate: boolean;
    isAIGenerated?: boolean;
    legitimateExplanation?: string;
    scamExplanation?: string;
    content: ScenarioContent;
    completionBlock?: {
        title: string;
        titleEn?: string;
        titleKk?: string;
        summary: string;
        summaryEn?: string;
        summaryKk?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ScenarioContent {
    steps: ScenarioStep[];
}

export interface ScenarioStep {
    id: string;
    type: 'question' | 'information' | 'decision';
    content: string; // Legacy field, kept for backward compatibility
    contentEn?: string;
    contentKk?: string;
    context?: string; // Scenario context (SMS text, call description, etc.)
    contextEn?: string;
    contextKk?: string;
    question?: string; // The actual question ("What will you do?")
    questionEn?: string;
    questionKk?: string;
    options?: ScenarioOption[];
    explanation?: string;
    explanationEn?: string;
    explanationKk?: string;
    nextStepId?: string; // For linear progression
    // Immersive visualization options
    visualType?: 'phone' | 'text'; // Type of visualization
    phoneMessageType?: 'sms' | 'whatsapp' | 'telegram' | 'call'; // Messenger type for phone visual
    senderName?: string;
    senderNameEn?: string;
    senderNameKk?: string;
    senderNumber?: string;
    messageText?: string; // Short message for phone display
    messageTextEn?: string;
    messageTextKk?: string;
    profileEmoji?: string; // Emoji for sender avatar
}

export interface ScenarioOption {
    id: string;
    text: string;
    textEn?: string;
    textKk?: string;
    outcomeType: 'safe' | 'risky' | 'dangerous';
    nextStepId?: string; // For branching - which step to go to if this option is chosen
    explanation?: string;
    explanationEn?: string;
    explanationKk?: string;
}

export interface UserProgress {
    id: string;
    userId: string;
    scenarioId: string;
    completed: boolean;
    score: number;
    mistakes: number;
    decisions?: any;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    scenario?: Scenario;
}

export interface Achievement {
    id: string;
    key: string;
    title: string;
    titleEn?: string;
    titleKk?: string;
    description: string;
    descriptionEn?: string;
    descriptionKk?: string;
    icon: string;
    requiredValue: number;
    createdAt: string;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    completed: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    achievement: Achievement;
}

export interface ProgressStats {
    completed: number;
    total: number;
    totalScore: number;
    totalMistakes: number;
    completionRate: number;
}

// Kazakh Scam Database types
export type ScamType =
    | 'PHONE_SCAM'      // Телефонное мошенничество
    | 'SMS_PHISHING'    // SMS-фишинг
    | 'WHATSAPP_SCAM'   // WhatsApp мошенничество
    | 'FAKE_WEBSITE'    // Поддельные сайты
    | 'INVESTMENT_SCAM' // Инвестиционное мошенничество
    | 'JOB_SCAM'        // Работа-мошенничество (Wildberries и т.д.)
    | 'ROMANCE_SCAM'    // Романтическое мошенничество
    | 'LOTTERY_SCAM'    // Лотереи и выигрыши
    | 'BANK_IMPERSONATION' // Под видом банка
    | 'GOVERNMENT_IMPERSONATION' // Под видом госорганов
    | 'OTHER';          // Другое

export type ScamReportStatus = 'pending' | 'verified' | 'fake' | 'duplicate';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScamReport {
    id: string;
    type: ScamType;
    title: string;
    description: string;
    screenshots?: string[];
    location?: {
        city?: string;
        region?: string;
    };
    reportedBy: string;
    reporterName?: string;
    createdAt: any;
    updatedAt?: any;
    status: ScamReportStatus;
    riskLevel?: RiskLevel;
    impactEstimate?: number; // В тенге
    phoneNumber?: string; // Номер мошенника (если есть)
    websiteUrl?: string;  // URL поддельного сайта (если есть)
    aiAnalysis?: {
        category: ScamType;
        confidence: number;
        summary: string;
        redFlags: string[];
    };
    upvotes?: number;
    relatedScenarioId?: string;
}
