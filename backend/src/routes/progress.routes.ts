import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { firestoreProgressRepository } from '../repositories/firestore/progress.repository';
import { firestoreScenarioRepository } from '../repositories/firestore/scenario.repository';

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

        const progress = await firestoreProgressRepository.findByUserId(req.user.userId);

        // Add scenario details to each progress
        const scenarios = await firestoreScenarioRepository.findAll();
        const scenarioMap = new Map(scenarios.map((s: any) => [s.id, s]));

        const progressWithScenarios = progress.map((p: any) => ({
            ...p,
            scenario: scenarioMap.get(p.scenarioId) || null,
        }));

        res.status(200).json(progressWithScenarios);
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

        const stats = await firestoreProgressRepository.getStats(req.user.userId);
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
        const progress = await firestoreProgressRepository.findByUserAndScenario(
            req.user.userId,
            scenarioId
        );
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
