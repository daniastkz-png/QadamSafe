const { db } = require("../config/firebase");
const { openai, AI_MODEL } = require("../config/openai");
const { retryWithBackoff } = require("../utils/retry");
const {
    AI_SCENARIO_PROMPT,
    TOPIC_PROMPTS,
    AI_ASSISTANT_SYSTEM_PROMPT
} = require("../config/constants");

const generateScenario = async (req, res) => {
    if (!openai) {
        return res.status(500).json({ error: "OPENAI_API_KEY is required. Set it in .env or Render dashboard." });
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
        const callOpenAI = async () => {
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

        let text = await retryWithBackoff(callOpenAI);

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

        // Post-process: steps fallback, length check, outcomeType, nextStepId, type, options count
        let steps = scenarioData.steps || scenarioData.content?.steps || [];
        if (!Array.isArray(steps) || steps.length === 0) {
            console.error("AI returned no steps:", scenarioData);
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
            content: {
                steps
            },
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

        // Save to Firestore for the user
        const userId = req.user.userId;
        await db.collection("users").doc(userId).collection("aiScenarios").doc(scenarioId).set(scenario);

        res.status(200).json({ scenario });
    } catch (error) {
        console.error("AI Scenario generation error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getGeneratedScenarios = async (req, res) => {
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
};

const getTopics = async (req, res) => {
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
};

const chat = async (req, res) => {
    if (!openai) {
        return res.status(500).json({ error: "OPENAI_API_KEY is required. Set it in .env or Render dashboard." });
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
};

module.exports = {
    generateScenario,
    getGeneratedScenarios,
    getTopics,
    chat
};
