import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types/auth.types';

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const adminMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
};
