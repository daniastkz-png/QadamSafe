import { progressRepository } from '../repositories/progress.repository';

export class ProgressService {
    async getUserProgress(userId: string) {
        const progress = await progressRepository.findByUserId(userId);
        return progress;
    }

    async getUserStats(userId: string) {
        const stats = await progressRepository.getStats(userId);
        return stats;
    }

    async getScenarioProgress(userId: string, scenarioId: string) {
        const progress = await progressRepository.findByUserAndScenario(
            userId,
            scenarioId
        );
        return progress;
    }
}

export const progressService = new ProgressService();
