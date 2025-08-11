const express = require("express");
const router = express.Router();
const validateToken = require("../Middleware/validateToken");
const {
  initiatePayment,
  verifyPaymentWebhook,
  getAllPayments,
  getPaymentById,
  deletePayment,
} = require("../Controllers/paymentController");
const { validate } = require("../Utils/joi.validator");
const { initiatePaymentSchema } = require("../Utils/joi.schema");

// Joi validation schema - import and apply if you want, left out here for brevity

// Initiate payment (user)
router.post("/", validateToken, validate(initiatePaymentSchema), initiatePayment);

// Flutterwave webhook (no auth)
router.post("/webhook", express.json({ type: "application/json" }), verifyPaymentWebhook);

// Get all payments (admin or user own)
router.get("/", validateToken, getAllPayments);

// Get single payment by ID
router.get("/:id", validateToken, getPaymentById);

// Delete payment (admin only)
router.delete("/:id", validateToken, deletePayment);

module.exports = router;
