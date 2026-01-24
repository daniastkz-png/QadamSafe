import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakProps {
    currentStreak: number;
    frozen?: boolean;
}

export const StreakWidget: React.FC<StreakProps> = ({ currentStreak = 5, frozen = false }) => {
    const { t } = useTranslation();
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const activeDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0, Sun=6

    return (
        <div className="cyber-card p-6 bg-gradient-to-br from-card to-orange-500/5 border-orange-500/20">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${frozen ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}
                        >
                            {frozen ? <Snowflake className="w-6 h-6 text-blue-400" /> : <Flame className="w-6 h-6 text-orange-500" />}
                        </motion.div>
                        {/* Status Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-background border border-border text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                            {frozen ? 'FROZEN' : 'ACTIVE'}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                            {currentStreak} {t('progress.streak.days', 'дней')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {frozen ? t('streak.frozenDesc', 'Серия заморожена') : t('streak.keepGoing', 'Так держать!')}
                        </p>
                    </div>
                </div>

                {!frozen && (
                    <button className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1">
                        <Snowflake size={12} />
                        {t('streak.freeze', 'Заморозка')}
                    </button>
                )}
            </div>

            {/* Calendar Visualization */}
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                {days.map((day, idx) => (
                    <div key={day} className="flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground">{day}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                            ${idx < activeDayIndex
                                ? 'bg-orange-500 border-orange-500 text-white' // Past days
                                : idx === activeDayIndex
                                    ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' // Today
                                    : 'border-muted text-muted-foreground opacity-50' // Future days
                            }`}>
                            {idx < activeDayIndex ? <Flame size={14} fill="white" /> : idx === activeDayIndex ? <Flame size={14} /> : null}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                    {t('streak.nextGoal', 'Следующая цель: 7 дней (+50 XP)')}
                </p>
            </div>
        </div>
    );
};
