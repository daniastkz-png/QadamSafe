const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.patch('/language', authMiddleware, authController.updateLanguage);
router.post('/welcome-seen', authMiddleware, authController.markWelcomeSeen);

module.exports = router;
