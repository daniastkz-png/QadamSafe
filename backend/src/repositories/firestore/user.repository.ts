import { getFirestore } from '../../config/firebase.config';

// User interface for Firestore
export interface FirestoreUser {
    id: string;
    email: string;
    password: string;
    name?: string;
    role: 'USER' | 'ADMIN';
    language: string;
    subscriptionTier: 'FREE' | 'PRO' | 'BUSINESS';
    securityScore: number;
    rank: number;
    hasSeenWelcome: boolean;
    createdAt: Date;
    updatedAt: Date;
}

class FirestoreUserRepository {
    private collection = 'users';

    async create(data: {
        email: string;
        password: string;
        name?: string;
        language?: string;
    }): Promise<FirestoreUser> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const now = new Date();
        const id = crypto.randomUUID();

        const user: FirestoreUser = {
            id,
            email: data.email,
            password: data.password,
            name: data.name,
            role: 'USER',
            language: data.language || 'ru',
            subscriptionTier: 'FREE',
            securityScore: 0,
            rank: 1,
            hasSeenWelcome: false,
            createdAt: now,
            updatedAt: now,
        };

        await db.collection(this.collection).doc(id).set(user);
        return user;
    }

    async findByEmail(email: string): Promise<FirestoreUser | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const snapshot = await db.collection(this.collection)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return snapshot.docs[0].data() as FirestoreUser;
    }

    async findById(id: string): Promise<FirestoreUser | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const doc = await db.collection(this.collection).doc(id).get();
        if (!doc.exists) return null;
        return doc.data() as FirestoreUser;
    }

    async update(id: string, data: Partial<FirestoreUser>): Promise<FirestoreUser | null> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const updateData = { ...data, updatedAt: new Date() };
        await db.collection(this.collection).doc(id).update(updateData);
        return this.findById(id);
    }

    async updateSecurityScore(id: string, score: number): Promise<void> {
        const db = getFirestore();
        if (!db) throw new Error('Firestore not initialized');

        const user = await this.findById(id);
        if (!user) return;

        const newScore = user.securityScore + score;
        await db.collection(this.collection).doc(id).update({
            securityScore: newScore,
            updatedAt: new Date(),
        });
    }
}

export const firestoreUserRepository = new FirestoreUserRepository();
