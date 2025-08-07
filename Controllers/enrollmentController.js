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