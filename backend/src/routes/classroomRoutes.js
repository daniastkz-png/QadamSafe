const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/join', authMiddleware, classroomController.joinClassroom);

module.exports = router;
