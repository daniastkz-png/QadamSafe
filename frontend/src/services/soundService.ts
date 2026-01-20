/**
 * Sound Service for Scenario Audio Effects
 * Provides notification sounds for different message types
 */

// Sound URLs - using Web Audio API synthetic sounds as fallback
// You can replace these with actual audio file URLs
const SOUND_URLS = {
    sms: null, // Will use synthetic sound
    whatsapp: null,
    telegram: null,
    call: null,
    notification: null,
    success: null,
    error: null,
};

// Audio context for generating synthetic sounds
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Synthetic sound generators
const playSyntheticSound = (type: 'sms' | 'whatsapp' | 'telegram' | 'call' | 'notification' | 'success' | 'error') => {
    try {
        const ctx = getAudioContext();

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch (type) {
            case 'sms':
                // Classic SMS beep-beep
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.15);

                // Second beep
                setTimeout(() => {
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(880, ctx.currentTime);
                    gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    osc2.start(ctx.currentTime);
                    osc2.stop(ctx.currentTime + 0.15);
                }, 200);
                break;

            case 'whatsapp':
                // WhatsApp-like two-tone notification
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
                gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.25);
                break;

            case 'telegram':
                // Telegram-like ding
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
                oscillator.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.05); // E6
                gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;

            case 'call':
                // Classic phone ringtone
                const playRing = (startTime: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.type = 'sine';
                    // Classic phone ring frequencies (440Hz + 480Hz mixed, but we'll alternate)
                    osc.frequency.setValueAtTime(440, startTime);
                    osc.frequency.setValueAtTime(480, startTime + 0.05);
                    osc.frequency.setValueAtTime(440, startTime + 0.1);
                    osc.frequency.setValueAtTime(480, startTime + 0.15);

                    gain.gain.setValueAtTime(0.2, startTime);
                    gain.gain.setValueAtTime(0.2, startTime + 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

                    osc.start(startTime);
                    osc.stop(startTime + 0.25);
                };

                // Play ring pattern: ring-ring, pause, ring-ring
                playRing(ctx.currentTime);
                playRing(ctx.currentTime + 0.3);
                setTimeout(() => {
                    playRing(ctx.currentTime);
                    playRing(ctx.currentTime + 0.3);
                }, 800);
                return; // Early return as we handle our own oscillators

            case 'notification':
                // Generic notification sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;

            case 'success':
                // Success/correct answer chime
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.25);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;

            case 'error':
                // Error/wrong answer buzz
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.25);
                break;
        }
    } catch (e) {
        console.warn('Could not play sound:', e);
    }
};

// Main sound playing function
export const playSound = (type: 'sms' | 'whatsapp' | 'telegram' | 'call' | 'notification' | 'success' | 'error') => {
    const url = SOUND_URLS[type];

    if (url) {
        // If we have an actual audio file URL, use it
        const audio = new Audio(url);
        audio.volume = 0.3;
        audio.play().catch(e => {
            console.warn('Could not play audio file, falling back to synthetic:', e);
            playSyntheticSound(type);
        });
    } else {
        // Use synthetic sound
        playSyntheticSound(type);
    }
};

// Map scenario types to sounds
export const getScenarioSound = (type: string): 'sms' | 'whatsapp' | 'telegram' | 'call' | 'notification' => {
    switch (type) {
        case 'sms':
            return 'sms';
        case 'whatsapp':
            return 'whatsapp';
        case 'telegram':
            return 'telegram';
        case 'call':
            return 'call';
        default:
            return 'notification';
    }
};

// Feedback sounds
export const playFeedbackSound = (outcomeType: 'safe' | 'risky' | 'dangerous') => {
    if (outcomeType === 'safe') {
        playSound('success');
    } else {
        playSound('error');
    }
};

// Hook for using sounds in React components
import { useCallback, useRef } from 'react';

export const useScenarioSounds = () => {
    const hasPlayedRef = useRef<Set<string>>(new Set());

    const playScenarioSound = useCallback((stepId: string, messageType?: string) => {
        // Prevent playing the same step sound multiple times
        if (hasPlayedRef.current.has(stepId)) return;
        hasPlayedRef.current.add(stepId);

        const soundType = getScenarioSound(messageType || 'notification');
        playSound(soundType);
    }, []);

    const playOptionFeedback = useCallback((outcomeType: 'safe' | 'risky' | 'dangerous') => {
        playFeedbackSound(outcomeType);
    }, []);

    const resetSounds = useCallback(() => {
        hasPlayedRef.current.clear();
    }, []);

    return {
        playScenarioSound,
        playOptionFeedback,
        resetSounds,
    };
};

export default {
    playSound,
    getScenarioSound,
    playFeedbackSound,
};
