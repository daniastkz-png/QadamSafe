/**
 * Text-to-Speech Service for Voice Call Simulator
 * Uses Web Speech API for realistic voice synthesis
 */

export interface TTSOptions {
    voice?: SpeechSynthesisVoice | null;
    lang?: string;
    pitch?: number;  // 0 to 2, default 1
    rate?: number;   // 0.1 to 10, default 1
    volume?: number; // 0 to 1, default 1
}

class TTSService {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voices: SpeechSynthesisVoice[] = [];
    private isInitialized = false;

    constructor() {
        this.synth = window.speechSynthesis;
        this.initVoices();
    }

    private initVoices(): void {
        // Voices load asynchronously
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
            this.isInitialized = true;
        };

        loadVoices();

        // Some browsers require this event
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    /**
     * Get available voices, optionally filtered by language
     */
    getVoices(lang?: string): SpeechSynthesisVoice[] {
        if (lang) {
            return this.voices.filter(v => v.lang.startsWith(lang));
        }
        return this.voices;
    }

    /**
     * Get Russian voices
     */
    getRussianVoices(): SpeechSynthesisVoice[] {
        return this.getVoices('ru');
    }

    /**
     * Get a suitable voice for the specifed language
     * Prioritizes specific high-quality voices to minimize accent
     */
    getBestVoice(lang: string = 'ru'): SpeechSynthesisVoice | null {
        // Normalize lang code (e.g. 'ru-RU' -> 'ru')
        const baseLang = lang.split('-')[0].toLowerCase();

        // Get all available voices
        const allVoices = this.synth.getVoices();

        // Filter for target language strictly first
        let voices = allVoices.filter(v => v.lang.toLowerCase().startsWith(baseLang));

        // Special handling for Kazakh: if no native voice, try standard Russian but warn
        if (baseLang === 'kk' && voices.length === 0) {
            // Fallback to Russian as it uses Cyrillic, but this WILL have an accent
            voices = allVoices.filter(v => v.lang.toLowerCase().startsWith('ru'));
        }

        if (voices.length === 0) return null;

        // Specific high-quality voices known to have neutral accents
        const highQualityNames = [
            // Russian
            'google русский', 'milena', 'yuri', 'katya',
            // English
            'google us english', 'samantha', 'alex', 'daniel',
            // General indicators
            'premium', 'enhanced', 'neural'
        ];

        // Sort voices by quality priority
        voices.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            const aScore = highQualityNames.findIndex(p => aName.includes(p));
            const bScore = highQualityNames.findIndex(p => bName.includes(p));

            // Found in high quality list? (Lower index = better)
            if (aScore !== -1 && bScore === -1) return -1;
            if (aScore === -1 && bScore !== -1) return 1;
            if (aScore !== -1 && bScore !== -1) return aScore - bScore;

            // Secondary sort: prefer default voices
            if (a.default && !b.default) return -1;
            if (!a.default && b.default) return 1;

            return 0;
        });

        return voices[0];
    }

    /**
     * Speak text with specified options
     * Returns a promise that resolves when speech ends
     */
    speak(text: string, options: TTSOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);

            // Apply options
            const lang = options.lang || 'ru-RU';
            utterance.lang = lang;

            // Adjust rate based on language for better clarity (accent reduction)
            let defaultRate = 1.0;
            if (lang.startsWith('ru')) defaultRate = 0.95; // Russian is often clearer slightly slower
            if (lang.startsWith('kk')) defaultRate = 0.9;  // Kazakh (if fallback) needs to be slower to be intelligible

            utterance.pitch = options.pitch ?? 1;
            utterance.rate = options.rate ?? defaultRate;
            utterance.volume = options.volume ?? 1;

            if (options.voice) {
                utterance.voice = options.voice;
            } else {
                const bestVoice = this.getBestVoice(lang);
                if (bestVoice) {
                    utterance.voice = bestVoice;
                    // Ensure the utterance language matches the voice language if we are using a specific voice
                    // This helps the engine switch modes correctly
                    if (!utterance.lang.startsWith(bestVoice.lang.split('-')[0])) {
                        // Keep requested lang if it's a fallback (e.g. reading KK with RU voice)
                    } else {
                        utterance.lang = bestVoice.lang;
                    }
                }
            }

            utterance.onend = () => {
                this.currentUtterance = null;
                resolve();
            };

            utterance.onerror = (event) => {
                this.currentUtterance = null;
                // Don't reject on interrupted - it's expected
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    reject(new Error(`Speech synthesis failed: ${event.error}`));
                } else {
                    resolve();
                }
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        });
    }

    /**
     * Speak multiple texts sequentially with pauses
     */
    async speakSequence(texts: string[], pauseMs = 800, options: TTSOptions = {}): Promise<void> {
        for (let i = 0; i < texts.length; i++) {
            await this.speak(texts[i], options);
            if (i < texts.length - 1) {
                await this.pause(pauseMs);
            }
        }
    }

    /**
     * Utility pause function
     */
    private pause(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Stop current speech
     */
    stop(): void {
        if (this.currentUtterance) this.synth.cancel();
        this.currentUtterance = null;
    }

    /**
     * Pause current speech
     */
    pause_speech(): void {
        this.synth.pause();
    }

    /**
     * Resume paused speech
     */
    resume(): void {
        this.synth.resume();
    }

    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean {
        return this.synth.speaking;
    }

    /**
     * Check if TTS is supported
     */
    isSupported(): boolean {
        return 'speechSynthesis' in window;
    }

    /**
     * Check if initialized with voices
     */
    isReady(): boolean {
        return this.isInitialized && this.voices.length > 0;
    }
}

// Singleton instance
export const ttsService = new TTSService();

export default ttsService;
