import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { FeatureGate } from '../components/FeatureGate';
import { useAuth } from '../contexts/AuthContext';
import {
    GraduationCap, Users, BookOpen, Download, Plus, Trash2,
    Shield, TrendingUp, CheckCircle, AlertTriangle, ChevronRight,
    Search, Flame, Eye, Target, Zap, RefreshCw
} from 'lucide-react';
import { classroomService } from '../services/classroomService';
import type { Classroom } from '../services/classroomService';

// Types
interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string;
    securityScore: number;
    completedScenarios: number;
    totalScenarios: number;
    streak: number;
    lastActive: Date;
    grade: string;
    status: 'active' | 'inactive' | 'at-risk';
}

interface ClassRoom extends Classroom {
    students: Student[];
}

// Create Class Modal
const CreateClassModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, grade: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('7');
    const [creating, setCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        await new Promise(r => setTimeout(r, 1000));
        onCreate(name, grade);
        setName('');
        setCreating(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            {t('teacher.createClass', 'Создать класс')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('teacher.createClassDesc', 'Ученики смогут присоединиться по коду')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('teacher.className', 'Название класса')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('teacher.classNamePlaceholder', '7А класс - Кибербезопасность')}
                            required
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('teacher.grade', 'Класс/Курс')}
                        </label>
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-purple-400 text-foreground"
                        >
                            {[5, 6, 7, 8, 9, 10, 11].map(g => (
                                <option key={g} value={g.toString()}>{g} класс</option>
                            ))}
                        </select>
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
                            className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {t('teacher.create', 'Создать')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Class Card Component
const ClassCard: React.FC<{
    classroom: ClassRoom;
    onSelect: () => void;
    onDelete: () => void;
}> = ({ classroom, onSelect, onDelete }) => {
    const { t } = useTranslation();

    const avgScore = classroom.students.length > 0
        ? Math.round(classroom.students.reduce((sum, s) => sum + s.securityScore, 0) / classroom.students.length)
        : 0;

    const completionRate = classroom.students.length > 0
        ? Math.round(classroom.students.reduce((sum, s) => sum + (s.completedScenarios / s.totalScenarios), 0) / classroom.students.length * 100)
        : 0;

    const atRiskCount = classroom.students.filter(s => s.status === 'at-risk').length;

    return (
        <div className="cyber-card hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                        <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{classroom.name}</h3>
                        <p className="text-sm text-muted-foreground">{classroom.grade} класс</p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-muted-foreground hover:text-cyber-red transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Class Code */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('teacher.classCode', 'Код класса')}</span>
                <code className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg font-mono font-bold">
                    {classroom.code}
                </code>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-cyber-blue mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{classroom.students.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('teacher.students', 'Учеников')}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-cyber-green mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">{completionRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('teacher.completion', 'Прогресс')}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-cyber-yellow mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="font-bold">{avgScore}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('teacher.avgXP', 'Средний XP')}</p>
                </div>
            </div>

            {/* At-risk alert */}
            {atRiskCount > 0 && (
                <div className="mb-4 p-3 bg-cyber-red/10 rounded-lg border border-cyber-red/30 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyber-red" />
                    <span className="text-sm text-cyber-red">
                        {atRiskCount} {t('teacher.atRisk', 'ученик(а) требуют внимания')}
                    </span>
                </div>
            )}

            <button
                onClick={onSelect}
                className="w-full py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
            >
                <Eye className="w-4 h-4" />
                {t('teacher.viewClass', 'Открыть класс')}
            </button>
        </div>
    );
};

// Student Row Component
const StudentRow: React.FC<{
    student: Student;
    rank: number;
}> = ({ student, rank }) => {
    const { t } = useTranslation();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-cyber-green/10 text-cyber-green border-cyber-green/30';
            case 'inactive': return 'bg-muted text-muted-foreground border-muted';
            case 'at-risk': return 'bg-cyber-red/10 text-cyber-red border-cyber-red/30';
            default: return 'bg-muted text-muted-foreground border-muted';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return t('teacher.status.active', 'Активен');
            case 'inactive': return t('teacher.status.inactive', 'Неактивен');
            case 'at-risk': return t('teacher.status.atRisk', 'Требует внимания');
            default: return status;
        }
    };

    const progressPercent = Math.round((student.completedScenarios / student.totalScenarios) * 100);

    return (
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-purple-500/30 transition-all">
            {/* Rank */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${rank === 1 ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                    rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                        'bg-muted text-muted-foreground'
                }`}>
                {rank}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl border border-purple-500/30">
                    {student.avatar}
                </div>
                <div>
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
            </div>

            {/* XP */}
            <div className="text-center w-20">
                <p className="font-bold text-cyber-green">{student.securityScore}</p>
                <p className="text-xs text-muted-foreground">XP</p>
            </div>

            {/* Progress */}
            <div className="w-32">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{student.completedScenarios}/{student.totalScenarios}</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 w-16 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{student.streak}</span>
            </div>

            {/* Status */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                {getStatusText(student.status)}
            </div>
        </div>
    );
};

// Class Detail View
const ClassDetailView: React.FC<{
    classroom: ClassRoom;
    onBack: () => void;
}> = ({ classroom, onBack }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredStudents = useMemo(() => {
        return classroom.students
            .filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => b.securityScore - a.securityScore);
    }, [classroom.students, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const total = classroom.students.length;
        const active = classroom.students.filter(s => s.status === 'active').length;
        const atRisk = classroom.students.filter(s => s.status === 'at-risk').length;
        const avgScore = total > 0 ? Math.round(classroom.students.reduce((sum, s) => sum + s.securityScore, 0) / total) : 0;
        const avgProgress = total > 0 ? Math.round(classroom.students.reduce((sum, s) => sum + (s.completedScenarios / s.totalScenarios), 0) / total * 100) : 0;
        return { total, active, atRisk, avgScore, avgProgress };
    }, [classroom.students]);

    const handleExportReport = () => {
        const data = classroom.students.map(s => ({
            name: s.name,
            email: s.email,
            xp: s.securityScore,
            progress: `${s.completedScenarios}/${s.totalScenarios}`,
            streak: s.streak,
            status: s.status,
        }));

        const csv = [
            ['Имя', 'Email', 'XP', 'Прогресс', 'Серия', 'Статус'].join(','),
            ...data.map(d => Object.values(d).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${classroom.name}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180 text-muted-foreground" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{classroom.name}</h2>
                        <p className="text-muted-foreground">
                            {t('teacher.classCode', 'Код класса')}: <code className="text-purple-400 font-mono">{classroom.code}</code>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleExportReport}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-all"
                >
                    <Download className="w-4 h-4" />
                    {t('teacher.exportReport', 'Экспорт отчёта')}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="cyber-card text-center">
                    <Users className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">{t('teacher.totalStudents', 'Всего учеников')}</p>
                </div>
                <div className="cyber-card text-center">
                    <CheckCircle className="w-6 h-6 text-cyber-green mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">{t('teacher.activeStudents', 'Активных')}</p>
                </div>
                <div className="cyber-card text-center">
                    <AlertTriangle className="w-6 h-6 text-cyber-red mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stats.atRisk}</p>
                    <p className="text-xs text-muted-foreground">{t('teacher.atRiskStudents', 'Требуют внимания')}</p>
                </div>
                <div className="cyber-card text-center">
                    <Shield className="w-6 h-6 text-cyber-yellow mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stats.avgScore}</p>
                    <p className="text-xs text-muted-foreground">{t('teacher.avgScore', 'Средний XP')}</p>
                </div>
                <div className="cyber-card text-center">
                    <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stats.avgProgress}%</p>
                    <p className="text-xs text-muted-foreground">{t('teacher.avgProgress', 'Средний прогресс')}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('teacher.searchStudents', 'Поиск учеников...')}
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-purple-400 text-foreground"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-purple-400 text-foreground"
                >
                    <option value="all">{t('teacher.allStatuses', 'Все статусы')}</option>
                    <option value="active">{t('teacher.status.active', 'Активен')}</option>
                    <option value="inactive">{t('teacher.status.inactive', 'Неактивен')}</option>
                    <option value="at-risk">{t('teacher.status.atRisk', 'Требует внимания')}</option>
                </select>
            </div>

            {/* Students List */}
            <div className="space-y-3">
                {filteredStudents.length === 0 ? (
                    <div className="cyber-card text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('teacher.noStudents', 'Ученики не найдены')}</p>
                    </div>
                ) : (
                    filteredStudents.map((student, index) => (
                        <StudentRow key={student.id} student={student} rank={index + 1} />
                    ))
                )}
            </div>
        </div>
    );
};

// Main Teacher Dashboard
export const TeacherDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);

    const [classes, setClasses] = useState<ClassRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Moved up

    useEffect(() => {
        if (user) {
            loadClasses();
        }
    }, [user]);

    const loadClasses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const fetchedClasses = await classroomService.getTeacherClassrooms(user.id);

            // Enrich with students
            const classesWithStudents = await Promise.all(fetchedClasses.map(async (cls) => {
                const students = await classroomService.getClassroomStudents(cls.id);
                // Map Firestore students to UI Student interface
                const mappedStudents: Student[] = students.map((s: any) => ({
                    id: s.id,
                    name: s.name || 'Unknown',
                    email: s.email || '',
                    avatar: s.avatar || '👤',
                    securityScore: s.securityScore || 0,
                    completedScenarios: s.completedScenarios || 0,
                    totalScenarios: s.totalScenarios || 12, // Default/Mock total
                    streak: s.streak || 0,
                    lastActive: s.updatedAt?.toDate ? s.updatedAt.toDate() : new Date(),
                    grade: cls.grade,
                    status: s.status || 'active'
                }));
                return { ...cls, students: mappedStudents };
            }));

            setClasses(classesWithStudents as ClassRoom[]);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (name: string, grade: string) => {
        if (!user) return;
        try {
            await classroomService.createClassroom(name, grade, user.id);
            await loadClasses(); // Reload to see new class
        } catch (error) {
            console.error("Failed to create class", error);
            alert("Ошибка при создании класса");
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить этот класс?")) return;
        try {
            await classroomService.deleteClassroom(id);
            await loadClasses();
        } catch (error) {
            console.error("Failed to delete class", error);
        }
    };

    // Total stats across all classes
    const totalStats = useMemo(() => {
        const allStudents = classes.flatMap(c => c.students);
        return {
            totalClasses: classes.length,
            totalStudents: allStudents.length,
            avgScore: allStudents.length > 0
                ? Math.round(allStudents.reduce((sum, s) => sum + s.securityScore, 0) / allStudents.length)
                : 0,
            atRisk: allStudents.filter(s => s.status === 'at-risk').length,
        };
    }, [classes]);



    // Feature Gate: BUSINESS only
    if (user && user.subscriptionTier !== 'BUSINESS') {
        return (
            <FeatureGate
                tier="BUSINESS"
                icon={<GraduationCap className="w-12 h-12 text-cyber-yellow opacity-50" />}
            />
        );
    }

    if (selectedClass) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-background">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <ClassDetailView
                            classroom={selectedClass}
                            onBack={() => setSelectedClass(null)}
                        />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 md:p-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div className="mb-4 md:mb-0">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm font-medium mb-4">
                                <GraduationCap className="w-4 h-4" />
                                {t('teacher.badge', 'Режим учителя')}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                {t('teacher.title', 'Панель учителя')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('teacher.subtitle', 'Управляйте классами и отслеживайте прогресс учеников')}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            {t('teacher.createClass', 'Создать класс')}
                        </button>
                    </div>

                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="cyber-card bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalStats.totalClasses}</p>
                                    <p className="text-sm text-muted-foreground">{t('teacher.classes', 'Классов')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="cyber-card bg-gradient-to-br from-cyber-blue/10 to-blue-500/5 border-cyber-blue/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-cyber-blue/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-cyber-blue" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalStats.totalStudents}</p>
                                    <p className="text-sm text-muted-foreground">{t('teacher.students', 'Учеников')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="cyber-card bg-gradient-to-br from-cyber-green/10 to-emerald-500/5 border-cyber-green/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-cyber-green" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalStats.avgScore}</p>
                                    <p className="text-sm text-muted-foreground">{t('teacher.avgXP', 'Средний XP')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="cyber-card bg-gradient-to-br from-cyber-red/10 to-red-500/5 border-cyber-red/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-cyber-red/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-cyber-red" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalStats.atRisk}</p>
                                    <p className="text-sm text-muted-foreground">{t('teacher.needAttention', 'Требуют внимания')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Classes Grid */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-400" />
                            {t('teacher.myClasses', 'Мои классы')}
                            <button
                                onClick={loadClasses}
                                className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Обновить"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </h2>
                        {loading && classes.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="cyber-card text-center py-12">
                                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {t('teacher.noClasses', 'У вас пока нет классов')}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {t('teacher.noClassesDesc', 'Создайте первый класс, чтобы начать отслеживать прогресс учеников')}
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    {t('teacher.createFirstClass', 'Создать первый класс')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map(classroom => (
                                    <ClassCard
                                        key={classroom.id}
                                        classroom={classroom}
                                        onSelect={() => setSelectedClass(classroom)}
                                        onDelete={() => handleDeleteClass(classroom.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Tips */}
                    <div className="cyber-card border-purple-500/30 bg-purple-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {t('teacher.tips.title', 'Советы для учителей')}
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('teacher.tips.tip1', 'Делитесь кодом класса с учениками для быстрого присоединения')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('teacher.tips.tip2', 'Регулярно проверяйте учеников со статусом "Требует внимания"')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {t('teacher.tips.tip3', 'Экспортируйте отчёты для родительских собраний')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Create Class Modal */}
            <CreateClassModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateClass}
            />
        </DashboardLayout>
    );
};

export default TeacherDashboard;
