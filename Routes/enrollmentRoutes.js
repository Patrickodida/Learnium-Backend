const express = require('express')
const router = express.Router()
const { enrollUser, getUserEnrollments, getEnrollment, markLessonCompleted, unenrollUser, getCourseEnrollments } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);
router.get('/course/:courseId', validateToken, getCourseEnrollments);
router.get('/:userId', validateToken, getUserEnrollments);
router.get('/:userId/:courseId', validateToken, getEnrollment);
router.put('/:userId/:courseId/complete', validateToken, markLessonCompleted);
router.delete('/:userId/:courseId', validateToken, unenrollUser);

module.exports = router;