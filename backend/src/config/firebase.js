const admin = require("firebase-admin");

let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
    serviceAccount = {};
}

if (Object.keys(serviceAccount).length > 0) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized with Service Account");
    } catch (e) {
        console.error("Error initializing Firebase Admin:", e);
    }
} else {
    console.warn("Warning: FIREBASE_SERVICE_ACCOUNT is empty or invalid. Auth will fail.");
    admin.initializeApp();
}

const db = admin.firestore();

module.exports = { admin, db };
