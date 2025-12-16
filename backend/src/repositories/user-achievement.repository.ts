import prisma from '../config/database';
import { UserAchievement } from '@prisma/client';

export class UserAchievementRepository {
    async findByUserAndAchievement(
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

    async create(data: { userId: string; achievementId: string }): Promise<UserAchievement> {
        return prisma.userAchievement.create({
            data: {
                ...data,
                progress: 1,
                completed: true,
                completedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.userAchievement.delete({
            where: { id },
        });
    }
}

export const userAchievementRepository = new UserAchievementRepository();
