const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");

// Create a course
exports.createCourse = async (req, res) => {
  console.log("REQ.USER:", req.user);
  console.log("REQ.BODY:", req.body);
  const { title, description, thumbnail, price } = req.body;
  const instructorId = req.user.id;
  if (!instructorId) return res.status(401).json({ error: "Instructor not authenticated" });
  try {
    const course = await prisma.course.create({
      data: { title, description, thumbnail, price, instructorId, published: false },
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

// Retrieve courses for a specific instructor 
exports.getCoursesByInstructor = async (req, res) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID missing from token" });
    }

    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: { instructor: true, lessons: true },
    });
    console.log("Instructor ID:", instructorId);
    console.log("Courses found:", courses.length);
    
    res.status(StatusCodes.OK).json(courses);
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

// Publish/Unpublish course(Allow Instructors to publish/unpublish course)
exports.toggleCoursePublish = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch current status
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(StatusCodes.NOT_FOUND).json({ error: "Course not found." });

    // Toggle published status
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { published: !course.published },
    });

    res.json(updatedCourse);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
