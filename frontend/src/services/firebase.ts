import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, limit } from 'firebase/firestore';
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

        // Get all scenarios
        const scenariosQuery = query(collection(db, 'scenarios'), orderBy('order'));
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

// ============= PROGRESS API =============
export const firebaseProgressAPI = {
    getProgress: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Not authenticated');
        }

        const progressQuery = query(collection(db, 'progress'), where('userId', '==', currentUser.uid));
        const progressSnap = await getDocs(progressQuery);
        return progressSnap.docs.map(d => d.data());
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

export { auth, db };
