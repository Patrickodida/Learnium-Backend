const express = require("express");
const router = express.Router();
const { register, login, getAllUsers } = require("../Controllers/authController");
const { registerSchema, loginSchema } = require("../Utils/joi.schema");
const { validate } = require("../Utils/joi.validator");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/", getAllUsers);

module.exports = router;