import { getFirestore } from '../../config/firebase.config';
import { FirestoreScenario } from './scenario.repository';

export interface FirestoreProgress {
    id: string;
    userId: string;
    scenarioId: string;
    completed: boolean;
    score: number;
    mistakes: number;
    decisions?: any;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface FirestoreProgressWithScenario extends FirestoreProgress {
    scenario?: FirestoreScenario;
}

class FirestoreProgressRepository {
    private collection = 'progress';

    async findByUserId(userId: string): Promise<FirestoreProgress[]> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection)
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => doc.data() as FirestoreProgress);
    }

    async findByUserAndScenario(userId: string, scenarioId: string): Promise<FirestoreProgress | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection)
            .where('userId', '==', userId)
            .where('scenarioId', '==', scenarioId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return snapshot.docs[0].data() as FirestoreProgress;
    }

    async upsert(userId: string, scenarioId: string, data: {
        score: number;
        mistakes: number;
        decisions?: any;
    }): Promise<FirestoreProgress> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const existing = await this.findByUserAndScenario(userId, scenarioId);
        const now = new Date();

        if (existing) {
            // Update existing
            const updateData = {
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
                completed: true,
                completedAt: now,
                updatedAt: now,
            };
            await db.collection(this.collection).doc(existing.id).update(updateData);
            return { ...existing, ...updateData };
        } else {
            // Create new
            const id = crypto.randomUUID();
            const progress: FirestoreProgress = {
                id,
                userId,
                scenarioId,
                completed: true,
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
                completedAt: now,
                createdAt: now,
                updatedAt: now,
            };
            await db.collection(this.collection).doc(id).set(progress);
            return progress;
        }
    }

    async getStats(userId: string): Promise<{
        completed: number;
        total: number;
        totalScore: number;
        totalMistakes: number;
        completionRate: number;
    }> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        // Get user progress
        const progressSnapshot = await db.collection(this.collection)
            .where('userId', '==', userId)
            .where('completed', '==', true)
            .get();

        // Get total scenarios count
        const scenariosSnapshot = await db.collection('scenarios').get();
        const total = scenariosSnapshot.size;

        const progress = progressSnapshot.docs.map(doc => doc.data() as FirestoreProgress);
        const completed = progress.length;
        const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
        const totalMistakes = progress.reduce((sum, p) => sum + p.mistakes, 0);
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, totalScore, totalMistakes, completionRate };
    }
}

export const firestoreProgressRepository = new FirestoreProgressRepository();
