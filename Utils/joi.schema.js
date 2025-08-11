const Joi = require("joi");

exports.registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.createLessonSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  videoUrl: Joi.string().uri().required(),
  courseId: Joi.string().required(),
});

exports.initiatePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required(), // e.g. USD, GHS
  courseId: Joi.string().required(),
});