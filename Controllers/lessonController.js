const prisma = require('../Models/prismaClient')
const { StatusCodes } = require('http-status-codes')

// Create a new lesson
exports.createLesson = async (req, res) => {
    const { title, videoUrl, courseId } = req.body;

    try {
        const lesson = await prisma.lesson.create({
            data: { title, videoUrl, courseId },
        });
        res.status(StatusCodes.CREATED).json(lesson);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
}

// Get all lessons for a specific course 
exports.getLessonsByCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const lessons = await prisma.lesson.findMany({
            where: { courseId },
        });
        res.json(lessons);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

