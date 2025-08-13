const express = require("express");
const router = express.Router();
const { register, login, getAllUsers, getSingleUser, updateUserProfile, deleteUser } = require("../Controllers/authController");
const { registerSchema, loginSchema } = require("../Utils/joi.schema");
const { validate } = require("../Utils/joi.validator");
const validateToken = require("../Middleware/validateToken")

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/", getAllUsers);
router.get("/user/:id", getSingleUser);
router.put("/user/:id", validateToken, updateUserProfile);
router.delete("/user/:id", validateToken, deleteUser);


module.exports = router;