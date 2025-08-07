const express = require('express')
const router = express.Router()
const { enrollUser, getUserEnrollments, } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);
router.get('/:userId', validateToken, getUserEnrollments);

module.exports = router;