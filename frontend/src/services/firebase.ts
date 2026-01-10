import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, limit, onSnapshot } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBl6AJpAjSQQfiTtQ7SYTltHBeq7ainkrE",
    authDomain: "qadamsafe.firebaseapp.com",
    projectId: "qadamsafe",
    storageBucket: "qadamsafe.firebasestorage.app",
    messagingSenderId: "778402179060",
    appId: "1:778402179060:web:4c9dc57bd8bafb3e4b3ba1",
    measurementId: "G-R7DCXFY0NJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Types
interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    language: string;
    subscriptionTier: string;
    securityScore: number;
    rank: number;
    hasSeenWelcome: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============= AUTH API =============
export const firebaseAuthAPI = {
    register: async (data: { email: string; password: string; name?: string; language?: string }) => {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore
        const user: User = {
            id: firebaseUser.uid,
            email: data.email,
            name: data.name || '',
            role: 'USER',
            language: data.language || 'ru',
            subscriptionTier: 'FREE',
            securityScore: 0,
            rank: 1,
            hasSeenWelcome: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), user);

        // Get ID token for auth
        const token = await firebaseUser.getIdToken();

        return { user, token };
    },

    login: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const user = userDoc.data() as User;
        const token = await firebaseUser.getIdToken();

        return { user, token };
    },

    logout: async () => {
        await signOut(auth);
    },

    getMe: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        return userDoc.data() as User;
    },

    updateLanguage: async (language: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
            language,
            updatedAt: new Date(),
        });

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        return userDoc.data() as User;
    },

    markWelcomeSeen: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
            hasSeenWelcome: true,
            updatedAt: new Date(),
        });

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        return userDoc.data() as User;
    },

    getCurrentUser: () => auth.currentUser,

    loginWithGoogle: async (language?: string) => {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
            // Existing user - return profile
            const user = userDoc.data() as User;
            const token = await firebaseUser.getIdToken();
            return { user, token, isNewUser: false };
        } else {
            // New user - create profile
            const user: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                role: 'USER',
                language: language || 'ru',
                subscriptionTier: 'FREE',
                securityScore: 0,
                rank: 1,
                hasSeenWelcome: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), user);
            const token = await firebaseUser.getIdToken();
            return { user, token, isNewUser: true };
        }
    },
};

// ============= SCENARIOS API =============
export const firebaseScenariosAPI = {
    getAll: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        // Get all scenarios without ordering first to debug
        const scenariosQuery = query(collection(db, 'scenarios'));
        const scenariosSnap = await getDocs(scenariosQuery);
        const scenarios = scenariosSnap.docs.map(d => d.data());

        // Get user progress
        const progressQuery = query(collection(db, 'progress'), where('userId', '==', currentUser.uid));
        const progressSnap = await getDocs(progressQuery);
        const progress = progressSnap.docs.map(d => d.data());

        // Combine
        return scenarios.map(scenario => ({
            ...scenario,
            userProgress: progress.find(p => p.scenarioId === scenario.id) || null,
        }));
    },

    getById: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'scenarios', id));
        if (!docSnap.exists()) {
            throw new Error('Scenario not found');
        }
        return docSnap.data();
    },

    complete: async (scenarioId: string, data: { score: number; mistakes: number; decisions: any }) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const now = new Date();
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            where('scenarioId', '==', scenarioId),
            limit(1)
        );
        const progressSnap = await getDocs(progressQuery);

        let progressId: string;

        if (!progressSnap.empty) {
            // Update existing
            progressId = progressSnap.docs[0].id;
            await updateDoc(doc(db, 'progress', progressId), {
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
                completed: true,
                completedAt: now,
                updatedAt: now,
            });
        } else {
            // Create new
            progressId = doc(collection(db, 'progress')).id;
            await setDoc(doc(db, 'progress', progressId), {
                id: progressId,
                userId: currentUser.uid,
                scenarioId,
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
                completed: true,
                completedAt: now,
                createdAt: now,
                updatedAt: now,
            });
        }

        // Update user score and recalculate rank
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();

        // Get all completed progress to calculate rank
        const allProgressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            where('completed', '==', true)
        );
        const allProgressSnap = await getDocs(allProgressQuery);
        const allProgress = allProgressSnap.docs.map(d => d.data());

        // Calculate new rank based on performance
        const completedCount = allProgress.length;
        const totalMistakes = allProgress.reduce((sum, p: any) => sum + (p.mistakes || 0), 0);

        // Get total scenarios count
        const scenariosSnap = await getDocs(collection(db, 'scenarios'));
        const totalScenarios = scenariosSnap.size;

        // Calculate safe decision rate (lower mistakes = better)
        // Assume each scenario has 3 questions, 0 mistakes = 100% safe, each mistake reduces by ~33%
        const perfectScenarios = allProgress.filter((p: any) => (p.mistakes || 0) === 0).length;
        const safeDecisionRate = completedCount > 0
            ? Math.round((1 - (totalMistakes / (completedCount * 3))) * 100)
            : 0;

        // Rank calculation:
        // Rank 1: Default (registration)
        // Rank 2: Complete 3 scenarios without dangerous decisions
        // Rank 3: Complete 5+ scenarios with 70%+ safe decisions
        // Rank 4: Complete all 7 scenarios without a single error
        let newRank = 1;

        if (completedCount >= totalScenarios && totalMistakes === 0) {
            // All scenarios completed without any mistakes
            newRank = 4;
        } else if (completedCount >= 5 && safeDecisionRate >= 70) {
            // 5+ scenarios with 70%+ safe decisions
            newRank = 3;
        } else if (perfectScenarios >= 3) {
            // 3+ scenarios completed without dangerous decisions
            newRank = 2;
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
            securityScore: (userData?.securityScore || 0) + data.score,
            rank: newRank,
            updatedAt: now,
        });

        return { success: true, score: data.score, mistakes: data.mistakes };
    },
};

// ============= PROGRESS API =============
export const firebaseProgressAPI = {
    getProgress: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            orderBy('completedAt', 'desc')
        );
        const progressSnap = await getDocs(progressQuery);
        return progressSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // Real-time listener for progress updates
    subscribeToProgress: (callback: (progress: any[]) => void) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return () => { };
        }

        // Query with completed filter first
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            where('completed', '==', true),
            limit(20)
        );

        const unsubscribe = onSnapshot(progressQuery, async (snapshot) => {
            let progress = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Sort by completedAt in memory (in case Firestore index is not available)
            progress = progress.sort((a: any, b: any) => {
                const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt || 0);
                const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt || 0);
                return dateB.getTime() - dateA.getTime();
            }).slice(0, 10);

            // Load scenario data for each progress item
            const progressWithScenarios = await Promise.all(
                progress.map(async (p: any) => {
                    if (p.scenarioId) {
                        try {
                            const scenarioDoc = await getDoc(doc(db, 'scenarios', p.scenarioId));
                            if (scenarioDoc.exists()) {
                                p.scenario = { id: scenarioDoc.id, ...scenarioDoc.data() };
                            }
                        } catch (error) {
                            console.error('Error loading scenario:', error);
                        }
                    }
                    return p;
                })
            );

            callback(progressWithScenarios);
        }, (error) => {
            console.error('Error subscribing to progress:', error);
        });

        return unsubscribe;
    },

    getStats: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            where('completed', '==', true)
        );
        const progressSnap = await getDocs(progressQuery);
        const progress = progressSnap.docs.map(d => d.data());

        const scenariosSnap = await getDocs(collection(db, 'scenarios'));
        const total = scenariosSnap.size;

        const completed = progress.length;
        const totalScore = progress.reduce((sum, p: any) => sum + (p.score || 0), 0);
        const totalMistakes = progress.reduce((sum, p: any) => sum + (p.mistakes || 0), 0);
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, totalScore, totalMistakes, completionRate };
    },
};

// ============= ACHIEVEMENTS API =============
export const firebaseAchievementsAPI = {
    getAll: async () => {
        const achievementsSnap = await getDocs(collection(db, 'achievements'));
        return achievementsSnap.docs.map(d => d.data());
    },

    getUserAchievements: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const userAchQuery = query(collection(db, 'userAchievements'), where('userId', '==', currentUser.uid));
        const userAchSnap = await getDocs(userAchQuery);
        return userAchSnap.docs.map(d => d.data());
    },
};

// ============= AI SCENARIOS API =============

// Gemini API configuration
const GEMINI_API_KEYS = [
    'AIzaSyClYvOSI5DT8vQGR9Upiq-MQ_FAhEhZ_I8',
];

// Use stable Gemini 2.0 Flash model (more reliable than "latest")
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Helper function for exponential backoff retry with timeout
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES,
    delay = INITIAL_RETRY_DELAY
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        // If rate limited (429) or server error (5xx), retry
        if (response.status === 429 || response.status >= 500) {
            if (retries > 0) {
                console.warn(`API returned ${response.status}, retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
        }

        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            if (retries > 0) {
                console.warn(`Request timed out, retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            throw new Error('Request timed out after multiple attempts');
        }

        // Network errors - retry
        if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
            console.warn(`Network error, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }

        throw error;
    }
}

// Helper to try multiple API keys
async function callGeminiWithFallback(
    endpoint: string,
    body: object
): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const apiKey = GEMINI_API_KEYS[i];
        const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:${endpoint}?key=${apiKey}`;

        try {
            const response = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            // If successful or client error (4xx except 429), return
            if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
                return response;
            }

            // If failed, try next key
            console.warn(`API key ${i + 1} failed with status ${response.status}, trying next key...`);
            lastError = new Error(`API returned status ${response.status}`);
        } catch (error: any) {
            console.warn(`API key ${i + 1} failed:`, error.message);
            lastError = error;
        }
    }

    throw lastError || new Error('All API keys failed');
}

const AI_SCENARIO_PROMPT = `Ты эксперт по кибербезопасности. Создай интерактивный обучающий сценарий о мошенничестве.

ВАЖНО: Верни ТОЛЬКО валидный JSON без markdown, без \`\`\`json, просто чистый JSON объект.

Формат ответа (строго следуй этой структуре):
{
  "title": "Название сценария на русском",
  "titleEn": "Title in English",
  "titleKk": "Қазақша атауы",
  "description": "Краткое описание на русском",
  "descriptionEn": "Brief description in English",
  "descriptionKk": "Қысқаша сипаттама қазақша",
  "steps": [
    {
      "id": "step1",
      "type": "question",
      "visualType": "phone",
      "phoneMessageType": "sms или whatsapp или telegram или call",
      "senderName": "Имя отправителя",
      "senderNameEn": "Sender name",
      "senderNameKk": "Жіберуші аты",
      "senderNumber": "+7 7XX XXX XX XX",
      "profileEmoji": "подходящий emoji",
      "messageText": "Текст сообщения мошенника на русском с emoji",
      "messageTextEn": "Message text in English",
      "messageTextKk": "Хабарлама мәтіні қазақша",
      "question": "Вопрос для пользователя",
      "questionEn": "Question in English",
      "questionKk": "Сұрақ қазақша",
      "options": [
        {
          "id": "opt1",
          "text": "Опасный выбор (попасться на уловку)",
          "textEn": "Dangerous choice",
          "textKk": "Қауіпті таңдау",
          "outcomeType": "dangerous",
          "explanation": "Подробное объяснение почему это опасно, с советом 💡",
          "explanationEn": "Detailed explanation in English",
          "explanationKk": "Толық түсіндірме қазақша"
        },
        {
          "id": "opt2", 
          "text": "Безопасный выбор",
          "textEn": "Safe choice",
          "textKk": "Қауіпсіз таңдау",
          "outcomeType": "safe",
          "explanation": "Объяснение почему это правильно 💡",
          "explanationEn": "Explanation in English",
          "explanationKk": "Түсіндірме қазақша"
        },
        {
          "id": "opt3",
          "text": "Рискованный выбор",
          "textEn": "Risky choice", 
          "textKk": "Тәуекелді таңдау",
          "outcomeType": "risky",
          "explanation": "Объяснение почему это рискованно 💡",
          "explanationEn": "Explanation in English",
          "explanationKk": "Түсіндірме қазақша"
        }
      ]
    }
  ],
  "completionBlock": {
    "title": "Сценарий пройден!",
    "titleEn": "Scenario Complete!",
    "titleKk": "Сценарий аяқталды!",
    "summary": "📌 Итоги и советы по защите",
    "summaryEn": "📌 Summary and protection tips",
    "summaryKk": "📌 Қорытындылар мен қорғау кеңестері"
  }
}

Создай сценарий с 2-3 шагами (steps). Каждый шаг должен быть реалистичной ситуацией мошенничества в Казахстане.
ВАЖНО: В каждом шаге (step) должно быть РОВНО 3 варианта ответа (options): один опасный, один безопасный, один рискованный (или другом порядке). НЕ МЕНЬШЕ И НЕ БОЛЬШЕ 3 вариантов.
Используй местные банки (Kaspi, Halyk, Forte), госуслуги (eGov), местные номера телефонов.
Объяснения должны быть подробными и образовательными.`;

const topicPrompts: Record<string, string> = {
    sms_phishing: "Тема: SMS-фишинг от банка или лотереи. Мошенник присылает SMS о блокировке карты или выигрыше.",
    phone_scam: "Тема: Телефонный звонок от 'службы безопасности банка'. Мошенник звонит и пугает подозрительной операцией.",
    social_engineering: "Тема: Сообщение от 'родственника' или 'друга' с просьбой о деньгах с нового номера.",
    fake_government: "Тема: Фейковые госуслуги. Мошенник обещает выплату от государства через поддельный сайт.",
    investment_scam: "Тема: Инвестиционное мошенничество. Обещание гарантированного высокого дохода.",
    online_shopping: "Тема: Мошенничество при онлайн-покупках. Фейковый продавец на OLX или Kaspi Объявлениях.",
    romance_scam: "Тема: Романтическое мошенничество в соцсетях. Знакомство онлайн с последующей просьбой о деньгах.",
    job_scam: "Тема: Мошенничество с вакансиями. Предложение работы с предоплатой или сбором данных."
};

export interface AITopic {
    id: string;
    name: string;
    nameEn: string;
    nameKk: string;
    icon: string;
    color: string;
}

export const firebaseAIAPI = {
    // Get available topics for AI scenario generation
    getTopics: async (): Promise<AITopic[]> => {
        return [
            { id: "sms_phishing", name: "SMS-фишинг", nameEn: "SMS Phishing", nameKk: "SMS-фишинг", icon: "📱", color: "cyber-green" },
            { id: "phone_scam", name: "Телефонные мошенники", nameEn: "Phone Scams", nameKk: "Телефон алаяқтары", icon: "📞", color: "cyber-yellow" },
            { id: "social_engineering", name: "Социальная инженерия", nameEn: "Social Engineering", nameKk: "Әлеуметтік инженерия", icon: "👤", color: "cyber-blue" },
            { id: "fake_government", name: "Фейковые госуслуги", nameEn: "Fake Government", nameKk: "Жалған мемлекеттік қызметтер", icon: "🏛️", color: "cyber-red" },
            { id: "investment_scam", name: "Инвестиционное мошенничество", nameEn: "Investment Scams", nameKk: "Инвестициялық алаяқтық", icon: "💰", color: "cyber-yellow" },
            { id: "online_shopping", name: "Онлайн-покупки", nameEn: "Online Shopping", nameKk: "Онлайн-сатып алу", icon: "🛒", color: "cyber-green" },
            { id: "romance_scam", name: "Романтические мошенники", nameEn: "Romance Scams", nameKk: "Романтикалық алаяқтық", icon: "💕", color: "cyber-red" },
            { id: "job_scam", name: "Мошенничество с работой", nameEn: "Job Scams", nameKk: "Жұмыс алаяқтығы", icon: "💼", color: "cyber-blue" }
        ];
    },

    // Generate a new AI scenario using Gemini API directly
    generateScenario: async (topic: string, _language: string = 'ru') => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const selectedTopic = topicPrompts[topic] || topicPrompts.sms_phishing;
        const fullPrompt = AI_SCENARIO_PROMPT + "\n\n" + selectedTopic;

        // Call Gemini API with retry and fallback keys
        const response = await callGeminiWithFallback('generateContent', {
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 8192,
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || 'Failed to generate AI scenario');
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Empty response from AI');
        }

        // Clean the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON response
        let scenarioData;
        try {
            scenarioData = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            throw new Error('Failed to parse AI response');
        }

        // Create a complete scenario object
        const now = new Date().toISOString();
        const scenarioId = `ai_scenario_${Date.now()}`;

        const scenario = {
            id: scenarioId,
            title: scenarioData.title,
            titleEn: scenarioData.titleEn,
            titleKk: scenarioData.titleKk,
            description: scenarioData.description,
            descriptionEn: scenarioData.descriptionEn,
            descriptionKk: scenarioData.descriptionKk,
            type: topic?.toUpperCase() || "AI_GENERATED",
            difficulty: "INTERMEDIATE",
            requiredTier: "FREE",
            pointsReward: 15,
            order: 100,
            isLegitimate: false,
            isAIGenerated: true,
            generatedAt: now,
            content: {
                steps: scenarioData.steps
            },
            completionBlock: scenarioData.completionBlock,
            createdAt: now,
            updatedAt: now
        };

        // Save to user's subcollection
        await setDoc(doc(db, 'users', currentUser.uid, 'aiScenarios', scenarioId), scenario);

        return scenario;
    },

    // Get user's previously generated AI scenarios
    getMyScenarios: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        // Get from user's subcollection
        const aiScenariosQuery = query(
            collection(db, 'users', currentUser.uid, 'aiScenarios'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(aiScenariosQuery);
        return snapshot.docs.map(d => d.data());
    },

    // Get a specific AI scenario by ID
    getScenarioById: async (scenarioId: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const docRef = doc(db, 'users', currentUser.uid, 'aiScenarios', scenarioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    },

    // Complete an AI scenario (save progress)
    completeAIScenario: async (scenarioId: string, data: { score: number; mistakes: number; decisions: any }) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const now = new Date();

        // Save progress for AI scenario
        const progressId = `ai_progress_${scenarioId}`;
        await setDoc(doc(db, 'users', currentUser.uid, 'aiProgress', progressId), {
            id: progressId,
            userId: currentUser.uid,
            scenarioId,
            score: data.score,
            mistakes: data.mistakes,
            decisions: data.decisions,
            completed: true,
            completedAt: now,
            createdAt: now,
            updatedAt: now,
        });

        // Update user score
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        await updateDoc(doc(db, 'users', currentUser.uid), {
            securityScore: (userData?.securityScore || 0) + data.score,
            updatedAt: now,
        });

        return { success: true, score: data.score, mistakes: data.mistakes };
    },
};

// ============= AI ASSISTANT API =============

const AI_ASSISTANT_SYSTEM_PROMPT = `
You are QadamSafe AI, an advanced cybersecurity assistant.
Your goal is to educate users about digital safety, analyze potential threats, and provide actionable advice.

Tone: Professional, vigilant, encouraging, yet serious about threats. "Cyberpunk" flavor is allowed but keep it professional.
Style: Concise, clear, easy to understand. Avoid jargon where possible, or explain it.

Capabilities:
1. Threat Analysis: If a user pastes a message/email, analyze it for phishing indicators (urgency, suspicious links, emotional manipulation).
2. Password Advice: Explain how to create strong passwords.
3. Education: Explain terms like 2FA, VPN, Phishing, Malware.
4. Roleplay: If requested, act as a scammer to train the user (but make it clear it's a simulation).

Safety Rules:
- NEVER ask for real passwords, credit card numbers, or personal info.
- If a user shares real sensitive data, tell them to delete it immediately.
- Do not provide instructions on how to hack or exploit systems (defensive only).
- If asked about non-cybersecurity topics, politely redirect to cybersecurity.

Format: Keep answers relatively short (under 200 words) unless asked for details. Use formatting (bold, lists) for readability.
`;

export const firebaseAssistantAPI = {
    sendMessage: async (message: string, history: { role: 'user' | 'model'; parts: string }[]) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        // Construct the contents using valid message turns
        const contents = [
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts }]
            })),
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ];

        try {
            // Call Gemini API with retry and fallback keys
            const response = await callGeminiWithFallback('generateContent', {
                systemInstruction: {
                    parts: [{ text: AI_ASSISTANT_SYSTEM_PROMPT }]
                },
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error:', JSON.stringify(errorData, null, 2));
                throw new Error(errorData.error?.message || 'Failed to get AI response');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('Empty response from AI');
            }

            return text;
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    }
};

export { auth, db };
