const { db } = require("../config/firebase");

const getProgress = async (req, res) => {
    try {
        const snapshot = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .get();
        const progress = snapshot.docs.map((doc) => doc.data());
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProgressStats = async (req, res) => {
    try {
        const progressSnap = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .where("completed", "==", true)
            .get();

        const scenariosSnap = await db.collection("scenarios").get();
        const total = scenariosSnap.size;

        const progress = progressSnap.docs.map((doc) => doc.data());
        const completed = progress.length;
        const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
        const totalMistakes = progress.reduce((sum, p) => sum + (p.mistakes || 0), 0);
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.status(200).json({ completed, total, totalScore, totalMistakes, completionRate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getProgress,
    getProgressStats
};
