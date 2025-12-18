import { Router, Response } from 'express';
import { achievementService } from '../services/achievement.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get all achievements
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const achievements = await achievementService.getAllAchievements();
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

        const achievements = await achievementService.getUserAchievements(req.user.userId);
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

        const achievements = await achievementService.checkAndAwardAchievements(
            req.user.userId
        );
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
