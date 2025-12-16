import { achievementRepository } from '../repositories/achievement.repository';
import { progressRepository } from '../repositories/progress.repository';

export class AchievementService {
    async getAllAchievements() {
        return achievementRepository.findAll();
    }

    async getUserAchievements(userId: string) {
        return achievementRepository.findUserAchievements(userId);
    }

    async checkAndAwardAchievements(userId: string) {
        const achievements = await achievementRepository.findAll();
        const stats = await progressRepository.getStats(userId);

        for (const achievement of achievements) {
            let progress = 0;

            // Calculate progress based on achievement key
            switch (achievement.key) {
                case 'first_scenario':
                    progress = stats.completed >= 1 ? 1 : 0;
                    break;
                case 'five_scenarios':
                    progress = Math.min(stats.completed, 5);
                    break;
                case 'ten_scenarios':
                    progress = Math.min(stats.completed, 10);
                    break;
                case 'perfect_score':
                    const allProgress = await progressRepository.findByUserId(userId);
                    const perfectScenarios = allProgress.filter(
                        (p) => p.completed && p.mistakes === 0
                    );
                    progress = perfectScenarios.length >= 1 ? 1 : 0;
                    break;
                case 'security_expert':
                    progress = stats.totalScore >= 1000 ? 1 : Math.floor(stats.totalScore / 100);
                    break;
                default:
                    continue;
            }

            // Find or create user achievement
            let userAchievement = await achievementRepository.findUserAchievement(
                userId,
                achievement.id
            );

            if (!userAchievement) {
                userAchievement = await achievementRepository.createUserAchievement(
                    userId,
                    achievement.id
                );
            }

            // Update progress if changed
            if (userAchievement.progress !== progress) {
                await achievementRepository.updateProgress(
                    userAchievement.id,
                    progress,
                    achievement.requiredValue
                );
            }
        }

        return this.getUserAchievements(userId);
    }
}

export const achievementService = new AchievementService();
