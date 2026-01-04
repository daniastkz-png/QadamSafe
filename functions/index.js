const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini AI with stable model
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA6g6kFF-8-7fdlyKOAYfrxIb7kGDt65jI";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.0-flash"; // Stable model for reliability
const db = admin.firestore();

// Retry helper with exponential backoff
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            // Check if error is retryable (rate limit, server error, etc.)
            const isRetryable =
                error.message?.includes('429') ||
                error.message?.includes('500') ||
                error.message?.includes('503') ||
                error.message?.includes('timeout') ||
                error.message?.includes('ECONNRESET');

            if (isRetryable) {
                console.warn(`Retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return retryWithBackoff(fn, retries - 1, delay * 2);
            }
        }
        throw error;
    }
}

// JWT Secret (set in Firebase Functions config)
const JWT_SECRET = process.env.JWT_SECRET || "qadamsafe-secret-key-2024";

// Initialize Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============= MIDDLEWARE =============
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

// ============= AUTH ROUTES =============
// Register
app.post("/api/auth/register", async (req, res) => {
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
});

// Login
app.post("/api/auth/login", async (req, res) => {
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
});

// Get current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
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
});

// Update language
app.patch("/api/auth/language", authMiddleware, async (req, res) => {
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
});

// Welcome seen
app.post("/api/auth/welcome-seen", authMiddleware, async (req, res) => {
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
});

// ============= SCENARIO ROUTES =============
app.get("/api/scenarios", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("scenarios").orderBy("order").get();
        const scenarios = snapshot.docs.map((doc) => doc.data());

        // Get user progress
        const progressSnap = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .get();
        const progress = progressSnap.docs.map((doc) => doc.data());

        const scenariosWithProgress = scenarios.map((scenario) => {
            const userProgress = progress.find((p) => p.scenarioId === scenario.id);
            return { ...scenario, userProgress: userProgress || null };
        });

        res.status(200).json(scenariosWithProgress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/scenarios/:id", authMiddleware, async (req, res) => {
    try {
        const doc = await db.collection("scenarios").doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Scenario not found" });
        }
        res.status(200).json(doc.data());
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.post("/api/scenarios/:id/complete", authMiddleware, async (req, res) => {
    try {
        const { score, mistakes, decisions } = req.body;
        const scenarioId = req.params.id;
        const userId = req.user.userId;

        // Check if progress exists
        const progressSnap = await db.collection("progress")
            .where("userId", "==", userId)
            .where("scenarioId", "==", scenarioId)
            .limit(1)
            .get();

        const now = new Date();

        if (!progressSnap.empty) {
            // Update existing
            const docId = progressSnap.docs[0].id;
            await db.collection("progress").doc(docId).update({
                score,
                mistakes,
                decisions,
                completed: true,
                completedAt: now,
                updatedAt: now,
            });
        } else {
            // Create new
            const progressId = db.collection("progress").doc().id;
            await db.collection("progress").doc(progressId).set({
                id: progressId,
                userId,
                scenarioId,
                score,
                mistakes,
                decisions,
                completed: true,
                completedAt: now,
                createdAt: now,
                updatedAt: now,
            });
        }

        // Update user security score
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        await db.collection("users").doc(userId).update({
            securityScore: (userData.securityScore || 0) + score,
            updatedAt: now,
        });

        res.status(200).json({ success: true, score, mistakes });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============= PROGRESS ROUTES =============
app.get("/api/progress", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .get();
        const progress = snapshot.docs.map((doc) => doc.data());
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/progress/stats", authMiddleware, async (req, res) => {
    try {
        const progressSnap = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .where("completed", "==", true)
            .get();

        const scenariosSnap = await db.collection("scenarios").get();
        const total = scenariosSnap.size;

        const progress = progressSnap.docs.map((doc) => doc.data());
        const completed = progress.length;
        const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
        const totalMistakes = progress.reduce((sum, p) => sum + (p.mistakes || 0), 0);
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.status(200).json({ completed, total, totalScore, totalMistakes, completionRate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= ACHIEVEMENTS ROUTES =============
app.get("/api/achievements", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("achievements").get();
        const achievements = snapshot.docs.map((doc) => doc.data());
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/achievements/user", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("userAchievements")
            .where("userId", "==", req.user.userId)
            .get();
        const userAchievements = snapshot.docs.map((doc) => doc.data());
        res.status(200).json(userAchievements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= AI SCENARIO GENERATION =============
const AI_SCENARIO_PROMPT = `Ты эксперт по кибербезопасности. Создай интерактивный обучающий сценарий о мошенничестве.

ВАЖНО: Верни ТОЛЬКО валидный JSON без markdown, без \`\`\`json, просто чистый JSON объект.

Формат ответа (строго следуй этой структуре):
{
  "title": "Название сценария на русском",
  "titleEn": "Title in English",
  "titleKk": "Қазақша атауы",
  "description": "Краткое описание на русском",
  "descriptionEn": "Brief description in English",
  "descriptionKk": "Қысқаша сипаттама қазақша",
  "steps": [
    {
      "id": "step1",
      "type": "question",
      "visualType": "phone",
      "phoneMessageType": "sms или whatsapp или telegram или call",
      "senderName": "Имя отправителя",
      "senderNameEn": "Sender name",
      "senderNameKk": "Жіберуші аты",
      "senderNumber": "+7 7XX XXX XX XX",
      "profileEmoji": "подходящий emoji",
      "messageText": "Текст сообщения мошенника на русском с emoji",
      "messageTextEn": "Message text in English",
      "messageTextKk": "Хабарлама мәтіні қазақша",
      "question": "Вопрос для пользователя",
      "questionEn": "Question in English",
      "questionKk": "Сұрақ қазақша",
      "options": [
        {
          "id": "opt1",
          "text": "Опасный выбор (попасться на уловку)",
          "textEn": "Dangerous choice",
          "textKk": "Қауіпті таңдау",
          "outcomeType": "dangerous",
          "explanation": "Подробное объяснение почему это опасно, с советом 💡",
          "explanationEn": "Detailed explanation in English",
          "explanationKk": "Толық түсіндірме қазақша"
        },
        {
          "id": "opt2", 
          "text": "Безопасный выбор",
          "textEn": "Safe choice",
          "textKk": "Қауіпсіз таңдау",
          "outcomeType": "safe",
          "explanation": "Объяснение почему это правильно 💡",
          "explanationEn": "Explanation in English",
          "explanationKk": "Түсіндірме қазақша"
        },
        {
          "id": "opt3",
          "text": "Рискованный выбор",
          "textEn": "Risky choice", 
          "textKk": "Тәуекелді таңдау",
          "outcomeType": "risky",
          "explanation": "Объяснение почему это рискованно 💡",
          "explanationEn": "Explanation in English",
          "explanationKk": "Түсіндірме қазақша"
        }
      ]
    }
  ],
  "completionBlock": {
    "title": "🎉 Сценарий пройден!",
    "titleEn": "🎉 Scenario Complete!",
    "titleKk": "🎉 Сценарий аяқталды!",
    "summary": "📌 Итоги и советы по защите",
    "summaryEn": "📌 Summary and protection tips",
    "summaryKk": "📌 Қорытындылар мен қорғау кеңестері"
  }
}

Создай сценарий с 2-3 шагами (steps). Каждый шаг должен быть реалистичной ситуацией мошенничества в Казахстане.
Используй местные банки (Kaspi, Halyk, Forte), госуслуги (eGov), местные номера телефонов.
Объяснения должны быть подробными и образовательными.`;

app.post("/api/ai/generate-scenario", authMiddleware, async (req, res) => {
    try {
        const { topic, language } = req.body;

        // Define topic prompts
        const topicPrompts = {
            sms_phishing: "Тема: SMS-фишинг от банка или лотереи. Мошенник присылает SMS о блокировке карты или выигрыше.",
            phone_scam: "Тема: Телефонный звонок от 'службы безопасности банка'. Мошенник звонит и пугает подозрительной операцией.",
            social_engineering: "Тема: Сообщение от 'родственника' или 'друга' с просьбой о деньгах с нового номера.",
            fake_government: "Тема: Фейковые госуслуги. Мошенник обещает выплату от государства через поддельный сайт.",
            investment_scam: "Тема: Инвестиционное мошенничество. Обещание гарантированного высокого дохода.",
            online_shopping: "Тема: Мошенничество при онлайн-покупках. Фейковый продавец на OLX или Kaspi Объявлениях.",
            romance_scam: "Тема: Романтическое мошенничество в соцсетях. Знакомство онлайн с последующей просьбой о деньгах.",
            job_scam: "Тема: Мошенничество с вакансиями. Предложение работы с предоплатой или сбором данных."
        };

        const selectedTopic = topicPrompts[topic] || topicPrompts.sms_phishing;
        const fullPrompt = AI_SCENARIO_PROMPT + "\n\n" + selectedTopic;

        // Call Gemini AI with retry logic and stable model
        const generateScenario = async () => {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        };

        let text = await retryWithBackoff(generateScenario);

        // Clean the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON response
        let scenarioData;
        try {
            scenarioData = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            return res.status(500).json({ error: "Failed to parse AI response", raw: text });
        }

        // Create a complete scenario object
        const now = new Date().toISOString();
        const scenarioId = `ai_scenario_${Date.now()}`;

        const scenario = {
            id: scenarioId,
            title: scenarioData.title,
            titleEn: scenarioData.titleEn,
            titleKk: scenarioData.titleKk,
            description: scenarioData.description,
            descriptionEn: scenarioData.descriptionEn,
            descriptionKk: scenarioData.descriptionKk,
            type: topic?.toUpperCase() || "AI_GENERATED",
            difficulty: "INTERMEDIATE",
            requiredTier: "FREE",
            pointsReward: 15,
            order: 100, // AI scenarios come after manual ones
            isLegitimate: false,
            isAIGenerated: true,
            generatedAt: now,
            content: {
                steps: scenarioData.steps
            },
            completionBlock: scenarioData.completionBlock,
            createdAt: now,
            updatedAt: now
        };

        // Optionally save to Firestore for the user
        const userId = req.user.userId;
        await db.collection("users").doc(userId).collection("aiScenarios").doc(scenarioId).set(scenario);

        res.status(200).json({ scenario });
    } catch (error) {
        console.error("AI Scenario generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's AI-generated scenarios
app.get("/api/ai/scenarios", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const snapshot = await db.collection("users").doc(userId).collection("aiScenarios")
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();

        const scenarios = snapshot.docs.map(doc => doc.data());
        res.status(200).json(scenarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available AI topics
app.get("/api/ai/topics", authMiddleware, async (req, res) => {
    const topics = [
        { id: "sms_phishing", name: "SMS-фишинг", nameEn: "SMS Phishing", nameKk: "SMS-фишинг", icon: "📱", color: "cyber-green" },
        { id: "phone_scam", name: "Телефонные мошенники", nameEn: "Phone Scams", nameKk: "Телефон алаяқтары", icon: "📞", color: "cyber-yellow" },
        { id: "social_engineering", name: "Социальная инженерия", nameEn: "Social Engineering", nameKk: "Әлеуметтік инженерия", icon: "👤", color: "cyber-blue" },
        { id: "fake_government", name: "Фейковые госуслуги", nameEn: "Fake Government", nameKk: "Жалған мемлекеттік қызметтер", icon: "🏛️", color: "cyber-red" },
        { id: "investment_scam", name: "Инвестиционное мошенничество", nameEn: "Investment Scams", nameKk: "Инвестициялық алаяқтық", icon: "💰", color: "cyber-yellow" },
        { id: "online_shopping", name: "Онлайн-покупки", nameEn: "Online Shopping", nameKk: "Онлайн-сатып алу", icon: "🛒", color: "cyber-green" },
        { id: "romance_scam", name: "Романтические мошенники", nameEn: "Romance Scams", nameKk: "Романтикалық алаяқтық", icon: "💕", color: "cyber-red" },
        { id: "job_scam", name: "Мошенничество с работой", nameEn: "Job Scams", nameKk: "Жұмыс алаяқтығы", icon: "💼", color: "cyber-blue" }
    ];
    res.status(200).json(topics);
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
