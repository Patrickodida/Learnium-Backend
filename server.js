const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./Routes/authRoutes')
const courseRoutes = require('./Routes/courseRoutes')
const lessonRoutes = require('./Routes/lessonRoutes')
const enrollmentRoutes = require('./Routes/enrollmentRoutes')
const paymentRoutes = require("./Routes/paymentRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`<html>
      <body style="background-color: #f5f5f5; text-align: center; padding-top: 50px;">
        <h1 style="color: blue;">Learnium API is running!</h1>
      </body>
    </html>`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;