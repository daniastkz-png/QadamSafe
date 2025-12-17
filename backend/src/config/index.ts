import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Firebase Admin SDK Configuration (optional)
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
    },
};
