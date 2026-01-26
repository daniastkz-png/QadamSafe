const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const firebaseAuthMiddleware = require('../middleware/firebaseAuthMiddleware');

router.post('/generate-scenario', firebaseAuthMiddleware, aiController.generateScenario);
router.get('/scenarios', firebaseAuthMiddleware, aiController.getGeneratedScenarios);
router.get('/topics', firebaseAuthMiddleware, aiController.getTopics);
router.post('/chat', firebaseAuthMiddleware, aiController.chat);

module.exports = router;
