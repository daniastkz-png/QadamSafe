import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { firestoreScenarioRepository, FirestoreScenario } from '../repositories/firestore/scenario.repository';
import { firestoreProgressRepository } from '../repositories/firestore/progress.repository';
import { firestoreUserRepository } from '../repositories/firestore/user.repository';
import { firestoreAchievementRepository } from '../repositories/firestore/achievement.repository';

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

        const scenarios = await firestoreScenarioRepository.findAll();
        const progress = await firestoreProgressRepository.findByUserId(req.user.userId);

        // Add user progress to each scenario
        const scenariosWithProgress = scenarios.map((scenario: FirestoreScenario) => {
            const userProgress = progress.find((p: any) => p.scenarioId === scenario.id);
            return {
                ...scenario,
                userProgress: userProgress || null,
            };
        });

        res.status(200).json(scenariosWithProgress);
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
        const scenario = await firestoreScenarioRepository.findById(id);

        if (!scenario) {
            res.status(404).json({ error: 'Scenario not found' });
            return;
        }

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

        // Save progress
        const progress = await firestoreProgressRepository.upsert(req.user.userId, id, {
            score,
            mistakes,
            decisions,
        });

        // Update user security score
        await firestoreUserRepository.updateSecurityScore(req.user.userId, score);

        // Update achievements
        const stats = await firestoreProgressRepository.getStats(req.user.userId);

        // First scenario achievement
        if (stats.completed >= 1) {
            const achievement = await firestoreAchievementRepository.findAchievementByKey('first_scenario');
            if (achievement) {
                await firestoreAchievementRepository.upsertUserAchievement(req.user.userId, achievement.id, 1);
            }
        }

        // Five scenarios achievement
        if (stats.completed >= 5) {
            const achievement = await firestoreAchievementRepository.findAchievementByKey('five_scenarios');
            if (achievement) {
                await firestoreAchievementRepository.upsertUserAchievement(req.user.userId, achievement.id, stats.completed);
            }
        }

        // All scenarios achievement
        if (stats.completed >= 7) {
            const achievement = await firestoreAchievementRepository.findAchievementByKey('all_scenarios');
            if (achievement) {
                await firestoreAchievementRepository.upsertUserAchievement(req.user.userId, achievement.id, stats.completed);
            }
        }

        // Perfect score achievement
        if (mistakes === 0) {
            const achievement = await firestoreAchievementRepository.findAchievementByKey('perfect_score');
            if (achievement) {
                await firestoreAchievementRepository.upsertUserAchievement(req.user.userId, achievement.id, 1);
            }
        }

        // Security expert achievement
        if (stats.totalScore >= 500) {
            const achievement = await firestoreAchievementRepository.findAchievementByKey('security_expert');
            if (achievement) {
                await firestoreAchievementRepository.upsertUserAchievement(req.user.userId, achievement.id, stats.totalScore);
            }
        }

        res.status(200).json(progress);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;
