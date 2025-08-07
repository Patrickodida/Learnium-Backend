const express = require('express')
const router = express.Router()
const { enrollUser, } = require('../Controllers/enrollmentController')
const validateToken = require('../Middleware/validateToken')

// Enroll User (Protected)
router.post('/', validateToken, enrollUser);

module.exports = router;