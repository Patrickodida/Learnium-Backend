const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");

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
};

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

// Get a single lesson
exports.getLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });
    if (!lesson)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Lesson not found." });
    res.json(lesson);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: req.body,
    });
    res.json(lesson);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.lesson.delete({
            where: { id },
        });
        res.json({ message: 'Lesson deleted successfully.'});
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};