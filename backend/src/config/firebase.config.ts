import admin from 'firebase-admin';
import { config } from './index';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Only initializes if Firebase credentials are provided in environment variables
 * Gracefully skips initialization if credentials are not configured
 */
export const initializeFirebase = (): admin.app.App | null => {
    // Skip initialization if already initialized
    if (firebaseApp) {
        console.log('ℹ️  Firebase already initialized');
        return firebaseApp;
    }

    // Check if Firebase credentials are configured
    const hasIndividualCredentials =
        config.firebase.projectId &&
        config.firebase.privateKey &&
        config.firebase.clientEmail;

    const hasServiceAccountPath = config.firebase.serviceAccountPath;

    if (!hasIndividualCredentials && !hasServiceAccountPath) {
        console.log('⚠️  Firebase credentials not configured - skipping Firebase initialization');
        console.log('   To use Firebase, configure FIREBASE_* environment variables in .env');
        return null;
    }

    try {
        // Initialize with individual credentials
        if (hasIndividualCredentials) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: config.firebase.projectId,
                    privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
                    clientEmail: config.firebase.clientEmail,
                }),
            });
            console.log('✅ Firebase Admin SDK initialized with individual credentials');
        }
        // Initialize with service account file
        else if (hasServiceAccountPath) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(config.firebase.serviceAccountPath),
            });
            console.log('✅ Firebase Admin SDK initialized with service account file');
        }

        return firebaseApp;
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error);
        console.error('   Check your Firebase credentials in .env file');
        return null;
    }
};

/**
 * Get Firebase Admin app instance
 * Returns null if Firebase is not initialized
 */
export const getFirebaseAdmin = (): admin.app.App | null => {
    return firebaseApp;
};

/**
 * Get Firestore instance
 * Returns null if Firebase is not initialized
 */
export const getFirestore = (): admin.firestore.Firestore | null => {
    if (!firebaseApp) {
        console.warn('⚠️  Firebase not initialized - cannot get Firestore instance');
        return null;
    }
    return admin.firestore(firebaseApp);
};

/**
 * Get Firebase Auth instance
 * Returns null if Firebase is not initialized
 */
export const getAuth = (): admin.auth.Auth | null => {
    if (!firebaseApp) {
        console.warn('⚠️  Firebase not initialized - cannot get Auth instance');
        return null;
    }
    return admin.auth(firebaseApp);
};

/**
 * Check if Firebase is initialized and ready to use
 */
export const isFirebaseReady = (): boolean => {
    return firebaseApp !== null;
};
