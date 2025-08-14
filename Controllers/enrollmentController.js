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

// Get single enrollment
exports.getEnrollment = async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Enrollment not found.' });
        res.json(enrollment);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

// Mark lesson as completed
exports.markLessonCompleted = async (req, res) => {
    const { userId, courseId } = req.params;
    const { lessonId } = req.body;

    try {
        const updated = await prisma.enrollment.update({
            where: { userId_courseId: { userId, courseId } },
            data: {
                completedLessons: {
                    push: lessonId
                }
            } 
        });
        res.json(updated);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

// Get completed lessons for a user in a course
exports.getCompletedLessons = async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            select: { completedLessons: true }
        });
        if (!enrollment) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Enrollment not found." });
        }
        res.json({ completedLessonIds: enrollment.completedLessons });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

// Delete/ Unenroll a user/student from a course
exports.unenrollUser = async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        await prisma.enrollment.delete({
            where: { userId_courseId: { userId, courseId }},
        });
        res.json({ message: "User/student unenrolled successfully."});
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

// Retrieve all users/students enrolled in course
exports.getCourseEnrollments = async (req, res) => {
    const { courseId } = req.params;

    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                }
            }
        });
        res.json(enrollments);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};




