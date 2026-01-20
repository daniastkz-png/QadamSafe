import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield, ShieldCheck, ShieldX, Target, Trophy,
    Heart, Star, Play, Pause, RotateCcw,
    Mail, MessageSquare, Phone, Link, Wifi, Lock, Award
} from 'lucide-react';

// Types
interface Threat {
    id: string;
    type: 'phishing_email' | 'scam_sms' | 'malicious_link' | 'fake_call' | 'unsafe_wifi' | 'weak_password';
    title: string;
    description: string;
    icon: React.ElementType;
    speed: number; // pixels per frame
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    isBlocked: boolean;
    isDangerous: boolean; // false = safe, needs to be let through
}

interface GameState {
    status: 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';
    score: number;
    level: number;
    lives: number;
    maxLives: number;
    threatsBlocked: number;
    threatsLetThrough: number;
    falsePositives: number; // blocked safe items
    missedThreats: number; // let through dangerous items
    combo: number;
    maxCombo: number;
    startTime: number | null;
    elapsedTime: number;
}

// Threat templates
const THREAT_TEMPLATES = {
    phishing_email: {
        icon: Mail,
        color: 'cyber-red',
        dangerous: [
            { title: 'Ваш аккаунт заблокирован!', description: 'От: security@g00gle.com' },
            { title: 'Подтвердите карту', description: 'От: kaspi-bank@mail.ru' },
            { title: 'Вы выиграли iPhone!', description: 'От: apple-prizes@xyz.com' },
        ],
        safe: [
            { title: 'Ваш заказ отправлен', description: 'От: orders@kaspi.kz' },
            { title: 'Подтверждение регистрации', description: 'От: noreply@egov.kz' },
        ]
    },
    scam_sms: {
        icon: MessageSquare,
        color: 'cyber-yellow',
        dangerous: [
            { title: 'Перейди по ссылке bit.ly/...', description: 'SMS от +7 777 xxx' },
            { title: 'Ваша карта заблокирована', description: 'SMS от BANK' },
            { title: 'Мама, срочно переведи деньги', description: 'SMS от +7 700 xxx' },
        ],
        safe: [
            { title: 'Код подтверждения: 4521', description: 'SMS от Kaspi' },
            { title: 'Ваша посылка доставлена', description: 'SMS от Kazpost' },
        ]
    },
    fake_call: {
        icon: Phone,
        color: 'orange-400',
        dangerous: [
            { title: 'Служба безопасности банка', description: 'Звонок' },
            { title: 'Полиция: на вас дело', description: 'Звонок' },
            { title: 'Ваш родственник в беде', description: 'Звонок' },
        ],
        safe: [
            { title: 'Kaspi: подтверждение операции', description: 'Официальный звонок' },
            { title: 'Доставка: уточнение адреса', description: 'Курьерская служба' },
        ]
    },
    malicious_link: {
        icon: Link,
        color: 'purple-400',
        dangerous: [
            { title: 'kaspi-bonuses.xyz/free', description: 'Подозрительная ссылка' },
            { title: 'instagram-login.top/auth', description: 'Фишинговый сайт' },
            { title: 'free-money-kz.work', description: 'Мошенничество' },
        ],
        safe: [
            { title: 'kaspi.kz/transfers', description: 'Официальный сайт' },
            { title: 'egov.kz/services', description: 'Гос. портал' },
        ]
    },
    unsafe_wifi: {
        icon: Wifi,
        color: 'cyan-400',
        dangerous: [
            { title: 'Free_Airport_WiFi', description: 'Открытая сеть' },
            { title: 'Starbucks_Free', description: 'Поддельная точка' },
        ],
        safe: [
            { title: 'Home_Network_5G', description: 'Защищённая сеть 🔒' },
        ]
    },
    weak_password: {
        icon: Lock,
        color: 'pink-400',
        dangerous: [
            { title: 'password123', description: 'Слабый пароль' },
            { title: 'qwerty2024', description: 'Предсказуемый' },
            { title: '12345678', description: 'Очень слабый' },
        ],
        safe: [
            { title: 'Kz$9xP#mL2!vQ', description: 'Надёжный пароль ✓' },
        ]
    }
};

// Level configurations
const LEVELS = [
    { level: 1, name: 'Новичок', threatCount: 10, speed: 1, spawnRate: 2000, types: ['phishing_email', 'scam_sms'] },
    { level: 2, name: 'Защитник', threatCount: 15, speed: 1.2, spawnRate: 1800, types: ['phishing_email', 'scam_sms', 'fake_call'] },
    { level: 3, name: 'Страж', threatCount: 20, speed: 1.4, spawnRate: 1500, types: ['phishing_email', 'scam_sms', 'fake_call', 'malicious_link'] },
    { level: 4, name: 'Эксперт', threatCount: 25, speed: 1.6, spawnRate: 1200, types: ['phishing_email', 'scam_sms', 'fake_call', 'malicious_link', 'unsafe_wifi'] },
    { level: 5, name: 'Киберзащитник', threatCount: 30, speed: 1.8, spawnRate: 1000, types: ['phishing_email', 'scam_sms', 'fake_call', 'malicious_link', 'unsafe_wifi', 'weak_password'] },
];

// Shield Component
const ShieldDefense: React.FC<{
    isActive: boolean;
    health: number;
    maxHealth: number;
}> = ({ isActive, health, maxHealth }) => {
    const healthPercent = (health / maxHealth) * 100;

    return (
        <div className="relative flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                ? 'bg-cyber-green/20 border-4 border-cyber-green shadow-lg shadow-cyber-green/50'
                : 'bg-gray-800 border-4 border-gray-600'
                }`}>
                <Shield className={`w-12 h-12 ${isActive ? 'text-cyber-green' : 'text-gray-500'}`} />
            </div>

            {/* Health bar */}
            <div className="absolute -bottom-4 w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${healthPercent > 60 ? 'bg-cyber-green' :
                        healthPercent > 30 ? 'bg-cyber-yellow' : 'bg-cyber-red'
                        }`}
                    style={{ width: `${healthPercent}%` }}
                />
            </div>
        </div>
    );
};

// Threat Component
const ThreatItem: React.FC<{
    threat: Threat;
    onBlock: (id: string) => void;
    onLetThrough: (id: string) => void;
}> = ({ threat, onBlock, onLetThrough }) => {
    const Icon = threat.icon;

    return (
        <div
            className={`absolute transition-all duration-100 transform ${threat.isBlocked ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            style={{
                left: threat.x,
                top: threat.y,
                transform: `translate(-50%, -50%)`
            }}
        >
            <div className={`p-3 rounded-xl border-2 ${threat.isDangerous
                ? 'bg-red-900/80 border-cyber-red'
                : 'bg-green-900/80 border-cyber-green'
                } backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform min-w-[180px]`}>
                <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${threat.isDangerous ? 'text-cyber-red' : 'text-cyber-green'}`} />
                    <span className={`text-xs font-bold ${threat.isDangerous ? 'text-red-300' : 'text-green-300'}`}>
                        {threat.isDangerous ? '⚠️ УГРОЗА' : '✓ Безопасно'}
                    </span>
                </div>
                <p className="text-white text-sm font-medium truncate">{threat.title}</p>
                <p className="text-gray-400 text-xs truncate">{threat.description}</p>

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => onBlock(threat.id)}
                        className="flex-1 py-1 px-2 bg-cyber-red/20 hover:bg-cyber-red/40 border border-cyber-red/50 rounded text-cyber-red text-xs font-bold transition-colors"
                    >
                        🛡️ Блокировать
                    </button>
                    <button
                        onClick={() => onLetThrough(threat.id)}
                        className="flex-1 py-1 px-2 bg-cyber-green/20 hover:bg-cyber-green/40 border border-cyber-green/50 rounded text-cyber-green text-xs font-bold transition-colors"
                    >
                        ✓ Пропустить
                    </button>
                </div>
            </div>
        </div>
    );
};

// Game HUD
const GameHUD: React.FC<{
    gameState: GameState;
    levelConfig: typeof LEVELS[0];
}> = ({ gameState, levelConfig }) => {
    const { t } = useTranslation();

    return (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Left - Score & Level */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-cyber-green text-2xl font-bold">{gameState.score}</p>
                        <p className="text-gray-400 text-xs">{t('cyberDefense.score', 'Очки')}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <p className="text-cyber-yellow text-xl font-bold">Ур. {gameState.level}</p>
                        <p className="text-gray-400 text-xs">{levelConfig.name}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <p className="text-orange-400 text-xl font-bold">x{gameState.combo}</p>
                        <p className="text-gray-400 text-xs">{t('cyberDefense.combo', 'Комбо')}</p>
                    </div>
                </div>
            </div>

            {/* Right - Lives */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-2">
                    {Array.from({ length: gameState.maxLives }).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-6 h-6 ${i < gameState.lives ? 'text-cyber-red fill-cyber-red' : 'text-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main Game Component
export const CyberDefensePage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Feature Gate: PRO or higher
    if (user && user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="PRO"
                icon={<Shield className="w-12 h-12 text-cyber-green opacity-50" />}
            />
        );
    }

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [gameState, setGameState] = useState<GameState>({
        status: 'menu',
        score: 0,
        level: 1,
        lives: 3,
        maxLives: 3,
        threatsBlocked: 0,
        threatsLetThrough: 0,
        falsePositives: 0,
        missedThreats: 0,
        combo: 0,
        maxCombo: 0,
        startTime: null,
        elapsedTime: 0
    });

    const [threats, setThreats] = useState<Threat[]>([]);
    const [spawnedCount, setSpawnedCount] = useState(0);

    const levelConfig = LEVELS[Math.min(gameState.level - 1, LEVELS.length - 1)];

    // Generate a new threat
    const generateThreat = useCallback(() => {
        if (!gameAreaRef.current) return null;

        const rect = gameAreaRef.current.getBoundingClientRect();
        const types = levelConfig.types as (keyof typeof THREAT_TEMPLATES)[];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const template = THREAT_TEMPLATES[randomType];

        const isDangerous = Math.random() > 0.3; // 70% dangerous
        const threatList = isDangerous ? template.dangerous : template.safe;
        const randomThreat = threatList[Math.floor(Math.random() * threatList.length)];

        const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let startX, startY;

        switch (side) {
            case 0: startX = Math.random() * rect.width; startY = -50; break;
            case 1: startX = rect.width + 50; startY = Math.random() * rect.height; break;
            case 2: startX = Math.random() * rect.width; startY = rect.height + 50; break;
            default: startX = -50; startY = Math.random() * rect.height; break;
        }

        return {
            id: `threat-${Date.now()}-${Math.random()}`,
            type: randomType,
            title: randomThreat.title,
            description: randomThreat.description,
            icon: template.icon,
            speed: levelConfig.speed,
            x: startX,
            y: startY,
            targetX: rect.width / 2,
            targetY: rect.height / 2,
            isBlocked: false,
            isDangerous
        } as Threat;
    }, [levelConfig]);

    // Spawn threats
    useEffect(() => {
        if (gameState.status !== 'playing') return;

        if (spawnedCount >= levelConfig.threatCount) return;

        spawnTimerRef.current = setInterval(() => {
            if (spawnedCount >= levelConfig.threatCount) {
                if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
                return;
            }

            const newThreat = generateThreat();
            if (newThreat) {
                setThreats(prev => [...prev, newThreat]);
                setSpawnedCount(prev => prev + 1);
            }
        }, levelConfig.spawnRate);

        return () => {
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        };
    }, [gameState.status, spawnedCount, levelConfig, generateThreat]);

    // Move threats
    useEffect(() => {
        if (gameState.status !== 'playing') return;

        const moveThreats = () => {
            setThreats(prev => {
                const updated = prev.map(threat => {
                    if (threat.isBlocked) return threat;

                    const dx = threat.targetX - threat.x;
                    const dy = threat.targetY - threat.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 50) {
                        // Threat reached center
                        if (threat.isDangerous) {
                            setGameState(gs => ({
                                ...gs,
                                lives: gs.lives - 1,
                                missedThreats: gs.missedThreats + 1,
                                combo: 0
                            }));
                        }
                        return { ...threat, isBlocked: true };
                    }

                    const speed = threat.speed * 2;
                    const vx = (dx / distance) * speed;
                    const vy = (dy / distance) * speed;

                    return {
                        ...threat,
                        x: threat.x + vx,
                        y: threat.y + vy
                    };
                });

                return updated.filter(t => !t.isBlocked || Date.now() - parseInt(t.id.split('-')[1]) < 500);
            });

            animationRef.current = requestAnimationFrame(moveThreats);
        };

        animationRef.current = requestAnimationFrame(moveThreats);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [gameState.status]);

    // Check game over / victory
    useEffect(() => {
        if (gameState.status !== 'playing') return;

        if (gameState.lives <= 0) {
            setGameState(gs => ({ ...gs, status: 'gameover' }));
        } else if (spawnedCount >= levelConfig.threatCount && threats.length === 0) {
            // Level complete
            if (gameState.level < LEVELS.length) {
                // Next level
                setGameState(gs => ({
                    ...gs,
                    level: gs.level + 1,
                    score: gs.score + 100 // Level bonus
                }));
                setSpawnedCount(0);
            } else {
                // Victory!
                setGameState(gs => ({ ...gs, status: 'victory' }));
            }
        }
    }, [gameState.lives, gameState.status, gameState.level, spawnedCount, threats.length, levelConfig.threatCount]);

    // Handle blocking threat
    const handleBlock = useCallback((id: string) => {
        setThreats(prev => {
            const threat = prev.find(t => t.id === id);
            if (!threat) return prev;

            if (threat.isDangerous) {
                // Correct block
                setGameState(gs => ({
                    ...gs,
                    score: gs.score + 10 * (gs.combo + 1),
                    threatsBlocked: gs.threatsBlocked + 1,
                    combo: gs.combo + 1,
                    maxCombo: Math.max(gs.maxCombo, gs.combo + 1)
                }));
            } else {
                // False positive
                setGameState(gs => ({
                    ...gs,
                    score: Math.max(0, gs.score - 5),
                    falsePositives: gs.falsePositives + 1,
                    combo: 0
                }));
            }

            return prev.map(t => t.id === id ? { ...t, isBlocked: true } : t);
        });
    }, []);

    // Handle letting through
    const handleLetThrough = useCallback((id: string) => {
        setThreats(prev => {
            const threat = prev.find(t => t.id === id);
            if (!threat) return prev;

            if (!threat.isDangerous) {
                // Correct let through
                setGameState(gs => ({
                    ...gs,
                    score: gs.score + 15 * (gs.combo + 1),
                    threatsLetThrough: gs.threatsLetThrough + 1,
                    combo: gs.combo + 1,
                    maxCombo: Math.max(gs.maxCombo, gs.combo + 1)
                }));
            } else {
                // Missed threat
                setGameState(gs => ({
                    ...gs,
                    lives: gs.lives - 1,
                    missedThreats: gs.missedThreats + 1,
                    combo: 0
                }));
            }

            return prev.map(t => t.id === id ? { ...t, isBlocked: true } : t);
        });
    }, []);

    // Start game
    const startGame = () => {
        setGameState({
            status: 'playing',
            score: 0,
            level: 1,
            lives: 3,
            maxLives: 3,
            threatsBlocked: 0,
            threatsLetThrough: 0,
            falsePositives: 0,
            missedThreats: 0,
            combo: 0,
            maxCombo: 0,
            startTime: Date.now(),
            elapsedTime: 0
        });
        setThreats([]);
        setSpawnedCount(0);
    };

    // Pause game
    const togglePause = () => {
        setGameState(gs => ({
            ...gs,
            status: gs.status === 'playing' ? 'paused' : 'playing'
        }));
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                {gameState.status === 'menu' && (
                    <div className="max-w-4xl mx-auto p-4 md:p-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full text-cyber-green text-sm font-medium mb-4">
                                <Shield className="w-4 h-4" />
                                {t('cyberDefense.badge', 'Мини-игра')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                🛡️ Cyber Defense
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {t('cyberDefense.subtitle', 'Защитите свою систему от киберугроз!')}
                            </p>
                        </div>

                        {/* How to play */}
                        <div className="cyber-card mb-8">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-cyber-yellow" />
                                {t('cyberDefense.howToPlay', 'Как играть')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-cyber-red/10 rounded-xl border border-cyber-red/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldX className="w-5 h-5 text-cyber-red" />
                                        <span className="font-bold text-cyber-red">{t('cyberDefense.block', 'Блокировать')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('cyberDefense.blockDesc', 'Блокируйте опасные угрозы: фишинг, мошенничество, вирусы')}
                                    </p>
                                </div>
                                <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-5 h-5 text-cyber-green" />
                                        <span className="font-bold text-cyber-green">{t('cyberDefense.letThrough', 'Пропустить')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('cyberDefense.letThroughDesc', 'Пропускайте безопасные элементы: легитимные письма, защищённые сети')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-cyber-yellow/10 rounded-xl border border-cyber-yellow/30">
                                <p className="text-sm text-cyber-yellow">
                                    ⚠️ {t('cyberDefense.warning', 'Внимание! Ошибочная блокировка безопасных элементов или пропуск угроз стоит жизней!')}
                                </p>
                            </div>
                        </div>

                        {/* Levels */}
                        <div className="cyber-card mb-8">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-cyber-yellow" />
                                {t('cyberDefense.levels', 'Уровни')}
                            </h2>
                            <div className="grid grid-cols-5 gap-2">
                                {LEVELS.map((level) => (
                                    <div key={level.level} className="text-center p-3 bg-muted/30 rounded-lg">
                                        <p className="text-lg font-bold text-foreground">{level.level}</p>
                                        <p className="text-xs text-muted-foreground">{level.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startGame}
                            className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyber-green to-cyan-500 text-black font-bold text-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyber-green/30"
                        >
                            <Play className="w-8 h-8" />
                            {t('cyberDefense.startGame', 'Начать игру')}
                        </button>
                    </div>
                )}

                {(gameState.status === 'playing' || gameState.status === 'paused') && (
                    <div
                        ref={gameAreaRef}
                        className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden"
                    >
                        {/* Game HUD */}
                        <GameHUD gameState={gameState} levelConfig={levelConfig} />

                        {/* Center Shield */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <ShieldDefense
                                isActive={gameState.status === 'playing'}
                                health={gameState.lives}
                                maxHealth={gameState.maxLives}
                            />
                        </div>

                        {/* Threats */}
                        {threats.map(threat => (
                            <ThreatItem
                                key={threat.id}
                                threat={threat}
                                onBlock={handleBlock}
                                onLetThrough={handleLetThrough}
                            />
                        ))}

                        {/* Pause Button */}
                        <button
                            onClick={togglePause}
                            className="absolute bottom-4 right-4 p-4 bg-black/60 backdrop-blur-sm rounded-xl border border-gray-700 hover:bg-black/80 transition-colors"
                        >
                            {gameState.status === 'paused' ? (
                                <Play className="w-6 h-6 text-white" />
                            ) : (
                                <Pause className="w-6 h-6 text-white" />
                            )}
                        </button>

                        {/* Pause Overlay */}
                        {gameState.status === 'paused' && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                <div className="text-center">
                                    <Pause className="w-16 h-16 text-white mx-auto mb-4" />
                                    <p className="text-white text-2xl font-bold">{t('cyberDefense.paused', 'Пауза')}</p>
                                    <button
                                        onClick={togglePause}
                                        className="mt-6 px-8 py-3 bg-cyber-green text-black font-bold rounded-xl"
                                    >
                                        {t('cyberDefense.resume', 'Продолжить')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Game Over / Victory Screen */}
                {(gameState.status === 'gameover' || gameState.status === 'victory') && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
                        <div className="max-w-md w-full cyber-card text-center">
                            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${gameState.status === 'victory' ? 'bg-cyber-green/20' : 'bg-cyber-red/20'
                                }`}>
                                {gameState.status === 'victory' ? (
                                    <Trophy className="w-12 h-12 text-cyber-green" />
                                ) : (
                                    <ShieldX className="w-12 h-12 text-cyber-red" />
                                )}
                            </div>

                            <h2 className={`text-3xl font-bold mb-2 ${gameState.status === 'victory' ? 'text-cyber-green' : 'text-cyber-red'
                                }`}>
                                {gameState.status === 'victory'
                                    ? t('cyberDefense.victory', 'Победа!')
                                    : t('cyberDefense.gameOver', 'Игра окончена')}
                            </h2>

                            <p className="text-muted-foreground mb-6">
                                {gameState.status === 'victory'
                                    ? t('cyberDefense.victoryDesc', 'Вы защитили систему от всех угроз!')
                                    : t('cyberDefense.gameOverDesc', 'Система была скомпрометирована')}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-muted/30 rounded-xl">
                                    <p className="text-2xl font-bold text-cyber-green">{gameState.score}</p>
                                    <p className="text-xs text-muted-foreground">{t('cyberDefense.finalScore', 'Очки')}</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl">
                                    <p className="text-2xl font-bold text-cyber-yellow">{gameState.level}</p>
                                    <p className="text-xs text-muted-foreground">{t('cyberDefense.reachedLevel', 'Уровень')}</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl">
                                    <p className="text-2xl font-bold text-cyan-400">{gameState.threatsBlocked}</p>
                                    <p className="text-xs text-muted-foreground">{t('cyberDefense.blocked', 'Заблокировано')}</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl">
                                    <p className="text-2xl font-bold text-orange-400">x{gameState.maxCombo}</p>
                                    <p className="text-xs text-muted-foreground">{t('cyberDefense.maxCombo', 'Макс. комбо')}</p>
                                </div>
                            </div>

                            {/* XP Earned */}
                            <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30 mb-6">
                                <div className="flex items-center justify-center gap-2">
                                    <Award className="w-6 h-6 text-cyber-green" />
                                    <span className="text-xl font-bold text-cyber-green">+{Math.round(gameState.score / 2)} XP</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={startGame}
                                    className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/80 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t('cyberDefense.playAgain', 'Играть снова')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CyberDefensePage;
