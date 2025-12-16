import prisma from '../config/database';
import { Scenario, ScenarioDifficulty, SubscriptionTier } from '@prisma/client';

export class ScenarioRepository {
    async findAll(): Promise<Scenario[]> {
        return prisma.scenario.findMany({
            orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
        });
    }

    async findById(id: string): Promise<Scenario | null> {
        return prisma.scenario.findUnique({
            where: { id },
        });
    }

    async findByDifficulty(difficulty: ScenarioDifficulty): Promise<Scenario[]> {
        return prisma.scenario.findMany({
            where: { difficulty },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findByTier(tier: SubscriptionTier): Promise<Scenario[]> {
        return prisma.scenario.findMany({
            where: {
                OR: [
                    { requiredTier: SubscriptionTier.FREE },
                    ...(tier === SubscriptionTier.PRO || tier === SubscriptionTier.BUSINESS
                        ? [{ requiredTier: SubscriptionTier.PRO }]
                        : []),
                    ...(tier === SubscriptionTier.BUSINESS
                        ? [{ requiredTier: SubscriptionTier.BUSINESS }]
                        : []),
                ],
            },
            orderBy: { order: 'asc' },
        });
    }

    async create(data: Partial<Scenario>): Promise<Scenario> {
        return prisma.scenario.create({
            data: data as any,
        });
    }
}

export const scenarioRepository = new ScenarioRepository();
