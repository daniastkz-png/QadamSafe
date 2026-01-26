require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initialize Firebase (side effect: connects db)
require('./src/config/firebase');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const scenarioRoutes = require('./src/routes/scenarioRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const classroomRoutes = require('./src/routes/classroomRoutes');

const app = express();

const allowedOrigins = [
    "https://qadamsafe.web.app",
    "https://qadamsafe.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all for now
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/classrooms', classroomRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "QadamSafe API",
        version: "2.0.0"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "QadamSafe API is running",
        docs: "/health for health check",
        version: "2.0.0"
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 QadamSafe API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
