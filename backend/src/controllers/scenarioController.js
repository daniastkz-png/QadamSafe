const { db } = require("../config/firebase");

const getScenarios = async (req, res) => {
    try {
        const snapshot = await db.collection("scenarios").orderBy("order").get();
        const scenarios = snapshot.docs.map((doc) => doc.data());

        // Get user progress
        const progressSnap = await db.collection("progress")
            .where("userId", "==", req.user.userId)
            .get();
        const progress = progressSnap.docs.map((doc) => doc.data());

        const scenariosWithProgress = scenarios.map((scenario) => {
            const userProgress = progress.find((p) => p.scenarioId === scenario.id);
            return { ...scenario, userProgress: userProgress || null };
        });

        res.status(200).json(scenariosWithProgress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getScenarioById = async (req, res) => {
    try {
        const doc = await db.collection("scenarios").doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Scenario not found" });
        }
        res.status(200).json(doc.data());
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const completeScenario = async (req, res) => {
    try {
        const { score, mistakes, decisions } = req.body;
        const scenarioId = req.params.id;
        const userId = req.user.userId;

        // Check if progress exists
        const progressSnap = await db.collection("progress")
            .where("userId", "==", userId)
            .where("scenarioId", "==", scenarioId)
            .limit(1)
            .get();

        const now = new Date();

        if (!progressSnap.empty) {
            // Update existing
            const docId = progressSnap.docs[0].id;
            await db.collection("progress").doc(docId).update({
                score,
                mistakes,
                decisions,
                completed: true,
                completedAt: now,
                updatedAt: now,
            });
        } else {
            // Create new
            const progressId = db.collection("progress").doc().id;
            await db.collection("progress").doc(progressId).set({
                id: progressId,
                userId,
                scenarioId,
                score,
                mistakes,
                decisions,
                completed: true,
                completedAt: now,
                createdAt: now,
                updatedAt: now,
            });
        }

        // Update user security score
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        await db.collection("users").doc(userId).update({
            securityScore: (userData.securityScore || 0) + score,
            updatedAt: now,
        });

        res.status(200).json({ success: true, score, mistakes });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getScenarios,
    getScenarioById,
    completeScenario
};
