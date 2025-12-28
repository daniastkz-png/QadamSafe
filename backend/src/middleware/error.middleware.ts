import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Log error details
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Handle known AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            error: 'Validation error',
            details: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                error: 'Duplicate entry',
                details: 'This record already exists',
            });
            return;
        }
    }

    // Default error
    const statusCode = (res.statusCode !== 200 && res.statusCode !== undefined) ? res.statusCode : 500;
    
    res.status(statusCode).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            name: err.name 
        }),
    });
};
