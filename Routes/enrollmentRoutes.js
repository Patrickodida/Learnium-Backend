const express = require('express')
const router = express.Router()
const { enrollUser, getUserEnrollments, getEnrollment, } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);
router.get('/:userId', validateToken, getUserEnrollments);
router.get('/:userId/:courseId', validateToken, getEnrollment);

module.exports = router;