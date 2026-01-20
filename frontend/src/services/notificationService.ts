// Push Notification Service
// Handles browser notifications for QadamSafe

export interface NotificationSettings {
    enabled: boolean;
    streakReminders: boolean;
    newScenarios: boolean;
    achievements: boolean;
    dailyChallenges: boolean;
    tips: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: false,
    streakReminders: true,
    newScenarios: true,
    achievements: true,
    dailyChallenges: true,
    tips: true,
};

const STORAGE_KEY = 'qadamsafe_notification_settings';

class NotificationService {
    private settings: NotificationSettings;
    private permission: NotificationPermission = 'default';

    constructor() {
        this.settings = this.loadSettings();
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    // Load settings from localStorage
    private loadSettings(): NotificationSettings {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Error loading notification settings:', e);
        }
        return DEFAULT_SETTINGS;
    }

    // Save settings to localStorage
    private saveSettings(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving notification settings:', e);
        }
    }

    // Check if notifications are supported
    isSupported(): boolean {
        return 'Notification' in window;
    }

    // Get current permission status
    getPermission(): NotificationPermission {
        return this.permission;
    }

    // Request notification permission
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('Notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;

            if (permission === 'granted') {
                this.settings.enabled = true;
                this.saveSettings();

                // Show welcome notification
                this.showNotification(
                    '🛡️ Уведомления включены!',
                    'Теперь вы будете получать напоминания о сериях и новых сценариях.',
                    'welcome'
                );
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error requesting notification permission:', e);
            return false;
        }
    }

    // Get current settings
    getSettings(): NotificationSettings {
        return { ...this.settings };
    }

    // Update settings
    updateSettings(newSettings: Partial<NotificationSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    // Show a notification
    showNotification(
        title: string,
        body: string,
        type: 'streak' | 'scenario' | 'achievement' | 'daily' | 'tip' | 'welcome' = 'tip',
        onClick?: () => void
    ): void {
        // Check if notifications are enabled and permission granted
        if (!this.settings.enabled || this.permission !== 'granted') {
            return;
        }

        // Check type-specific settings
        if (type === 'streak' && !this.settings.streakReminders) return;
        if (type === 'scenario' && !this.settings.newScenarios) return;
        if (type === 'achievement' && !this.settings.achievements) return;
        if (type === 'daily' && !this.settings.dailyChallenges) return;
        if (type === 'tip' && !this.settings.tips) return;

        try {
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `qadamsafe-${type}-${Date.now()}`,
                requireInteraction: type === 'streak' || type === 'daily',
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
                onClick?.();
            };

            // Auto-close after 10 seconds for non-urgent notifications
            if (type !== 'streak' && type !== 'daily') {
                setTimeout(() => notification.close(), 10000);
            }
        } catch (e) {
            console.error('Error showing notification:', e);
        }
    }

    // Streak reminder notification
    showStreakReminder(currentStreak: number): void {
        if (currentStreak === 0) {
            this.showNotification(
                '🔥 Начните серию!',
                'Пройдите хотя бы один сценарий сегодня и начните серию обучения!',
                'streak'
            );
        } else {
            this.showNotification(
                `🔥 Серия ${currentStreak} дней!`,
                'Не забудьте пройти сценарий сегодня, чтобы сохранить серию!',
                'streak'
            );
        }
    }

    // New scenario notification
    showNewScenarioNotification(scenarioTitle: string): void {
        this.showNotification(
            '📚 Новый сценарий!',
            `Доступен новый сценарий: "${scenarioTitle}"`,
            'scenario'
        );
    }

    // Achievement unlocked notification
    showAchievementNotification(achievementTitle: string): void {
        this.showNotification(
            '🏆 Достижение получено!',
            `Поздравляем! Вы получили: "${achievementTitle}"`,
            'achievement'
        );
    }

    // Daily challenge notification
    showDailyChallengeNotification(): void {
        this.showNotification(
            '⚡ Ежедневные задания обновлены!',
            'Новые задания ждут вас. Заработайте до 90 XP сегодня!',
            'daily'
        );
    }

    // Security tip notification
    showSecurityTip(tip: string): void {
        this.showNotification(
            '💡 Совет по безопасности',
            tip,
            'tip'
        );
    }

    // Schedule daily reminder (simplified - runs when app is open)
    scheduleDailyReminder(): void {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(18, 0, 0, 0); // 6 PM

        if (now > reminderTime) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            this.showDailyChallengeNotification();
            // Reschedule for next day
            this.scheduleDailyReminder();
        }, timeUntilReminder);
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React hook for notifications
import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
    const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
    const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());

    const requestPermission = useCallback(async () => {
        const granted = await notificationService.requestPermission();
        setPermission(notificationService.getPermission());
        setSettings(notificationService.getSettings());
        return granted;
    }, []);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        notificationService.updateSettings(newSettings);
        setSettings(notificationService.getSettings());
    }, []);

    const showNotification = useCallback((
        title: string,
        body: string,
        type?: 'streak' | 'scenario' | 'achievement' | 'daily' | 'tip' | 'welcome',
        onClick?: () => void
    ) => {
        notificationService.showNotification(title, body, type, onClick);
    }, []);

    useEffect(() => {
        // Schedule daily reminder if enabled
        if (settings.enabled && settings.dailyChallenges) {
            notificationService.scheduleDailyReminder();
        }
    }, [settings.enabled, settings.dailyChallenges]);

    return {
        isSupported: notificationService.isSupported(),
        permission,
        settings,
        requestPermission,
        updateSettings,
        showNotification,
        showStreakReminder: notificationService.showStreakReminder.bind(notificationService),
        showAchievementNotification: notificationService.showAchievementNotification.bind(notificationService),
        showDailyChallengeNotification: notificationService.showDailyChallengeNotification.bind(notificationService),
        showSecurityTip: notificationService.showSecurityTip.bind(notificationService),
    };
}
