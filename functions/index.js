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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyClYvOSI5DT8vQGR9Upiq-MQ_FAhEhZ_I8";
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

// 50/50 Logic: Half scenarios are scams, half are legitimate situations
const AI_SCENARIO_PROMPT = `Ты эксперт по кибербезопасности. Создай интерактивный обучающий сценарий.

КРИТИЧЕСКИ ВАЖНО: Этот сценарий может быть либо МОШЕННИЧЕСТВОМ, либо ЛЕГИТИМНОЙ СИТУАЦИЕЙ.
Пользователь должен научиться РАЗЛИЧАТЬ настоящих людей от мошенников, а не просто всех подозревать.

Параметр isLegitimate будет передан отдельно: если true — создай сценарий с НАСТОЯЩИМ человеком (не мошенником).
Если false — создай сценарий с МОШЕННИКОМ.

ВАЖНО: Верни ТОЛЬКО валидный JSON без markdown, без \`\`\`json, просто чистый JSON объект.

Формат ответа:
{
  "title": "Название сценария на русском",
  "titleEn": "Title in English", 
  "titleKk": "Қазақша атауы",
  "description": "Краткое описание на русском",
  "descriptionEn": "Brief description in English",
  "descriptionKk": "Қысқаша сипаттама қазақша",
  "isLegitimate": true/false,
  "legitimateExplanation": "Если это легитимная ситуация — объясни почему это НЕ мошенник и какие признаки это подтверждают",
  "scamExplanation": "Если это мошенничество — объясни красные флаги и как распознать",
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
      "messageText": "Текст сообщения на русском с emoji",
      "messageTextEn": "Message text in English",
      "messageTextKk": "Хабарлама мәтіні қазақша",
      "question": "Что вы сделаете?",
      "questionEn": "What will you do?",
      "questionKk": "Не істейсіз?",
      "options": [
        {
          "id": "opt1",
          "text": "Вариант действия 1",
          "textEn": "Action option 1",
          "textKk": "Әрекет нұсқасы 1",
          "outcomeType": "dangerous/safe/risky в зависимости от isLegitimate",
          "explanation": "Объяснение почему это правильно/неправильно 💡",
          "explanationEn": "Explanation in English",
          "explanationKk": "Түсіндірме қазақша"
        },
        {
          "id": "opt2",
          "text": "Вариант действия 2",
          "textEn": "Action option 2", 
          "textKk": "Әрекет нұсқасы 2",
          "outcomeType": "dangerous/safe/risky",
          "explanation": "Объяснение 💡",
          "explanationEn": "Explanation",
          "explanationKk": "Түсіндірме"
        },
        {
          "id": "opt3",
          "text": "Вариант действия 3",
          "textEn": "Action option 3",
          "textKk": "Әрекет нұсқасы 3", 
          "outcomeType": "dangerous/safe/risky",
          "explanation": "Объяснение 💡",
          "explanationEn": "Explanation",
          "explanationKk": "Түсіндірме"
        }
      ]
    }
  ],
  "completionBlock": {
    "title": "🎉 Сценарий пройден!",
    "titleEn": "🎉 Scenario Complete!",
    "titleKk": "🎉 Сценарий аяқталды!",
    "summary": "📌 Итоги: был ли это мошенник и как это определить",
    "summaryEn": "📌 Summary: was this a scammer and how to tell",
    "summaryKk": "📌 Қорытынды: бұл алаяқ па және қалай анықтауға болады"
  }
}

Создай сценарий с 2-3 шагами. Используй местные банки Казахстана (Kaspi, Halyk, Forte), госуслуги (eGov), местные номера.

ВАЖНЕЙШЕЕ ПРАВИЛО для outcomeType:
- Если isLegitimate=true (настоящий человек): игнорировать или блокировать = dangerous, помочь/ответить = safe
- Если isLegitimate=false (мошенник): доверять/отправить данные = dangerous, проигнорировать = safe`;

app.post("/api/ai/generate-scenario", authMiddleware, async (req, res) => {
    try {
        const { topic, language } = req.body;

        // Randomly decide if this is a legitimate situation or scam (50/50)
        const isLegitimate = Math.random() < 0.5;

        // Kazakhstan-specific topic prompts with real local context
        const topicPrompts = {
            // ===== KASPI BANK (самый популярный банк КЗ) =====
            kaspi_sms: {
                scam: "Тема: Kaspi фишинг. Мошенник присылает SMS: 'Ваша карта Kaspi Gold заблокирована. Перейдите: kaspl-bank.kz для разблокировки'. Обрати внимание на подозрительный домен.",
                legit: "Тема: Настоящее Kaspi уведомление. Приходит SMS с кодом подтверждения 1234 для перевода, который вы сами инициировали в приложении Kaspi.kz."
            },
            kaspi_call: {
                scam: "Тема: Звонок 'от Kaspi'. Звонят с номера +7 727 XXX и говорят: 'Мы служба безопасности Kaspi, на вас оформляют кредит. Назовите SMS-код для отмены'. Это классический развод.",
                legit: "Тема: Реальный звонок Kaspi. Оператор звонит подтвердить крупный перевод и предлагает самому перезвонить на 7111 (официальный номер) для безопасности."
            },

            // ===== eGOV (государственные услуги) =====
            egov_scam: {
                scam: "Тема: Фейковый eGov. Сообщение: 'Вам положена выплата 42500 тенге. Оформите на egov-kz.site'. Поддельный сайт копирует дизайн настоящего egov.kz.",
                legit: "Тема: Реальное eGov. СМС: 'Ваш документ готов. Заберите в ЦОН по адресу ул. Абая 52'. Без ссылок, только информация о готовности."
            },

            // ===== OLX / KOLESA (маркетплейсы) =====
            olx_scam: {
                scam: "Тема: Мошенник на OLX. Вы продаёте телефон за 150,000₸. 'Покупатель' пишет: 'Готов сейчас! Скинь номер Kaspi, переведу с доставкой через OLX Доставку' — но OLX Доставка так не работает.",
                legit: "Тема: Настоящий покупатель OLX. Человек пишет: 'Привет, телефон ещё есть? Могу подъехать на Саина-Толе би в 18:00, оплачу наличкой при встрече'."
            },
            kolesa_scam: {
                scam: "Тема: Мошенник на Kolesa.kz. Продаёте машину, звонит 'покупатель': 'Я в другом городе, переведу предоплату 500,000₸, только скиньте данные карты для возврата, если не подойдёт'. Это развод.",
                legit: "Тема: Реальный покупатель Kolesa. Звонит человек: 'Здравствуйте, видел вашу Camry на Колёсах. Можно подъехать на осмотр в субботу? Хочу мастера привезти'."
            },

            // ===== TELEGRAM / WHATSAPP мошенничество =====
            telegram_scam: {
                scam: "Тема: Взлом через Telegram. Знакомый пишет: 'Привет! Проголосуй за мою племянницу в конкурсе: vote-kz.site'. Ссылка ведёт на фейковую авторизацию Telegram.",
                legit: "Тема: Реальная просьба в Telegram. Друг пишет: 'Привет, у дочки конкурс рисунков в школе, можешь лайкнуть пост в Instagram @school_almaty_25?'"
            },
            whatsapp_relative: {
                scam: "Тема: 'Мама' с нового номера. Сообщение: 'Сынок, это мама. Мой телефон сломался. Срочно переведи 50,000₸ на этот Kaspi: +7 707 XXX XX XX. Потом объясню'.",
                legit: "Тема: Мама реально сменила номер. Сообщение: 'Алло, это мама, новый номер. Позвони мне когда сможешь, расскажу почему сменила'. Не просит денег сразу."
            },

            // ===== РАБОТА И ВАКАНСИИ =====
            job_enbek: {
                scam: "Тема: Фейковая вакансия. На enbek.kz вакансия 'Оператор ПК, 500,000₸/мес'. При отклике пишут: 'Переведите 15,000₸ за обучающие материалы и униформу'.",
                legit: "Тема: Реальная вакансия на hh.kz. HR из Kaspi компании приглашает: 'Добрый день, мы рассмотрели ваше резюме. Можете прийти на собеседование в офис на Достык 180?'"
            },
            crypto_work: {
                scam: "Тема: Крипто-работа. В Instagram реклама: 'Заработок 1,000,000₸/месяц! Обучение бесплатно, только внеси депозит 100,000₸ для начала торговли'.",
                legit: "Тема: Реальная IT-вакансия. Компания приглашает: 'Ищем Junior Python-разработчика, зарплата 400,000₸, офис в Астане, нужно пройти техническое интервью'."
            },

            // ===== КОММУНАЛЬНЫЕ УСЛУГИ =====
            utility_scam: {
                scam: "Тема: Фейковый долг за свет. SMS: 'Задолженность за электроэнергию 45,000₸. Отключение через 24 часа. Оплатите: almatyenergo-pay.kz'. Поддельный сайт.",
                legit: "Тема: Реальное уведомление. SMS от AlmatyEnergoSbyt: 'Показания счётчика за январь: 245 кВт. Сумма к оплате: 4,560₸. Оплата в приложении или ЦОНе'."
            },

            // ===== ДОСТАВКА =====
            delivery_kazpost: {
                scam: "Тема: Фейковый Kazpost. SMS: 'Ваша посылка задержана на таможне. Оплатите пошлину 5,000₸: kazpost-delivery.site'. Казпочта так не работает.",
                legit: "Тема: Реальный Kazpost. SMS: 'Посылка прибыла в отделение 050000. Заберите по адресу Абылай хана 45 до 15.01. Трек: KZ123456789'."
            },
            glovo_scam: {
                scam: "Тема: Фейковый Glovo. Курьер звонит: 'Я доставка Glovo, не могу найти адрес. Скиньте геолокацию и скриншот заказа с данными карты для подтверждения'.",
                legit: "Тема: Настоящий курьер Glovo. Звонит: 'Здравствуйте, я курьер, привёз ваш заказ из KFC. Код домофона какой? Я у подъезда'."
            },

            // ===== ИНВЕСТИЦИИ И ФИНАНСЫ =====
            investment_pyramid: {
                scam: "Тема: Финансовая пирамида. Знакомый приглашает: 'Вложи 200,000₸ в новый проект, доход 50% в месяц! Я уже заработал. Компания зарегистрирована в Дубае'.",
                legit: "Тема: Реальное инвестирование. Брокер Freedom Finance предлагает: 'Откройте брокерский счёт, минимальный порог входа 10,000₸, доход не гарантирован, есть риски'."
            },

            // ===== РОЗЫГРЫШИ И ЛОТЕРЕИ =====
            lottery: {
                scam: "Тема: Фейковый выигрыш. SMS: 'Поздравляем! Вы выиграли iPhone 15 от Magnum! Для получения оплатите налог 25,000₸ на Kaspi +7 777 XXX XX XX'.",
                legit: "Тема: Реальный розыгрыш Magnum. SMS: 'Вы выиграли в акции Magnum! Подойдите в магазин Magnum Cash&Carry (Розыбакиева 253) с чеком и удостоверением'."
            },

            // ===== БЛАГОТВОРИТЕЛЬНОСТЬ =====
            charity: {
                scam: "Тема: Фейковая благотворительность. Репост в Instagram: 'Срочно! Малышке Айгерим нужна операция! Реквизиты: Kaspi +7 702 XXX'. Нет документов, нет фонда.",
                legit: "Тема: Официальный фонд. Сбор от Dara Foundation: 'Помощь детям с ДЦП. Полная отчётность на dara.kz, мы зарегистрированы в Минюсте РК'."
            },

            // ===== TAXI И INDRIVER =====
            taxi_scam: {
                scam: "Тема: Мошенник водитель. Заказали такси через inDriver за 1,500₸. Водитель: 'Приложение глючит, переведи мне напрямую на Kaspi, я дам чек потом'.",
                legit: "Тема: Обычная поездка Яндекс Такси. Водитель звонит: 'Алло, я подъехал, белая Hyundai Accent, номер ABC 123. Выходите, я у подъезда'."
            }
        };

        const selectedTopicData = topicPrompts[topic] || topicPrompts.kaspi_sms;
        const topicPrompt = isLegitimate ? selectedTopicData.legit : selectedTopicData.scam;
        const fullPrompt = AI_SCENARIO_PROMPT + "\n\nisLegitimate: " + isLegitimate + "\n\n" + topicPrompt;

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
            isLegitimate: scenarioData.isLegitimate ?? isLegitimate,
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

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
