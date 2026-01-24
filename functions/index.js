const functions = require("firebase-functions/v2");
require("dotenv").config();
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// JWT Secret (set in Firebase Functions config)
const JWT_SECRET = process.env.JWT_SECRET || "qadamsafe-secret-key-2024";

// Initialize OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;
if (OPENAI_API_KEY) {
    const OpenAI = require("openai").default;
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
    console.error("❌ OPENAI_API_KEY is missing via process.env");
}
const AI_MODEL = "gpt-4o-mini";

// Retry helper
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
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

// Firebase auth middleware (for Google login and Firebase tokens)
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

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= CLASSROOM FUNCTIONS =============
app.post("/api/classroom/join", authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.userId;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        // Find classroom by code
        const classroomsQuery = await db.collection("classrooms")
            .where("code", "==", code.toUpperCase())
            .limit(1)
            .get();

        if (classroomsQuery.empty) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        const classroomDoc = classroomsQuery.docs[0];
        const classroomId = classroomDoc.id;
        const classroomData = classroomDoc.data();

        // Check if already joined
        const studentDoc = await classroomDoc.ref.collection("students").doc(userId).get();
        if (studentDoc.exists) {
            return res.status(400).json({ error: "Already joined this classroom" });
        }

        // Get user data
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User profile not found" });
        }
        const userData = userDoc.data();

        // Add to subcollection
        await classroomDoc.ref.collection("students").doc(userId).set({
            joinedAt: new Date(),
            role: "student",
            name: userData.name || "Unknown",
            email: userData.email || "",
            avatar: userData.avatar || "👤",
            securityScore: userData.securityScore || 0,
            completedScenarios: 0, // Should calculate real stats ideally
            totalScenarios: 0,
            streak: userData.streak || 0,
            status: "active"
        });

        // Update classroom count
        await classroomDoc.ref.update({
            studentCount: (classroomData.studentCount || 0) + 1,
            updatedAt: new Date()
        });

        // Update user profile
        await db.collection("users").doc(userId).update({
            classroomIds: admin.firestore.FieldValue.arrayUnion(classroomId),
            updatedAt: new Date()
        });

        res.status(200).json({ success: true, classroomName: classroomData.name });
    } catch (error) {
        console.error("Join Classroom Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============= AI SCENARIO GENERATION =============
const KZ_CONTEXT = `Контекст Казахстан: банки Kaspi (7111), Halyk, Forte; eGov (egov.kz); OLX, Kolesa.kz, Kaspi Объявления; Kazpost, Glovo; номера +7 7XX. Настоящие сервисы НЕ шлют ссылки «разблокировать карту» и НЕ просят коды по телефону.`;

const AI_SCENARIO_PROMPT = `Ты эксперт по кибербезопасности. Создаёшь интерактивный обучающий сценарий о мошенничестве для QadamSafe.
 
ГЛАВНОЕ: Ты САМ выбираешь структуру и метод обучения под каждую тему. Каждый сценарий должен быть разным — не копируй один шаблон.
 
ВЫБОР ФОРМАТА (выбери то, что лучше подходит для темы):
• «Что сделаете?» — классика: одно или несколько сообщений, варианты действий (2–4). Подходит почти везде.
• «Найди подвох» — один контент (SMS/письмо/чат), вопрос «Что здесь подозрительно?», варианты = разные элементы (один правильный = safe).
• «Верно / Неверно» — один вопрос-утверждение, 2 варианта. Быстрый квиз.
• «Цепочка каналов» — 2–4 шага: например SMS → WhatsApp → звонок. Разные visualType и phoneMessageType.
• «Сначала контекст» — шаг type: "information" (ситуация: «Ждёте посылку…», «Вам звонят…»), затем question/decision.
• «Ветвление» — у option указан nextStepId: опасный выбор ведёт на шаг «А теперь вам звонят» / «Вы перешли по ссылке…» с новым вопросом. Создаёт эффект «продолжения истории».
 
СТРУКТУРА ШАГА (step):
• type: "information" | "question" | "decision"
  — information: только context (и contextEn, contextKk). Без options. Кнопка «Далее». Для вводной, последствий, итога.
  — question / decision: question, options (2–4 штуки). У каждого option: outcomeType ТОЛЬКО "safe" | "risky" | "dangerous", explanation. Можно nextStepId — id шага, куда перейти (ветвление).
• visualType: "phone" | "text" — что показывать.
  — phone: phoneMessageType (sms|whatsapp|telegram|call), senderName, senderNumber, messageText, profileEmoji. Реалистичное сообщение/звонок.
  — text: context — описание ситуации, цитата письма, текст с сайта. Без messageText.
• Количество шагов: 1–5. Варьируй. Хотя бы один шаг с options (question/decision).
• Вариантов в options: 2 (верно/неверно), 3 или 4 — как уместно.
 
ПРАВИЛА:
1. Верни ТОЛЬКО валидный JSON. Без markdown, без \`\`\`json, без пояснений.
2. Реалистично для Казахстана: Kaspi, Halyk, eGov, OLX, Kolesa, +7 7XX, типичные формулировки мошенников.
3. Объяснения (explanation) — чёткие, с советом (💡). 2–4 предложения.
4. completionBlock обязателен: title, summary (+ En, Kk по возможности).
5. Все nextStepId должны совпадать с id существующего шага в steps.
 
ПРИМЕР ГИБКОЙ СТРУКТУРЫ (только образец, не копируй буквально):
— Один шаг-квиз: 1 step, type: question, 2–3 options.
— Цепочка: step1 (phone, sms), step2 (phone, whatsapp), step3 (phone, call) — все question.
— С контекстом: step1 type: information, context: "Вы ждёте посылку Kazpost…"; step2 type: question, visualType: phone, phoneMessageType: sms.
— Ветвление: step1 question, opt1 outcomeType: dangerous, nextStepId: "step2"; step2 question "Вам звонят…" (продолжение).
 
JSON:
{ "title", "titleEn", "titleKk", "description", "descriptionEn", "descriptionKk", "steps": [ { "id", "type", "context"?, "question"?, "visualType"?, "phoneMessageType"?, "senderName"?, "senderNumber"?, "messageText"?, "profileEmoji"?, "options"?: [ { "id", "text", "textEn"?, "textKk"?, "outcomeType", "explanation", "explanationEn"?, "explanationKk"?, "nextStepId"? } ] } ], "completionBlock": { "title", "titleEn"?, "titleKk"?, "summary", "summaryEn"?, "summaryKk"? } }
 
${KZ_CONTEXT}`;

// Детальные промпты по каждому topic ID с фронта
const TOPIC_PROMPTS = {
    kaspi_sms: `Сценарий: SMS-фишинг от имени Kaspi/kaspi.kz. Мошенник присылает SMS о «блокировке карты» или «подтверждении операции» со ссылкой (типа kaspi-secure.kz, kaspi-bank.com). Шаги: 1) приходит SMS со ссылкой, 2) возможен второй шаг — «звонок от поддержки» или повторное SMS. Варианты ответа: перейти по ссылке (dangerous), позвонить в 7111 / зайти в приложение (safe), отправить «СТОП» в ответ (risky).`,
    kaspi_call: `Сценарий: Звонок от «службы безопасности Kaspi». Звонящий говорит о подозрительной операции и просит назвать код из SMS «для отмены». Реалистичные фразы мошенника. Варианты: назвать код (dangerous), положить трубку и позвонить 7111 самому (safe), «перезвоню с официального номера» (risky).`,
    egov_scam: `Сценарий: Фейковый eGov / госвыплаты. Сообщение или сайт-подделка (egov-kz.site, egov.kz-*): «Вам одобрена выплата», «Подтвердите данные карты». Варианты: ввести данные по ссылке (dangerous), зайти на egov.kz вручную (safe), перезвонить по номеру из SMS (risky).`,
    olx_scam: `Сценарий: Мошенничество на OLX. «Продавец» пишет в чат OLX, затем просит предоплату «на Kaspi» до осмотра или переходит в Telegram/WhatsApp и даёт ссылку на «безопасную сделку». Варианты: перевести предоплату (dangerous), оплачивать только при получении / через OLX Доставку (safe), «скину половину сейчас» (risky).`,
    kolesa_scam: `Сценарий: Обман на Kolesa.kz. Объявление об авто, «продавец» просит предоплату «для доставки из другого города» или «бронь», перевод на Kaspi вне площадки. Варианты: перевести «бронь» (dangerous), встреча и осмотр без предоплаты (safe), «часть суммы как залог» (risky).`,
    telegram_scam: `Сценарий: «Взлом Telegram» / поддельное восстановление. Сообщение: «Подтвердите вход», «Ваш аккаунт под угрозой» со ссылкой на фейковую страницу входа. Или «поддержка Telegram» в другом мессенджере просит код. Варианты: ввести данные по ссылке / отправить код (dangerous), зайти в настройки Telegram самому, 2FA (safe), «уточню в официальном боте» (risky).`,
    whatsapp_relative: `Сценарий: «Родственник» (мама, сын, брат) с нового номера в WhatsApp пишет: «срочно нужны деньги», «потерял телефон», «помоги, скинь на этот Kaspi». Реалистичный текст. Варианты: перевести сразу (dangerous), перезвонить на старый сохранённый номер и уточнить (safe), «скину половину» (risky).`,
    job_enbek: `Сценарий: Фейковая вакансия. Сообщение/сайт: «Работа на Enbek / госпрограмма», «удалённо, предоплата за обучение/пакет документов» или просьба перевести «комиссию за трудоустройство». Варианты: перевести предоплату (dangerous), искать только на enbek.kz, не платить за трудоустройство (safe), «оплачу после контракта» (risky).`,
    crypto_work: `Сценарий: Крипто-/инвестиционное мошенничество. «Заработок в крипте», «гарантированный доход», «переведите на этот кошелёк для активации». Варианты: перевести «для входа в систему» (dangerous), не переводить, игнорировать (safe), «уточню в офисе компании» (risky).`,
    utility_scam: `Сценарий: Фейковые долги ЖКХ / «коммунальщики». SMS или звонок: «задолженность», «отключение», ссылка на оплату или «оператор» просит данные карты. Варианты: оплатить по ссылке из SMS (dangerous), проверить в личном кабинете / ТОО ЖКХ (safe), «перезвоню в call-центр по номеру с квитанции» (risky).`,
    delivery_kazpost: `Сценарий: Фейковый Kazpost. SMS: «Посылка на складе», «Оплатите доставку» по подозрительной ссылке. Реальные Kazpost не просят данные карты по таким ссылкам. Варианты: перейти и «оплатить» (dangerous), проверить на kazpost.kz или в приложении (safe), позвонить по номеру из SMS (risky).`,
    glovo_scam: `Сценарий: Мошенники «от Glovo». Сообщение: «заказ не доставлен», «подтвердите карту», «курьер ждёт оплату» по ссылке. Настоящий Glovo — только в приложении. Варианты: ввести данные по ссылке (dangerous), открыть приложение Glovo и проверить заказ (safe), перезвонить по номеру из сообщения (risky).`,
    investment_pyramid: `Сценарий: Финансовая пирамида. «Инвестиционный клуб», «пассивный доход», «приведи друга — бонус», просьба перевести «взнос» на Kaspi. Варианты: перевести «взнос» (dangerous), не участвовать, не переводить (safe), «сначала изучу договор» (risky).`,
    lottery: `Сценарий: Фейковый розыгрыш. «Вы выиграли!» от имени бренда/магазина, «оплатите доставку приза» или «комиссию». Варианты: перевести «доставку/комиссию» (dangerous), игнорировать, не участвовать в «розыгрышах» по непонятным ссылкам (safe), «уточню в официальном магазине» (risky).`,
    charity: `Сценарий: Фейковый благотворительный сбор. Сообщение с душераздирающей историей, просьба перевести «на лечение/помощь» на Kaspi. Поддельные документы, urgency. Варианты: перевести по реквизитам из сообщения (dangerous), жертвовать только через проверенные фонды/сайты (safe), «скину небольшую сумму» (risky).`,
    taxi_scam: `Сценарий: Обман в такси. «Водитель» пишет/звонит: «оплата не прошла», «переведите ещё раз на Kaspi» или «для отмены заказа». inDriver/Яндекс — оплата в приложении. Варианты: перевести «доплату» на Kaspi (dangerous), решать только в приложении такси (safe), «перезвоню в поддержку приложения» (risky).`,
    // старые id
    sms_phishing: `Сценарий: SMS-фишинг от банка или «лотереи». SMS о блокировке карты, выигрыше со ссылкой. Локальный контекст: Kaspi, Halyk.`,
    phone_scam: `Сценарий: Звонок «службы безопасности банка». Пугают операцией, просят код из SMS.`,
    social_engineering: `Сценарий: Сообщение от «родственника/друга» с нового номера с просьбой о деньгах.`,
    fake_government: `Сценарий: Фейковые госуслуги / выплаты. Поддельный egov, сайты-клоны.`,
    investment_scam: `Сценарий: Инвестиционное мошенничество. Обещание высокого дохода, «вложите в проект».`,
    online_shopping: `Сценарий: Мошенничество при онлайн-покупках. OLX/Kolesa: предоплата вне площадки, фейковая доставка.`,
    romance_scam: `Сценарий: Романтическое мошенничество. Знакомство в соцсетях, потом просьба о деньгах.`,
    job_scam: `Сценарий: Мошенничество с вакансиями. Предоплата «за обучение» или «оформление».`
};

app.post("/api/ai/generate-scenario", firebaseAuthMiddleware, async (req, res) => {
    if (!openai) {
        return res.status(500).json({ error: "OPENAI_API_KEY is required config." });
    }
    try {
        const { topic, language } = req.body;

        const topicText = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.sms_phishing;
        const langHint = ["ru", "en", "kk"].includes(language)
            ? `\nОсновной язык сценария: ${language === "ru" ? "русский" : language === "en" ? "английский" : "казахский"}.`
            : "";
        const fullPrompt = `Создай сценарий по теме:\n\n${topicText}\n\nКонтекст: Казахстан.${langHint}
 
Структуру, число шагов, тип шагов (information / question / decision), визуал (phone: sms/whatsapp/telegram/call или text), число вариантов (2–4) и формат обучения («что сделаете» / «найди подвох» / «верно-неверно» / цепочка каналов / ветвление) выбирай САМ — как лучше подходит и чтобы сценарий отличался. Верни ТОЛЬКО JSON. Без markdown.`;

        // Call OpenAI gpt-4o-mini
        const generateScenario = async () => {
            const completion = await openai.chat.completions.create({
                model: AI_MODEL,
                messages: [
                    { role: "system", content: AI_SCENARIO_PROMPT },
                    { role: "user", content: fullPrompt }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            });
            return completion.choices[0]?.message?.content || "{}";
        };

        let text = await retryWithBackoff(generateScenario);

        // Clean the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON response
        let scenarioData;
        try {
            scenarioData = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            return res.status(500).json({ error: "Failed to parse AI response", raw: text });
        }

        // Post-process logic from backend
        let steps = scenarioData.steps || scenarioData.content?.steps || [];
        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(500).json({ error: "AI returned invalid scenario: no steps", raw: scenarioData });
        }
        if (steps.length > 10) steps = steps.slice(0, 10);

        const VALID_OUTCOMES = ["safe", "risky", "dangerous"];
        const VALID_STEP_TYPES = ["information", "question", "decision"];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (!step.id) step.id = `step${i + 1}`;
            if (!step.type || !VALID_STEP_TYPES.includes(step.type)) {
                step.type = (step.options && step.options.length >= 2) ? "question" : "information";
            }
            if (step.type === "information" && !step.context && step.content) step.context = step.content;
            if (step.options && Array.isArray(step.options) && step.options.length > 4) {
                step.options = step.options.slice(0, 4);
            }
        }
        const stepIds = new Set(steps.map(s => s.id));

        for (const step of steps) {
            if (step.options && Array.isArray(step.options)) {
                for (const opt of step.options) {
                    if (!opt.outcomeType || !VALID_OUTCOMES.includes(opt.outcomeType)) {
                        opt.outcomeType = "dangerous";
                    }
                    if (opt.nextStepId && !stepIds.has(opt.nextStepId)) delete opt.nextStepId;
                }
            }
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
            order: 100,
            isLegitimate: false,
            isAIGenerated: true,
            generatedAt: now,
            content: { steps },
            completionBlock: scenarioData.completionBlock || {
                title: "🎉 Сценарий пройден!",
                titleEn: "🎉 Scenario Complete!",
                titleKk: "🎉 Сценарий аяқталды!",
                summary: "Вы прошли обучающий сценарий. Будьте бдительны в реальной жизни.",
                summaryEn: "You completed the learning scenario. Stay vigilant in real life.",
                summaryKk: "Сценарийді толықтырдыңыз. Шынымен абай болыңыз."
            },
            createdAt: now,
            updatedAt: now
        };

        // Save to Firestore
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
    // Add new ones from prompts keys
    const promptsKeys = Object.keys(TOPIC_PROMPTS);
    // Merge logic loosely or just stick to this list. This list is okay.
    res.status(200).json(topics);
});

// ============= AI CHAT ASSISTANT =============
const assistantContext = `
Контекст QadamSafe: образовательная платформа по кибербезопасности для Казахстана.
Аудитория: школьники, студенты, семьи. Отвечай понятно, по делу, без лишнего.
 
Казахстан — банки и сервисы:
- Kaspi: 7111, kaspi.kz. Настоящий Kaspi не просит коды по телефону и не шлёт ссылки «разблокировать карту».
- Halyk, Forte: только официальные приложения и сайты. Звонки «от банка» с просьбой назвать код — мошенники.
- eGov: egov.kz, gov.kz. Подделки: egov-kz.site, egov-kz.com, egov.kz-*.
- OLX, Kolesa, Kaspi Объявления: мошенники часто просят предоплату вне площадки или «для доставки»; OLX Доставка так не работает.
- Kazpost, Glovo: не просят «подтвердить заказ» по ссылке с данными карты. Курьер не просит скрин с картой.
- inDriver, Яндекс Такси: оплата через приложение; просьба перевести «напрямую на Kaspi» — подозрительно.
 
Красные флаги: срочность («сейчас», «в течение часа»), просьбы о коде/SMS, переходах по ссылке, переводе денег «прямо на Kaspi», домены с опечатками (kaspl-bank, egov-kz.site).
`.trim();

const AI_ASSISTANT_SYSTEM_PROMPT = `You are QadamSafe AI, an advanced cybersecurity assistant.
Your goal is to educate users about digital safety, analyze potential threats, and provide actionable advice.
 
Tone: Professional, vigilant, encouraging, yet serious about threats.
Style: Concise, clear, easy to understand. Avoid jargon where possible, or explain it.
 
Capabilities:
1. Threat Analysis: If a user pastes a message/email, analyze it for phishing indicators.
2. Password Advice: Explain how to create strong passwords.
3. Education: Explain terms like 2FA, VPN, Phishing, Malware.
4. Roleplay: If requested, act as a scammer to train the user (but make it clear it's a simulation).
 
Safety Rules:
- NEVER ask for real passwords, credit card numbers, or personal info.
- If a user shares real sensitive data, tell them to delete it immediately.
- Do not provide instructions on how to hack or exploit systems.
- If asked about non-cybersecurity topics, politely redirect.
 
Format: Keep answers relatively short (under 200 words) unless asked for details. Use formatting for readability.
 
${assistantContext}`;

app.post("/api/ai/chat", firebaseAuthMiddleware, async (req, res) => {
    if (!openai) {
        return res.status(500).json({ error: "OPENAI_API_KEY is required config." });
    }
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Build messages for OpenAI
        const messages = [
            { role: "system", content: AI_ASSISTANT_SYSTEM_PROMPT }
        ];

        // Add history if provided
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                const role = (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user';
                let content = "";
                if (typeof msg.parts === 'string') {
                    content = msg.parts;
                } else if (Array.isArray(msg.parts)) {
                    content = msg.parts.map(p => p.text).join(" ");
                } else if (msg.message) {
                    content = msg.message;
                }
                if (content) messages.push({ role, content });
            });
        }
        messages.push({ role: "user", content: message });

        // Call OpenAI gpt-4o-mini
        const generateResponse = async () => {
            const completion = await openai.chat.completions.create({
                model: AI_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 1024
            });
            return completion.choices[0]?.message?.content || "";
        };

        const responseText = await retryWithBackoff(generateResponse);

        res.status(200).json({ response: responseText });
    } catch (error) {
        console.error("AI Chat error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
