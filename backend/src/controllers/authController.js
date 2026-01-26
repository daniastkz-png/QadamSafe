const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "qadamsafe-secret-key-2024";

const register = async (req, res) => {
    try {
        const { email, password, name, language } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if user exists
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).limit(1).get();

        if (!snapshot.empty) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = db.collection("users").doc().id;

        const user = {
            id: userId,
            email,
            password: hashedPassword,
            name: name || "",
            role: "USER",
            language: language || "ru",
            subscriptionTier: "FREE",
            securityScore: 0,
            rank: 1,
            hasSeenWelcome: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await usersRef.doc(userId).set(user);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user
        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = snapshot.docs[0].data();

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const doc = await db.collection("users").doc(req.user.userId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = doc.data();
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLanguage = async (req, res) => {
    try {
        const { language } = req.body;
        await db.collection("users").doc(req.user.userId).update({
            language,
            updatedAt: new Date(),
        });
        const doc = await db.collection("users").doc(req.user.userId).get();
        const user = doc.data();
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const markWelcomeSeen = async (req, res) => {
    try {
        await db.collection("users").doc(req.user.userId).update({
            hasSeenWelcome: true,
            updatedAt: new Date(),
        });
        const doc = await db.collection("users").doc(req.user.userId).get();
        const user = doc.data();
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateLanguage,
    markWelcomeSeen
};
