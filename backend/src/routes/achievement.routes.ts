import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { firestoreAchievementRepository } from '../repositories/firestore/achievement.repository';
import { firestoreProgressRepository } from '../repositories/firestore/progress.repository';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get all achievements
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const achievements = await firestoreAchievementRepository.findAllAchievements();
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get user achievements
router.get('/user', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const achievements = await firestoreAchievementRepository.findUserAchievements(req.user.userId);
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Check and award achievements
router.post('/check', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const stats = await firestoreProgressRepository.getStats(req.user.userId);

        // Check and update achievements based on stats
        const allAchievements = await firestoreAchievementRepository.findAllAchievements();

        for (const achievement of allAchievements) {
            let progress = 0;

            switch (achievement.key) {
                case 'first_scenario':
                case 'five_scenarios':
                case 'all_scenarios':
                    progress = stats.completed;
                    break;
                case 'security_expert':
                    progress = stats.totalScore;
                    break;
            }

            if (progress > 0) {
                await firestoreAchievementRepository.upsertUserAchievement(
                    req.user.userId,
                    achievement.id,
                    progress
                );
            }
        }

        const achievements = await firestoreAchievementRepository.findUserAchievements(req.user.userId);
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
