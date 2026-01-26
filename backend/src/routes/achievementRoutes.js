const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, achievementController.getAchievements);
router.get('/user', authMiddleware, achievementController.getUserAchievements);

module.exports = router;
