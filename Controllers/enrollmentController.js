const prisma = require('../Models/prismaClient')
const { StatusCodes } = require('http-status-codes')

// Enroll user in a course
exports.enrollUser = async (req, res) => {
    const { userId, courseId } = req.body;

    try {
        const enrollment = await prisma.enrollment.create({
            data: { userId, courseId, completedLessons: [] },
        });
        res.status(StatusCodes.CREATED).json(enrollment);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

// Get all enrollments for a user/ student
exports.getUserEnrollments = async (req, res) => {
    const { userId } = req.params;

    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: { course: true },
        });
        res.json(enrollments);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

