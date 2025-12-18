import { progressRepository } from '../repositories/progress.repository';
import { userRepository } from '../repositories/user.repository';

export class RankService {
    /**
     * Calculate and update user's rank based on scenario completion
     * Rank 1: Default (all new users)
     * Rank 2: After 3+ scenarios without dangerous decisions (mistakes >= 2)
     * Rank 3: After 5+ scenarios with 70%+ safe completions
     * Rank 4: All 7 scenarios completed with 0 mistakes each (Perfect)
     */
    async calculateAndUpdateRank(userId: string): Promise<number> {
        // Get all completed scenarios
        const allProgress = await progressRepository.findByUserId(userId);
        const completedScenarios = allProgress.filter(p => p.completed);

        if (completedScenarios.length === 0) {
            return 1; // Default rank for new users
        }

        // Check for Rank 4: All 7 scenarios completed with 0 mistakes each
        const perfectScenariosCount = completedScenarios.filter(p => p.mistakes === 0).length;
        if (completedScenarios.length >= 7 && perfectScenariosCount >= 7) {
            await userRepository.update(userId, { rank: 4 });
            return 4;
        }

        // Count scenarios without dangerous decisions
        // Heuristic: mistakes >= 2 indicates dangerous decision
        const safeScenariosCount = completedScenarios.filter(p => p.mistakes < 2).length;
        const totalCompleted = completedScenarios.length;
        const safePercentage = safeScenariosCount / totalCompleted;

        let newRank = 1;

        // Rank 3: 5+ scenarios with 70%+ safe
        if (totalCompleted >= 5 && safePercentage >= 0.7) {
            newRank = 3;
        }
        // Rank 2: 3+ scenarios without dangerous decisions
        else if (safeScenariosCount >= 3) {
            newRank = 2;
        }
        // Rank 1: Default
        else {
            newRank = 1;
        }

        // Update user's rank
        await userRepository.update(userId, { rank: newRank });

        return newRank;
    }

    /**
     * Get user's current rank
     */
    async getUserRank(userId: string): Promise<number> {
        const user = await userRepository.findById(userId);
        return user?.rank || 1;
    }
}

export const rankService = new RankService();
