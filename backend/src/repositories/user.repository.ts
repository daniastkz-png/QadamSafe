import prisma from '../config/database';
import { User, SubscriptionTier } from '@prisma/client';

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: {
        email: string;
        password: string;
        name?: string;
        language?: string;
    }): Promise<User> {
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                language: data.language || 'ru',
                subscriptionTier: SubscriptionTier.FREE,
                securityScore: 0,
                hasSeenWelcome: false,
            },
        });
    }

    async updateLanguage(userId: string, language: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { language },
        });
    }

    async updateSecurityScore(userId: string, score: number): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { securityScore: score },
        });
    }

    async markWelcomeSeen(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { hasSeenWelcome: true },
        });
    }

    async updateSubscription(
        userId: string,
        tier: SubscriptionTier
    ): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: tier },
        });
    }

    async update(userId: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data,
        });
    }
}

export const userRepository = new UserRepository();
