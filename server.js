const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./Routes/authRoutes')
const courseRoutes = require('./Routes/courseRoutes')

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

module.exports = app;