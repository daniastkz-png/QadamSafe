import prisma from '../config/database';
import { UserProgress } from '@prisma/client';

export class ProgressRepository {
    async findByUserId(userId: string): Promise<UserProgress[]> {
        return prisma.userProgress.findMany({
            where: { userId },
            include: { scenario: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUserAndScenario(
        userId: string,
        scenarioId: string
    ): Promise<UserProgress | null> {
        return prisma.userProgress.findUnique({
            where: {
                userId_scenarioId: {
                    userId,
                    scenarioId,
                },
            },
            include: { scenario: true },
        });
    }

    async create(data: {
        userId: string;
        scenarioId: string;
        score?: number;
        mistakes?: number;
        decisions?: any;
    }): Promise<UserProgress> {
        return prisma.userProgress.create({
            data: {
                userId: data.userId,
                scenarioId: data.scenarioId,
                score: data.score || 0,
                mistakes: data.mistakes || 0,
                decisions: data.decisions,
                completed: false,
            },
        });
    }

    async update(
        id: string,
        data: {
            score?: number;
            mistakes?: number;
            decisions?: any;
            completed?: boolean;
        }
    ): Promise<UserProgress> {
        return prisma.userProgress.update({
            where: { id },
            data: {
                ...data,
                ...(data.completed && { completedAt: new Date() }),
            },
        });
    }

    async getStats(userId: string) {
        const progress = await prisma.userProgress.findMany({
            where: { userId },
        });

        const completed = progress.filter((p) => p.completed).length;
        const total = progress.length;
        const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
        const totalMistakes = progress.reduce((sum, p) => sum + p.mistakes, 0);

        return {
            completed,
            total,
            totalScore,
            totalMistakes,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
    }
}

export const progressRepository = new ProgressRepository();
