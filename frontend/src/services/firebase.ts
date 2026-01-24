import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, limit, onSnapshot } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import type { UserProgress } from '../types';

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
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Connect to Firebase Functions emulator only when explicitly enabled (avoids "Failed to fetch" if emulator isn't running)
if (window.location.hostname === 'localhost' && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true') {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.log('🔧 Connected to Firebase Functions Emulator');
}

// Backend API URL (must be set for /api/ai/generate-scenario and /api/ai/chat)
// Local: VITE_API_URL=http://localhost:3001 in .env.local; production: your Render backend, e.g. https://qadamsafe-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "https://qadamsafe-api.onrender.com";

const API_TIMEOUT_MS = 90000; // 90s for Render cold start

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: ctrl.signal });
        return res;
    } catch (e: any) {
        if (e?.name === "AbortError") {
            throw new Error("Сервер не ответил вовремя. На Render первый запрос после паузы может занять ~1 мин. Попробуйте ещё раз.");
        }
        if (typeof e?.message === "string" && (e.message === "Failed to fetch" || e.message.includes("network") || e.message.includes("Load failed"))) {
            throw new Error("Не удалось подключиться к серверу. Проверьте: 1) бэкенд запущен (локально: localhost:3001; прод: Render), 2) в .env.local задан VITE_API_URL=http://localhost:3001 для локальной разработки.");
        }
        throw e;
    } finally {
        clearTimeout(id);
    }
}

// Scenario cache for optimizing real-time listeners
const scenarioCache = new Map<string, any>();

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

        // Get all scenarios
        const scenariosQuery = query(collection(db, 'scenarios'));
        const scenariosSnap = await getDocs(scenariosQuery);
        const scenarios = scenariosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fill scenario cache
        scenarios.forEach(scenario => {
            if (scenario.id) {
                scenarioCache.set(scenario.id, scenario);
            }
        });

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

// ============= PROGRESS API (AI-only: users/{uid}/aiProgress) =============
export const firebaseProgressAPI = {
    getProgress: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('Not authenticated');

        const aiProgressRef = collection(db, 'users', currentUser.uid, 'aiProgress');
        const q = query(aiProgressRef, orderBy('completedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({
            id: d.id,
            userId: currentUser.uid,
            scenarioId: d.data().scenarioId,
            completed: true,
            score: d.data().score,
            mistakes: d.data().mistakes,
            completedAt: d.data().completedAt,
            ...d.data()
        }));
    },

    subscribeToProgress: (callback: (progress: UserProgress[]) => void) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return () => {};

        const aiProgressRef = collection(db, 'users', currentUser.uid, 'aiProgress');
        const q = query(aiProgressRef, orderBy('completedAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            let progress = snapshot.docs.map(d => ({
                id: d.id,
                userId: currentUser.uid,
                scenarioId: d.data().scenarioId,
                completed: true,
                score: d.data().score,
                mistakes: d.data().mistakes,
                completedAt: d.data().completedAt,
                ...d.data()
            }));

            const scenarioIdsToLoad = new Set<string>();
            progress.forEach((p: any) => {
                if (p.scenarioId && !scenarioCache.has(p.scenarioId)) scenarioIdsToLoad.add(p.scenarioId);
            });

            await Promise.all(Array.from(scenarioIdsToLoad).map(async (scenarioId) => {
                try {
                    const scenarioDoc = await getDoc(doc(db, 'users', currentUser.uid, 'aiScenarios', scenarioId));
                    if (scenarioDoc.exists()) scenarioCache.set(scenarioId, { id: scenarioDoc.id, ...scenarioDoc.data() });
                } catch { /* ignore */ }
            }));

            const progressWithScenarios = progress.map((p: any) => {
                if (p.scenarioId && scenarioCache.has(p.scenarioId)) p.scenario = scenarioCache.get(p.scenarioId);
                return p;
            });

            callback(progressWithScenarios);
        }, () => {});

        return unsubscribe;
    },

    getStats: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('Not authenticated');

        const aiProgressRef = collection(db, 'users', currentUser.uid, 'aiProgress');
        const q = query(aiProgressRef, where('completed', '==', true));
        const snap = await getDocs(q);
        const progress = snap.docs.map(d => d.data());

        const completed = progress.length;
        const total = Math.max(completed, 1);
        const totalScore = progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
        const totalMistakes = progress.reduce((sum: number, p: any) => sum + (p.mistakes || 0), 0);
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
            // KASPI BANK
            { id: "kaspi_sms", name: "Kaspi фишинг SMS", nameEn: "Kaspi SMS Phishing", nameKk: "Kaspi SMS алаяқтығы", icon: "💳", color: "cyber-green" },
            { id: "kaspi_call", name: "Звонки от 'Kaspi'", nameEn: "Fake Kaspi Calls", nameKk: "Жалған Kaspi қоңыраулары", icon: "📞", color: "cyber-red" },

            // eGOV
            { id: "egov_scam", name: "Фейковый eGov", nameEn: "Fake eGov", nameKk: "Жалған eGov", icon: "🏛️", color: "cyber-blue" },

            // МАРКЕТПЛЕЙСЫ  
            { id: "olx_scam", name: "Мошенники на OLX", nameEn: "OLX Scammers", nameKk: "OLX алаяқтары", icon: "🛒", color: "cyber-yellow" },
            { id: "kolesa_scam", name: "Обман на Kolesa.kz", nameEn: "Kolesa.kz Fraud", nameKk: "Kolesa.kz алаяқтығы", icon: "🚗", color: "cyber-green" },

            // МЕССЕНДЖЕРЫ
            { id: "telegram_scam", name: "Взлом Telegram", nameEn: "Telegram Hacking", nameKk: "Telegram бұзу", icon: "✈️", color: "cyber-blue" },
            { id: "whatsapp_relative", name: "'Мама' просит деньги", nameEn: "Fake Relative", nameKk: "Жалған туыс", icon: "👨‍👩‍👧", color: "cyber-red" },

            // РАБОТА
            { id: "job_enbek", name: "Фейковые вакансии", nameEn: "Fake Jobs", nameKk: "Жалған вакансиялар", icon: "💼", color: "cyber-yellow" },
            { id: "crypto_work", name: "Крипто-заработок", nameEn: "Crypto Earnings", nameKk: "Крипто табыс", icon: "₿", color: "cyber-green" },

            // УСЛУГИ
            { id: "utility_scam", name: "Фейковые долги ЖКХ", nameEn: "Fake Utility Bills", nameKk: "Жалған коммуналдық төлемдер", icon: "💡", color: "cyber-blue" },

            // ДОСТАВКА
            { id: "delivery_kazpost", name: "Фейковый Kazpost", nameEn: "Fake Kazpost", nameKk: "Жалған Kazpost", icon: "📦", color: "cyber-yellow" },
            { id: "glovo_scam", name: "Мошенники Glovo", nameEn: "Glovo Scammers", nameKk: "Glovo алаяқтары", icon: "🛵", color: "cyber-red" },

            // ФИНАНСЫ
            { id: "investment_pyramid", name: "Финансовые пирамиды", nameEn: "Financial Pyramids", nameKk: "Қаржылық пирамидалар", icon: "📈", color: "cyber-green" },

            // РАЗНОЕ
            { id: "lottery", name: "Фейковые розыгрыши", nameEn: "Fake Lotteries", nameKk: "Жалған ұтыс ойындары", icon: "🎰", color: "cyber-yellow" },
            { id: "charity", name: "Фейковые сборы", nameEn: "Fake Charity", nameKk: "Жалған қайырымдылық", icon: "🎗️", color: "cyber-blue" },
            { id: "taxi_scam", name: "Обман в такси", nameEn: "Taxi Scams", nameKk: "Такси алаяқтығы", icon: "🚕", color: "cyber-red" }
        ];
    },

    // Generate a new AI scenario using backend API
    generateScenario: async (topic: string, language: string = 'ru') => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        try {
            const token = await currentUser.getIdToken();

            const response = await fetchWithTimeout(`${API_URL}/api/ai/generate-scenario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic,
                    language
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate AI scenario');
            }

            const data = await response.json();
            return data.scenario;
        } catch (error) {
            console.error("AI Scenario Gen Error:", error);
            throw error;
        }
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

export const firebaseAssistantAPI = {
    sendMessage: async (message: string, history: { role: 'user' | 'model'; parts: string }[]) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        try {
            // Get Firebase auth token
            const token = await currentUser.getIdToken();

            // Call Render backend API instead of Gemini directly
            const response = await fetchWithTimeout(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    history
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('AI Chat API Error:', JSON.stringify(errorData, null, 2));
                throw new Error(errorData.error || 'Failed to get AI response');
            }

            const data = await response.json();

            if (!data.response) {
                throw new Error('Empty response from AI');
            }

            return data.response;
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    }
};

export { auth, db, functions };
