import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Bell, BellOff, Flame, BookOpen, Trophy,
    Zap, Lightbulb, AlertCircle
} from 'lucide-react';
import { useNotifications, NotificationSettings } from '../services/notificationService';

interface NotificationToggleProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
    icon,
    label,
    description,
    checked,
    onChange,
    disabled = false,
}) => {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/30'
            } ${checked ? 'bg-cyber-green/5 border-cyber-green/30' : 'bg-card border-border'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${checked ? 'bg-cyber-green/10 text-cyber-green' : 'bg-muted text-muted-foreground'
                    }`}>
                    {icon}
                </div>
                <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer transition-all ${checked
                    ? 'bg-cyber-green'
                    : 'bg-muted'
                    } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyber-green/50 peer-disabled:opacity-50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${checked ? 'after:translate-x-5' : ''
                    }`} />
            </label>
        </div>
    );
};

export const NotificationSettingsPanel: React.FC = () => {
    const { t } = useTranslation();
    const {
        isSupported,
        permission,
        settings,
        requestPermission,
        updateSettings
    } = useNotifications();

    const handleEnableNotifications = async () => {
        if (permission === 'granted') {
            updateSettings({ enabled: !settings.enabled });
        } else {
            await requestPermission();
        }
    };

    const handleToggle = (key: keyof NotificationSettings) => (checked: boolean) => {
        updateSettings({ [key]: checked });
    };

    if (!isSupported) {
        return (
            <div className="cyber-card">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <p>{t('notifications.notSupported', 'Ваш браузер не поддерживает уведомления')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Toggle */}
            <div className={`cyber-card border-2 transition-all ${settings.enabled ? 'border-cyber-green/50 bg-cyber-green/5' : 'border-border'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${settings.enabled
                            ? 'bg-cyber-green/20 text-cyber-green'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                            {settings.enabled ? <Bell className="w-7 h-7" /> : <BellOff className="w-7 h-7" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                {t('notifications.title', 'Push-уведомления')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {settings.enabled
                                    ? t('notifications.enabled', 'Уведомления включены')
                                    : permission === 'denied'
                                        ? t('notifications.blocked', 'Уведомления заблокированы в браузере')
                                        : t('notifications.disabled', 'Уведомления отключены')
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleEnableNotifications}
                        disabled={permission === 'denied'}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${permission === 'denied'
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : settings.enabled
                                ? 'bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20'
                                : 'bg-cyber-green text-background hover:bg-cyber-green/90'
                            }`}
                    >
                        {permission === 'denied'
                            ? t('notifications.blockedBtn', 'Заблокировано')
                            : settings.enabled
                                ? t('notifications.disable', 'Отключить')
                                : t('notifications.enable', 'Включить')
                        }
                    </button>
                </div>

                {permission === 'denied' && (
                    <div className="mt-4 p-3 bg-cyber-red/10 rounded-lg border border-cyber-red/30">
                        <p className="text-sm text-cyber-red">
                            {t('notifications.deniedHelp', 'Чтобы включить уведомления, разрешите их в настройках браузера для этого сайта.')}
                        </p>
                    </div>
                )}
            </div>

            {/* Notification Types */}
            {settings.enabled && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-2">
                        {t('notifications.types', 'Типы уведомлений')}
                    </h4>

                    <NotificationToggle
                        icon={<Flame className="w-5 h-5" />}
                        label={t('notifications.streakReminders', 'Напоминания о сериях')}
                        description={t('notifications.streakDesc', 'Не дайте серии прерваться')}
                        checked={settings.streakReminders}
                        onChange={handleToggle('streakReminders')}
                    />

                    <NotificationToggle
                        icon={<Zap className="w-5 h-5" />}
                        label={t('notifications.dailyChallenges', 'Ежедневные задания')}
                        description={t('notifications.dailyDesc', 'Напоминания о новых заданиях')}
                        checked={settings.dailyChallenges}
                        onChange={handleToggle('dailyChallenges')}
                    />

                    <NotificationToggle
                        icon={<Trophy className="w-5 h-5" />}
                        label={t('notifications.achievements', 'Достижения')}
                        description={t('notifications.achievementsDesc', 'Уведомления о новых наградах')}
                        checked={settings.achievements}
                        onChange={handleToggle('achievements')}
                    />

                    <NotificationToggle
                        icon={<BookOpen className="w-5 h-5" />}
                        label={t('notifications.newScenarios', 'Новые сценарии')}
                        description={t('notifications.scenariosDesc', 'Когда добавляются новые сценарии')}
                        checked={settings.newScenarios}
                        onChange={handleToggle('newScenarios')}
                    />

                    <NotificationToggle
                        icon={<Lightbulb className="w-5 h-5" />}
                        label={t('notifications.tips', 'Советы по безопасности')}
                        description={t('notifications.tipsDesc', 'Полезные советы и напоминания')}
                        checked={settings.tips}
                        onChange={handleToggle('tips')}
                    />
                </div>
            )}

            {/* Test Notification Button */}
            {settings.enabled && (
                <button
                    onClick={() => {
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('🔔 Тестовое уведомление', {
                                body: 'Уведомления работают корректно!',
                                icon: '/favicon.ico',
                            });
                        }
                    }}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-cyber-green/30 text-cyber-green hover:bg-cyber-green/5 transition-all flex items-center justify-center gap-2"
                >
                    <Bell className="w-4 h-4" />
                    {t('notifications.test', 'Отправить тестовое уведомление')}
                </button>
            )}
        </div>
    );
};

export default NotificationSettingsPanel;
