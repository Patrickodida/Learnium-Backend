const express = require('express')
const router = express.Router()
const { createLesson, getLessonsByCourse, getLesson, updateLesson } = require('../Controllers/lessonController')
const validateToken = require('../Middleware/validateToken')
const { validate } = require('../Utils/joi.validator')
const { createLessonSchema } = require('../Utils/joi.schema')

// Create a Lesson / Instructor Only
router.post('/', validate(createLessonSchema), validateToken, createLesson);
// Retrieve all courses by courseId
router.get('/course/:courseId', getLessonsByCourse);
// Retrieve a lesson
router.get('/:id', getLesson);
// Update Lesson
router.put('/:id', updateLesson);

module.exports = router;