
export interface AIAnalysisResult {
    isSafe: boolean;
    riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    summary: string;
    advice: string;
}

const SCAM_KEYWORDS = [
    'взнос', 'предоплата', 'карта', 'cvv', 'код', 'пароль', 'срок действия',
    'блокировка', 'выигрыш', 'наследство', 'wildberries', 'amazon', 'ozon',
    'работа', 'инвестиции', 'гарантия', 'срочно', 'немедленно'
];



export const aiService = {
    /**
     * Analyzes text for potential scams using a simulated AI model.
     * In a real app, this would call GPT-4 or Gemini API via Cloud Functions.
     */
    analyzeText: async (text: string): Promise<AIAnalysisResult> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerText = text.toLowerCase();
        let riskScore = 0;

        // Simple heuristic analysis
        SCAM_KEYWORDS.forEach(keyword => {
            if (lowerText.includes(keyword)) riskScore += 25;
        });

        // Specific Wildberries job scam detection (as requested)
        if (lowerText.includes('wildberries') && (lowerText.includes('работа') || lowerText.includes('менеджер'))) {
            if (lowerText.includes('взнос') || lowerText.includes('платить') || lowerText.includes('выкуп')) {
                return {
                    isSafe: false,
                    riskLevel: 'CRITICAL',
                    summary: 'Обнаружена популярная схема "Работа на маркетплейсах".',
                    advice: 'Мошенники предлагают работу (например, лайкать товары или выкупать их), но требуют "вступительный взнос" или оплату товаров. Вы потеряете деньги. Настоящие работодатели никогда не просят денег за трудоустройство.'
                };
            }
        }

        // General classification
        if (riskScore >= 75) {
            return {
                isSafe: false,
                riskLevel: 'CRITICAL',
                summary: 'Текст содержит множественные признаки мошенничества.',
                advice: 'Не отвечайте, не переходите по ссылкам и заблокируйте отправителя. Никому не сообщайте свои данные.'
            };
        } else if (riskScore >= 50) {
            return {
                isSafe: false,
                riskLevel: 'HIGH',
                summary: 'Высокая вероятность попытки обмана.',
                advice: 'Будьте очень осторожны. Проверьте информацию из официальных источников. Не торопитесь принимать решения.'
            };
        } else if (riskScore >= 25) {
            return {
                isSafe: true, // suspicious but maybe ok
                riskLevel: 'MEDIUM',
                summary: 'Текст выглядит подозрительно.',
                advice: 'Обратите внимание на детали. Если вас просят что-то сделать срочно или оплатить — это красный флаг.'
            };
        }

        return {
            isSafe: true,
            riskLevel: 'SAFE',
            summary: 'Явных угроз не обнаружено.',
            advice: 'Текст выглядит безопасным, но всегда сохраняйте бдительность. Если появятся просьбы о деньгах — это сразу станет подозрительным.'
        };
    }
};
