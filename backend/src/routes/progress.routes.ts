import { Router, Response } from 'express';
import { progressService } from '../services/progress.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get user progress
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const progress = await progressService.getUserProgress(req.user.userId);
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get user statistics
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const stats = await progressService.getUserStats(req.user.userId);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get progress for specific scenario
router.get('/scenario/:scenarioId', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { scenarioId } = req.params;
        const progress = await progressService.getScenarioProgress(
            req.user.userId,
            scenarioId
        );
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
