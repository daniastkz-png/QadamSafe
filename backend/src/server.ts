import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import { initializeFirebase } from './config/firebase.config';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import scenarioRoutes from './routes/scenario.routes';
import progressRoutes from './routes/progress.routes';
import achievementRoutes from './routes/achievement.routes';

// Initialize Firebase Admin SDK (optional - gracefully skips if not configured)
initializeFirebase();

const app: Application = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 QadamSafe Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔒 CORS enabled for: ${config.corsOrigin}`);
});

export default app;
