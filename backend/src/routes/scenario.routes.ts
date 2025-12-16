import { Router, Response } from 'express';
import { scenarioService } from '../services/scenario.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get all scenarios
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const scenarios = await scenarioService.getAllScenarios(req.user.userId);
        res.status(200).json(scenarios);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get scenario by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const scenario = await scenarioService.getScenarioById(id, req.user.userId);
        res.status(200).json(scenario);
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
});

// Complete scenario
router.post('/:id/complete', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const { score, mistakes, decisions } = req.body;

        if (score === undefined || mistakes === undefined) {
            res.status(400).json({ error: 'Score and mistakes are required' });
            return;
        }

        const progress = await scenarioService.completeScenario(id, req.user.userId, {
            score,
            mistakes,
            decisions,
        });

        res.status(200).json(progress);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;
