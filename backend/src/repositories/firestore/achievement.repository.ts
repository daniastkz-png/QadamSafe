import { getFirestore } from '../../config/firebase.config';

export interface FirestoreAchievement {
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
    createdAt: Date;
}

export interface FirestoreUserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    achievement?: FirestoreAchievement;
}

class FirestoreAchievementRepository {
    private achievementsCollection = 'achievements';
    private userAchievementsCollection = 'userAchievements';

    async findAllAchievements(): Promise<FirestoreAchievement[]> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.achievementsCollection).get();
        return snapshot.docs.map((doc: any) => doc.data() as FirestoreAchievement);
    }

    async findAchievementByKey(key: string): Promise<FirestoreAchievement | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.achievementsCollection)
            .where('key', '==', key)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return snapshot.docs[0].data() as FirestoreAchievement;
    }

    async findUserAchievements(userId: string): Promise<FirestoreUserAchievement[]> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.userAchievementsCollection)
            .where('userId', '==', userId)
            .get();

        const userAchievements = snapshot.docs.map((doc: any) => doc.data() as FirestoreUserAchievement);

        // Get all achievements to join
        const achievements = await this.findAllAchievements();
        const achievementMap = new Map(achievements.map(a => [a.id, a]));

        return userAchievements.map(ua => ({
            ...ua,
            achievement: achievementMap.get(ua.achievementId),
        }));
    }

    async upsertUserAchievement(userId: string, achievementId: string, progress: number): Promise<FirestoreUserAchievement> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.userAchievementsCollection)
            .where('userId', '==', userId)
            .where('achievementId', '==', achievementId)
            .limit(1)
            .get();

        const now = new Date();
        const achievement = await this.findAchievementById(achievementId);
        const completed = achievement ? progress >= achievement.requiredValue : false;

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const updateData = {
                progress,
                completed,
                completedAt: completed ? now : undefined,
                updatedAt: now,
            };
            await db.collection(this.userAchievementsCollection).doc(doc.id).update(updateData);
            return { ...doc.data() as FirestoreUserAchievement, ...updateData };
        } else {
            const id = crypto.randomUUID();
            const userAchievement: FirestoreUserAchievement = {
                id,
                userId,
                achievementId,
                progress,
                completed,
                completedAt: completed ? now : undefined,
                createdAt: now,
                updatedAt: now,
            };
            await db.collection(this.userAchievementsCollection).doc(id).set(userAchievement);
            return userAchievement;
        }
    }

    async findAchievementById(id: string): Promise<FirestoreAchievement | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const doc = await db.collection(this.achievementsCollection).doc(id).get();
        if (!doc.exists) return null;
        return doc.data() as FirestoreAchievement;
    }

    async createAchievement(data: Omit<FirestoreAchievement, 'id' | 'createdAt'>): Promise<FirestoreAchievement> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const id = crypto.randomUUID();
        const achievement: FirestoreAchievement = {
            id,
            ...data,
            createdAt: new Date(),
        };

        await db.collection(this.achievementsCollection).doc(id).set(achievement);
        return achievement;
    }

    async deleteAllAchievements(): Promise<void> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.achievementsCollection).get();
        const batch = db.batch();
        snapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
        await batch.commit();
    }

    async initializeUserAchievements(userId: string): Promise<void> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const achievements = await this.findAllAchievements();
        const now = new Date();

        for (const achievement of achievements) {
            const existing = await db.collection(this.userAchievementsCollection)
                .where('userId', '==', userId)
                .where('achievementId', '==', achievement.id)
                .limit(1)
                .get();

            if (existing.empty) {
                const id = crypto.randomUUID();
                await db.collection(this.userAchievementsCollection).doc(id).set({
                    id,
                    userId,
                    achievementId: achievement.id,
                    progress: 0,
                    completed: false,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }
    }
}

export const firestoreAchievementRepository = new FirestoreAchievementRepository();
