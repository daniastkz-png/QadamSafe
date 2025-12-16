import prisma from '../config/database';
import { Achievement, UserAchievement } from '@prisma/client';

export class AchievementRepository {
    async findAll(): Promise<Achievement[]> {
        return prisma.achievement.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }

    async findByKey(key: string): Promise<Achievement | null> {
        return prisma.achievement.findUnique({
            where: { key },
        });
    }

    async findUserAchievements(userId: string) {
        return prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findUserAchievement(
        userId: string,
        achievementId: string
    ): Promise<UserAchievement | null> {
        return prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                },
            },
        });
    }

    async createUserAchievement(
        userId: string,
        achievementId: string
    ): Promise<UserAchievement> {
        return prisma.userAchievement.create({
            data: {
                userId,
                achievementId,
                progress: 0,
                completed: false,
            },
        });
    }

    async updateProgress(
        id: string,
        progress: number,
        requiredValue: number
    ): Promise<UserAchievement> {
        const completed = progress >= requiredValue;

        return prisma.userAchievement.update({
            where: { id },
            data: {
                progress,
                completed,
                ...(completed && !await this.isCompleted(id) && { completedAt: new Date() }),
            },
        });
    }

    private async isCompleted(id: string): Promise<boolean> {
        const achievement = await prisma.userAchievement.findUnique({
            where: { id },
        });
        return achievement?.completed || false;
    }

    async create(data: Partial<Achievement>): Promise<Achievement> {
        return prisma.achievement.create({
            data: data as any,
        });
    }
}

export const achievementRepository = new AchievementRepository();
