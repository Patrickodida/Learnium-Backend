const express = require('express')
const router = express.Router()
const { enrollUser, getUserEnrollments, getEnrollment, markLessonCompleted, unenrollUser, getCourseEnrollments } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);
// Retrieve all students enrolled
router.get('/course/:courseId', validateToken, getCourseEnrollments);
// Retrieve user enrollment
router.get('/:userId', validateToken, getUserEnrollments);
// Retrieve a single user enrollment
router.get('/:userId/:courseId', validateToken, getEnrollment);
// Update/mark lesson as complete
router.put('/:userId/:courseId/complete', validateToken, markLessonCompleted);
// Delete a user from a course
router.delete('/:userId/:courseId', validateToken, unenrollUser);

module.exports = router;