const express = require('express')
const router = express.Router()
const { createCourse, getAllCourses, updateCourse, deleteCourse, getCourseById } = require('../Controllers/courseController')
const validateToken = require('../Middleware/validateToken')

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', validateToken, createCourse);
router.put('/:id', validateToken, updateCourse);
router.delete('/:id', validateToken, deleteCourse);

module.exports = router;