const express = require('express')
const router = express.Router()
const { enrollUser, getUserEnrollments, getEnrollment, markLessonCompleted, unenrollUser, getCourseEnrollments, getCompletedLessons } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);
// Retrieve all students enrolled
router.get('/course/:courseId', validateToken, getCourseEnrollments);
// Retrieve user enrollment
router.get('/:userId', validateToken, getUserEnrollments);
// Retrieve a single user enrollment
router.get('/:userId/:courseId', validateToken, getEnrollment);
// Retrieve completed lessons for a user in a course
router.get('/:userId/:courseId/completed', validateToken, getCompletedLessons);
// Update/mark lesson as complete
router.put('/:userId/:courseId/complete', validateToken, markLessonCompleted);
// Delete a user from a course
router.delete('/:userId/:courseId', validateToken, unenrollUser);

module.exports = router;