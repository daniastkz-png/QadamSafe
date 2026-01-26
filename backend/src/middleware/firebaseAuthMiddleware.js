const jwt = require("jsonwebtoken");
const { admin } = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "qadamsafe-secret-key-2024";

const firebaseAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const token = authHeader.split(" ")[1];

        // Try Firebase token verification first
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = { userId: decodedToken.uid, email: decodedToken.email };
            return next();
        } catch (firebaseError) {
            console.warn("Firebase Auth failed:", firebaseError.message);
            // If Firebase fails, try JWT
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
                return next();
            } catch (jwtError) {
                console.warn("JWT Auth failed:", jwtError.message);
                return res.status(401).json({ error: "Invalid token", details: "Both Firebase and JWT auth failed" });
            }
        }
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = firebaseAuthMiddleware;
