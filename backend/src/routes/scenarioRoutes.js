const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, scenarioController.getScenarios);
router.get('/:id', authMiddleware, scenarioController.getScenarioById);
router.post('/:id/complete', authMiddleware, scenarioController.completeScenario);

module.exports = router;
