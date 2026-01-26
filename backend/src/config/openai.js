const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;

if (OPENAI_API_KEY) {
    const OpenAI = require("openai").default;
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
    console.error("❌ OPENAI_API_KEY is missing. AI features (generate-scenario, chat) will return 500.");
}

const AI_MODEL = "gpt-4o-mini";

module.exports = { openai, AI_MODEL };
