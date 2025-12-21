import { Router, Request, Response } from 'express';
import { firestoreAuthService } from '../services/firestore/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { firestoreUserRepository } from '../repositories/firestore/user.repository';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, language } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const result = await firestoreAuthService.register({ email, password, name, language });
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const result = await firestoreAuthService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: (error as Error).message });
    }
});

// Get current user (protected)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await firestoreAuthService.getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update language (protected)
router.patch('/language', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { language } = req.body;
        if (!language) {
            res.status(400).json({ error: 'Language is required' });
            return;
        }

        const user = await firestoreUserRepository.update(req.user.userId, { language });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Mark welcome as seen (protected)
router.post('/welcome-seen', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await firestoreUserRepository.update(req.user.userId, { hasSeenWelcome: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
