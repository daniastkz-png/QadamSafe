import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, Trophy, Target, Plus, Crown,
    Medal, Shield, Flame, Calendar, Clock,
    School, MapPin, TrendingUp, Star, Zap, CheckCircle,
    Search, Copy, Share2, UserPlus
} from 'lucide-react';

// Types
interface Team {
    id: string;
    name: string;
    school: string;
    city: string;
    avatar: string;
    members: TeamMember[];
    totalXP: number;
    completedScenarios: number;
    avgStreak: number;
    rank: number;
    isYourTeam?: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    xp: number;
    streak: number;
    isLeader?: boolean;
}

interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'speed' | 'accuracy' | 'streak' | 'scenarios';
    icon: React.ElementType;
    startDate: Date;
    endDate: Date;
    prize: string;
    participants: number;
    status: 'upcoming' | 'active' | 'ended';
    leaderboard: Team[];
}

// Mock data
const MOCK_TEAMS: Team[] = [
    {
        id: '1',
        name: 'Cyber Warriors',
        school: 'Школа №45',
        city: 'Алматы',
        avatar: '🛡️',
        totalXP: 4520,
        completedScenarios: 48,
        avgStreak: 12,
        rank: 1,
        members: [
            { id: '1', name: 'Арман К.', avatar: '👦', xp: 1250, streak: 15, isLeader: true },
            { id: '2', name: 'Алина С.', avatar: '👧', xp: 1180, streak: 12 },
            { id: '3', name: 'Тимур Б.', avatar: '👨', xp: 1100, streak: 10 },
            { id: '4', name: 'Дана М.', avatar: '👩', xp: 990, streak: 11 },
        ]
    },
    {
        id: '2',
        name: 'Digital Guardians',
        school: 'Лицей №7',
        city: 'Нур-Султан',
        avatar: '🔒',
        totalXP: 4180,
        completedScenarios: 45,
        avgStreak: 10,
        rank: 2,
        members: [
            { id: '5', name: 'Нурсултан А.', avatar: '👦', xp: 1150, streak: 14, isLeader: true },
            { id: '6', name: 'Камила Н.', avatar: '👧', xp: 1080, streak: 9 },
            { id: '7', name: 'Ерлан К.', avatar: '👨', xp: 1000, streak: 8 },
            { id: '8', name: 'Айгерим Т.', avatar: '👩', xp: 950, streak: 9 },
        ]
    },
    {
        id: '3',
        name: 'Защитники сети',
        school: 'Гимназия №1',
        city: 'Шымкент',
        avatar: '🌐',
        totalXP: 3890,
        completedScenarios: 42,
        avgStreak: 9,
        rank: 3,
        members: [
            { id: '9', name: 'Дарын О.', avatar: '👦', xp: 1050, streak: 11, isLeader: true },
            { id: '10', name: 'Мадина К.', avatar: '👧', xp: 980, streak: 8 },
            { id: '11', name: 'Асет Б.', avatar: '👨', xp: 930, streak: 7 },
            { id: '12', name: 'Жанель С.', avatar: '👩', xp: 930, streak: 10 },
        ]
    },
    {
        id: 'your-team',
        name: 'Кибер-герои 7А',
        school: 'Школа №73',
        city: 'Караганда',
        avatar: '⚡',
        totalXP: 3450,
        completedScenarios: 38,
        avgStreak: 8,
        rank: 5,
        isYourTeam: true,
        members: [
            { id: '13', name: 'Вы', avatar: '🧑', xp: 980, streak: 7, isLeader: true },
            { id: '14', name: 'Даниал А.', avatar: '👦', xp: 890, streak: 9 },
            { id: '15', name: 'Сара М.', avatar: '👧', xp: 820, streak: 6 },
            { id: '16', name: 'Куаныш Т.', avatar: '👨', xp: 760, streak: 10 },
        ]
    },
];

const MOCK_CHALLENGES: Challenge[] = [
    {
        id: '1',
        title: 'Неделя фишинга',
        description: 'Пройдите как можно больше сценариев о фишинге за неделю',
        type: 'scenarios',
        icon: Target,
        startDate: new Date('2026-01-13'),
        endDate: new Date('2026-01-20'),
        prize: '🏆 5000 XP + Значок "Антифишинг"',
        participants: 45,
        status: 'active',
        leaderboard: MOCK_TEAMS
    },
    {
        id: '2',
        title: 'Марафон точности',
        description: 'Достигните 100% точности в 10 сценариях подряд',
        type: 'accuracy',
        icon: Shield,
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-27'),
        prize: '🥇 3000 XP + Значок "Снайпер"',
        participants: 32,
        status: 'upcoming',
        leaderboard: []
    },
    {
        id: '3',
        title: 'Огненная серия',
        description: 'Поддерживайте самую длинную серию обучения',
        type: 'streak',
        icon: Flame,
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-01-13'),
        prize: '🔥 2000 XP + Значок "Огонь"',
        participants: 58,
        status: 'ended',
        leaderboard: MOCK_TEAMS.slice(0, 3)
    },
];

// Create Team Modal
const CreateTeamModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, school: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [creating, setCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        await new Promise(r => setTimeout(r, 1000));
        onCreate(name, school);
        setName('');
        setSchool('');
        setCreating(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyber-green" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            {t('challenges.createTeam', 'Создать команду')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('challenges.createTeamDesc', 'Соберите друзей для соревнований')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('challenges.teamName', 'Название команды')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Кибер-защитники"
                            required
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/50 text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('challenges.school', 'Школа/Организация')}
                        </label>
                        <input
                            type="text"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            placeholder="Школа №45, г. Алматы"
                            required
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-cyber-green text-foreground"
                        />
                    </div>

                    <div className="p-4 bg-cyber-yellow/10 rounded-xl border border-cyber-yellow/30">
                        <p className="text-sm text-cyber-yellow flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            {t('challenges.teamTip', 'После создания вы получите код для приглашения участников')}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-all"
                        >
                            {t('common.cancel', 'Отмена')}
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-1 py-3 rounded-xl bg-cyber-green text-black font-medium hover:bg-cyber-green/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {t('challenges.create', 'Создать')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Team Card Component
const TeamCard: React.FC<{
    team: Team;
    showDetails?: boolean;
}> = ({ team, showDetails = false }) => {
    const { t } = useTranslation();

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5 text-cyber-yellow" />;
            case 2: return <Medal className="w-5 h-5 text-gray-300" />;
            case 3: return <Medal className="w-5 h-5 text-orange-400" />;
            default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-cyber-yellow/20 to-orange-500/10 border-cyber-yellow/30';
            case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-500/10 border-gray-300/30';
            case 3: return 'bg-gradient-to-r from-orange-400/20 to-amber-500/10 border-orange-400/30';
            default: return 'bg-card border-border';
        }
    };

    return (
        <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${team.isYourTeam ? 'ring-2 ring-cyber-green' : ''
            } ${getRankBg(team.rank)}`}>
            <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                    {getRankIcon(team.rank)}
                </div>

                {/* Team Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{team.avatar}</span>
                        <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                {team.name}
                                {team.isYourTeam && (
                                    <span className="text-xs px-2 py-0.5 bg-cyber-green/20 text-cyber-green rounded-full">
                                        {t('challenges.yourTeam', 'Ваша команда')}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <School className="w-3 h-3" />
                                {team.school}
                                <span className="mx-1">•</span>
                                <MapPin className="w-3 h-3" />
                                {team.city}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xl font-bold text-cyber-green">{team.totalXP.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-cyber-blue">{team.completedScenarios}</p>
                        <p className="text-xs text-muted-foreground">{t('challenges.scenarios', 'Сценариев')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-orange-400">{team.avgStreak}</p>
                        <p className="text-xs text-muted-foreground">{t('challenges.avgStreak', 'Серия')}</p>
                    </div>
                </div>
            </div>

            {/* Team Members */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">{t('challenges.members', 'Участники')}:</p>
                    <div className="flex flex-wrap gap-2">
                        {team.members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
                                <span>{member.avatar}</span>
                                <span className="text-sm text-foreground">{member.name}</span>
                                {member.isLeader && <Crown className="w-3 h-3 text-cyber-yellow" />}
                                <span className="text-xs text-cyber-green">{member.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Challenge Card Component
const ChallengeCard: React.FC<{
    challenge: Challenge;
    onJoin: () => void;
}> = ({ challenge, onJoin }) => {
    const { t } = useTranslation();
    const Icon = challenge.icon;

    const getStatusBadge = () => {
        switch (challenge.status) {
            case 'active':
                return <span className="px-2 py-1 bg-cyber-green/10 text-cyber-green text-xs rounded-full border border-cyber-green/30">{t('challenges.active', 'Активен')}</span>;
            case 'upcoming':
                return <span className="px-2 py-1 bg-cyber-blue/10 text-cyber-blue text-xs rounded-full border border-cyber-blue/30">{t('challenges.upcoming', 'Скоро')}</span>;
            case 'ended':
                return <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border">{t('challenges.ended', 'Завершён')}</span>;
        }
    };

    const getDaysLeft = () => {
        const now = new Date();
        const diff = challenge.endDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    return (
        <div className={`cyber-card ${challenge.status === 'active' ? 'border-cyber-green/30 bg-cyber-green/5' : ''}`}>
            <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${challenge.status === 'active'
                    ? 'bg-cyber-green/20 border border-cyber-green/30'
                    : 'bg-muted'
                    }`}>
                    <Icon className={`w-7 h-7 ${challenge.status === 'active' ? 'text-cyber-green' : 'text-muted-foreground'}`} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                        {getStatusBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {challenge.startDate.toLocaleDateString('ru-RU')} - {challenge.endDate.toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {challenge.participants} {t('challenges.teams', 'команд')}
                        </span>
                        {challenge.status === 'active' && (
                            <span className="flex items-center gap-1 text-cyber-yellow">
                                <Clock className="w-4 h-4" />
                                {getDaysLeft()} {t('challenges.daysLeft', 'дней')}
                            </span>
                        )}
                    </div>

                    <div className="mt-3 p-3 bg-background/50 rounded-lg">
                        <p className="text-sm">
                            <span className="text-muted-foreground">{t('challenges.prize', 'Приз')}:</span>{' '}
                            <span className="text-foreground font-medium">{challenge.prize}</span>
                        </p>
                    </div>
                </div>

                {challenge.status !== 'ended' && (
                    <button
                        onClick={onJoin}
                        className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${challenge.status === 'active'
                            ? 'bg-cyber-green text-black hover:bg-cyber-green/80'
                            : 'border border-border text-foreground hover:bg-muted'
                            }`}
                    >
                        {challenge.status === 'active' ? (
                            <>
                                <Trophy className="w-4 h-4" />
                                {t('challenges.participate', 'Участвовать')}
                            </>
                        ) : (
                            <>
                                <Calendar className="w-4 h-4" />
                                {t('challenges.remind', 'Напомнить')}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Mini Leaderboard for active challenges */}
            {challenge.status === 'active' && challenge.leaderboard.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyber-green" />
                        {t('challenges.currentLeaders', 'Текущие лидеры')}
                    </p>
                    <div className="space-y-2">
                        {challenge.leaderboard.slice(0, 3).map((team, index) => (
                            <div key={team.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                                    index === 1 ? 'bg-gray-300/20 text-gray-300' :
                                        'bg-orange-400/20 text-orange-400'
                                    }`}>
                                    {index + 1}
                                </span>
                                <span className="text-lg">{team.avatar}</span>
                                <span className="flex-1 text-sm text-foreground">{team.name}</span>
                                <span className="text-sm text-cyber-green font-medium">{team.totalXP.toLocaleString()} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Team Challenges Page
export const TeamChallengesPage: React.FC = () => {
    const { t } = useTranslation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'myteam'>('challenges');
    const [searchTerm, setSearchTerm] = useState('');

    const yourTeam = MOCK_TEAMS.find(t => t.isYourTeam);

    const filteredTeams = useMemo(() => {
        return MOCK_TEAMS
            .filter(team =>
                team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.city.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.rank - b.rank);
    }, [searchTerm]);

    const { user } = useAuth();

    // Feature Gate: BUSINESS only
    if (user && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="BUSINESS"
                icon={<Trophy className="w-12 h-12 text-cyber-yellow opacity-50" />}
            />
        );
    }

    const handleCreateTeam = (_name: string, _school: string) => {
        // TODO: Call API to create team
        // In real app, this would call an API
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div className="mb-4 md:mb-0">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-yellow/10 rounded-full text-cyber-yellow text-sm font-medium mb-4">
                                <Trophy className="w-4 h-4" />
                                {t('challenges.badge', 'Командные соревнования')}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                {t('challenges.title', 'Челленджи для школ')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('challenges.subtitle', 'Соревнуйтесь командами и станьте лучшими!')}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-green text-black rounded-xl font-medium hover:bg-cyber-green/80 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            {t('challenges.createTeam', 'Создать команду')}
                        </button>
                    </div>

                    {/* Your Team Banner */}
                    {yourTeam && (
                        <div className="mb-8">
                            <TeamCard team={yourTeam} showDetails />
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-border">
                        {[
                            { id: 'challenges', label: t('challenges.tabChallenges', 'Челленджи'), icon: Target },
                            { id: 'leaderboard', label: t('challenges.tabLeaderboard', 'Рейтинг команд'), icon: Trophy },
                            { id: 'myteam', label: t('challenges.tabMyTeam', 'Моя команда'), icon: Users },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-cyber-green text-cyber-green'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'challenges' && (
                        <div className="space-y-6">
                            {MOCK_CHALLENGES.map(challenge => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onJoin={() => { /* TODO: Join challenge handler */ }}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('challenges.searchTeams', 'Поиск команд...')}
                                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-cyber-green text-foreground"
                                />
                            </div>

                            {/* Teams List */}
                            <div className="space-y-3">
                                {filteredTeams.map(team => (
                                    <TeamCard key={team.id} team={team} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'myteam' && yourTeam && (
                        <div className="space-y-6">
                            {/* Team Code */}
                            <div className="cyber-card">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-cyber-green" />
                                    {t('challenges.inviteMembers', 'Пригласить участников')}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 p-4 bg-muted/30 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">{t('challenges.teamCode', 'Код команды')}</p>
                                        <p className="text-2xl font-mono font-bold text-cyber-green">CYBER-7A-2024</p>
                                    </div>
                                    <button className="p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                                        <Copy className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                                        <Share2 className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Team Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="cyber-card text-center">
                                    <Trophy className="w-8 h-8 text-cyber-yellow mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">#{yourTeam.rank}</p>
                                    <p className="text-sm text-muted-foreground">{t('challenges.rank', 'Место')}</p>
                                </div>
                                <div className="cyber-card text-center">
                                    <Star className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">{yourTeam.totalXP.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">XP</p>
                                </div>
                                <div className="cyber-card text-center">
                                    <Target className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">{yourTeam.completedScenarios}</p>
                                    <p className="text-sm text-muted-foreground">{t('challenges.scenarios', 'Сценариев')}</p>
                                </div>
                                <div className="cyber-card text-center">
                                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">{yourTeam.members.length}</p>
                                    <p className="text-sm text-muted-foreground">{t('challenges.members', 'Участников')}</p>
                                </div>
                            </div>

                            {/* Member List */}
                            <div className="cyber-card">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    {t('challenges.teamMembers', 'Участники команды')}
                                </h3>
                                <div className="space-y-3">
                                    {yourTeam.members.map((member, index) => (
                                        <div key={member.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                                                index === 1 ? 'bg-gray-300/20 text-gray-300' :
                                                    index === 2 ? 'bg-orange-400/20 text-orange-400' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-2xl">{member.avatar}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground flex items-center gap-2">
                                                    {member.name}
                                                    {member.isLeader && <Crown className="w-4 h-4 text-cyber-yellow" />}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-cyber-green">{member.xp} XP</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Flame className="w-3 h-3 text-orange-400" />
                                                    {member.streak} {t('challenges.days', 'дней')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="mt-8 cyber-card border-purple-500/30 bg-purple-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {t('challenges.tips.title', 'Как победить в челлендже')}
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('challenges.tips.tip1', 'Координируйте действия с командой для максимального XP')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('challenges.tips.tip2', 'Поддерживайте ежедневную серию всей командой')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('challenges.tips.tip3', 'Приглашайте новых участников по коду команды')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Team Modal */}
            <CreateTeamModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateTeam}
            />
        </DashboardLayout>
    );
};

export default TeamChallengesPage;
