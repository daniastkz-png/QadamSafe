import { scenarioRepository } from '../repositories/scenario.repository';
import { progressRepository } from '../repositories/progress.repository';
import { userRepository } from '../repositories/user.repository';
import { Scenario, SubscriptionTier } from '@prisma/client';
import { rankService } from './rank.service';

export class ScenarioService {
    async getAllScenarios(userId: string): Promise<Scenario[]> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get all scenarios based on user's subscription tier, ordered by order field
        const allScenarios = await scenarioRepository.findByTier(user.subscriptionTier);

        // Sort scenarios by order to ensure sequential processing
        const sortedScenarios = allScenarios.sort((a, b) => a.order - b.order);

        // Get user's progress for all scenarios
        const userProgress = await progressRepository.findByUserId(userId);

        // Map scenarios with unlock status
        const scenariosWithStatus = sortedScenarios.map(scenario => {
            // Level 1 (order 0) is ALWAYS unlocked - never blocked
            if (scenario.order === 0) {
                return { ...scenario, isUnlocked: true };
            }

            // For levels 2+ (order >= 1), check if previous level was completed without errors
            const previousScenario = sortedScenarios.find(s => s.order === scenario.order - 1);

            if (!previousScenario) {
                // If no previous scenario exists, lock this one
                return { ...scenario, isUnlocked: false };
            }

            // Check if previous scenario was completed without errors (level_passed_clean)
            const previousProgress = userProgress.find(p => p.scenarioId === previousScenario.id);

            // Unlock only if previous level was completed AND had zero mistakes
            const isUnlocked = previousProgress?.completed === true && previousProgress?.mistakes === 0;

            return { ...scenario, isUnlocked };
        });

        return scenariosWithStatus as any;
    }

    async getScenarioById(scenarioId: string, userId: string): Promise<Scenario> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const scenario = await scenarioRepository.findById(scenarioId);
        if (!scenario) {
            throw new Error('Scenario not found');
        }

        // Check if user has access based on subscription tier
        if (!this.hasAccess(user.subscriptionTier, scenario.requiredTier)) {
            throw new Error('Upgrade your subscription to access this scenario');
        }

        return scenario;
    }

    async completeScenario(
        scenarioId: string,
        userId: string,
        data: {
            score: number;
            mistakes: number;
            decisions: any[];
        }
    ): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const scenario = await scenarioRepository.findById(scenarioId);
        if (!scenario) {
            throw new Error('Scenario not found');
        }

        // Check if progress exists
        const existingProgress = await progressRepository.findByUserAndScenario(userId, scenarioId);

        if (existingProgress) {
            // Update existing progress
            await progressRepository.update(existingProgress.id, {
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
                completed: true,
            });
        } else {
            // Create new progress
            await progressRepository.create({
                userId,
                scenarioId,
                score: data.score,
                mistakes: data.mistakes,
                decisions: data.decisions,
            });
            // Mark as completed
            const newProgress = await progressRepository.findByUserAndScenario(userId, scenarioId);
            if (newProgress) {
                await progressRepository.update(newProgress.id, { completed: true });
            }
        }

        // Update user's security score
        const newSecurityScore = user.securityScore + scenario.pointsReward;
        await userRepository.update(userId, { securityScore: newSecurityScore });

        // Calculate and update user's rank based on completion history
        await rankService.calculateAndUpdateRank(userId);
    }

    private hasAccess(
        userTier: SubscriptionTier,
        requiredTier: SubscriptionTier
    ): boolean {
        const tierHierarchy = {
            [SubscriptionTier.FREE]: 0,
            [SubscriptionTier.PRO]: 1,
            [SubscriptionTier.BUSINESS]: 2,
        };

        return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
    }
}

export const scenarioService = new ScenarioService();
