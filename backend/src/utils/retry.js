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

module.exports = { retryWithBackoff };
