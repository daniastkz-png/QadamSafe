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
     * Get a suitable voice for the scenario
     * Tries to find Russian voice, falls back to any available
     */
    getBestVoice(preferMale = true): SpeechSynthesisVoice | null {
        const russianVoices = this.getRussianVoices();

        if (russianVoices.length > 0) {
            // Try to find gender-specific voice by name hints
            if (preferMale) {
                const maleVoice = russianVoices.find(v =>
                    v.name.toLowerCase().includes('male') ||
                    v.name.toLowerCase().includes('dmitri') ||
                    v.name.toLowerCase().includes('pavel') ||
                    v.name.toLowerCase().includes('maxim')
                );
                if (maleVoice) return maleVoice;
            } else {
                const femaleVoice = russianVoices.find(v =>
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('milena') ||
                    v.name.toLowerCase().includes('irina') ||
                    v.name.toLowerCase().includes('anna')
                );
                if (femaleVoice) return femaleVoice;
            }
            return russianVoices[0];
        }

        // Fallback to any voice
        return this.voices[0] || null;
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
            utterance.lang = options.lang || 'ru-RU';
            utterance.pitch = options.pitch ?? 1;
            utterance.rate = options.rate ?? 0.9; // Slightly slower for clarity
            utterance.volume = options.volume ?? 1;

            if (options.voice) {
                utterance.voice = options.voice;
            } else {
                const bestVoice = this.getBestVoice();
                if (bestVoice) {
                    utterance.voice = bestVoice;
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
