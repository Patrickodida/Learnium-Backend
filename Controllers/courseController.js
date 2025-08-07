const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");

// Create a course
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

// Retrieve all courses
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

// Update course
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

// Delete course
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

// Retrieve single course details
exports.getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: true,
        instructor: true,
      },
    });
    if (!course) return res.status(StatusCodes.NOT_FOUND).json({ error: "Course not found."});
    res.status(StatusCodes.OK).json(course);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
