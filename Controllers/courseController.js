const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");

exports.createCourse = async (req, res) => {
  const { title, description, thumbnail, price, instructorId } = req.body;
  try {
    const course = await prisma.course.create({
      data: { title, description, thumbnail, price, instructorId },
    });
    res.status(StatusCodes.CREATED).json(course);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { instructor: true },
    });
    res.json(courses);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.update({
      where: { id },
      data: req.body,
    });
    res.json(course);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course.delete({
      where: { id },
    });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
