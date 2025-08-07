const express = require('express')
const router = express.Router()
const { createLesson } = require('../Controllers/lessonController')
const validateToken = require('../Middleware/validateToken')

// Create a Lesson / Instructor Only
router.post('/', validateToken, createLesson);

module.exports = router;