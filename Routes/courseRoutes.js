const express = require('express')
const router = express.Router()
const { createCourse, getAllCourses, updateCourse, deleteCourse, getCourseById, toggleCoursePublish } = require('../Controllers/courseController')
const validateToken = require('../Middleware/validateToken')
const { isAuthenticated, hasRole } = require('../Middleware/auth');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', validateToken,isAuthenticated, hasRole('INSTRUCTOR', 'ADMIN'), createCourse);
router.put('/:id', validateToken, isAuthenticated, hasRole('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', validateToken, isAuthenticated, hasRole('INSTRUCTOR', 'ADMIN'), deleteCourse);
router.patch('/:id/publish', validateToken, isAuthenticated, hasRole('INSTRUCTOR', 'ADMIN'), toggleCoursePublish);

module.exports = router;