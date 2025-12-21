import { getFirestore } from '../../config/firebase.config';

// Scenario interfaces for Firestore
export interface ScenarioStep {
    id: string;
    type: 'question' | 'information' | 'decision';
    content: string;
    contentEn?: string;
    contentKk?: string;
    options?: ScenarioOption[];
    explanation?: string;
    explanationEn?: string;
    explanationKk?: string;
}

export interface ScenarioOption {
    id: string;
    text: string;
    textEn?: string;
    textKk?: string;
    outcomeType: 'safe' | 'risky' | 'dangerous';
    explanation?: string;
    explanationEn?: string;
    explanationKk?: string;
}

export interface FirestoreScenario {
    id: string;
    title: string;
    titleEn?: string;
    titleKk?: string;
    description: string;
    descriptionEn?: string;
    descriptionKk?: string;
    type: 'EMAIL_PHISHING' | 'SMS_PHISHING' | 'FAKE_WEBSITE' | 'SOCIAL_ENGINEERING' | 'MALWARE_DETECTION';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    requiredTier: 'FREE' | 'PRO' | 'BUSINESS';
    pointsReward: number;
    order: number;
    prerequisiteScenarioId?: string;
    isLegitimate: boolean;
    content: { steps: ScenarioStep[] };
    createdAt: Date;
    updatedAt: Date;
}

class FirestoreScenarioRepository {
    private collection = 'scenarios';

    async findAll(): Promise<FirestoreScenario[]> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection)
            .orderBy('order')
            .get();

        return snapshot.docs.map(doc => doc.data() as FirestoreScenario);
    }

    async findById(id: string): Promise<FirestoreScenario | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const doc = await db.collection(this.collection).doc(id).get();
        if (!doc.exists) return null;
        return doc.data() as FirestoreScenario;
    }

    async findByOrder(order: number): Promise<FirestoreScenario | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection)
            .where('order', '==', order)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return snapshot.docs[0].data() as FirestoreScenario;
    }

    async create(data: Omit<FirestoreScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreScenario> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const now = new Date();
        const id = crypto.randomUUID();

        const scenario: FirestoreScenario = {
            id,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        await db.collection(this.collection).doc(id).set(scenario);
        return scenario;
    }

    async deleteAll(): Promise<void> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
}

export const firestoreScenarioRepository = new FirestoreScenarioRepository();
