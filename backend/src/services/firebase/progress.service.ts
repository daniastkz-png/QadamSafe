import { getFirestore } from '../../config/firebase.config';

/**
 * Firebase Progress Service
 * Handles user progress tracking in Firestore
 * 
 * NOTE: This is a placeholder service for future Firebase integration.
 * 
 * Firestore Collection: 'progress'
 * Document structure:
 * {
 *   userId: string,
 *   scenarioId: string,
 *   completed: boolean,
 *   score: number,
 *   mistakes: number,
 *   decisions: object,
 *   completedAt: timestamp,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */
export class FirebaseProgressService {
    private readonly COLLECTION = 'progress';

    /**
     * Save user progress for a scenario
     */
    async saveProgress(userId: string, scenarioId: string, progressData: any): Promise<void> {
        const firestore = getFirestore();
        if (!firestore) {
            throw new Error('Firebase not initialized - cannot save progress');
        }

        try {
            const docId = `${userId}_${scenarioId}`;
            await firestore.collection(this.COLLECTION).doc(docId).set({
                userId,
                scenarioId,
                ...progressData,
                updatedAt: new Date(),
            }, { merge: true });
        } catch (error) {
            console.error('Failed to save progress to Firestore:', error);
            throw error;
        }
    }

    /**
     * Get user progress for a specific scenario
     */
    async getProgress(userId: string, scenarioId: string): Promise<any> {
        const firestore = getFirestore();
        if (!firestore) {
            throw new Error('Firebase not initialized - cannot get progress');
        }

        try {
            const docId = `${userId}_${scenarioId}`;
            const doc = await firestore.collection(this.COLLECTION).doc(docId).get();
            if (!doc.exists) {
                return null;
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Failed to get progress from Firestore:', error);
            throw error;
        }
    }

    /**
     * Get all progress for a user
     */
    async getAllUserProgress(userId: string): Promise<any[]> {
        const firestore = getFirestore();
        if (!firestore) {
            throw new Error('Firebase not initialized - cannot get user progress');
        }

        try {
            const snapshot = await firestore
                .collection(this.COLLECTION)
                .where('userId', '==', userId)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Failed to get user progress from Firestore:', error);
            throw error;
        }
    }
}

export const firebaseProgressService = new FirebaseProgressService();
