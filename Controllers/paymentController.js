const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Initiate payment with Flutterwave
exports.initiatePayment = async (req, res) => {
  const { amount, currency, courseId } = req.body;
  const userId = req.user.id;

  console.log("User ID from token:", userId);  // logs userId from token
  console.log("Payment request body:", req.body);  // logs request body

  // Validate amount > 0 and supported currency (assumed USD/GHS etc)
  if (!amount || amount <= 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid amount" });
  }

  try {
    // Fetch user details from DB since JWT doesn't contain name/email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    console.log("User fetched from DB:", user);  // logs user info fetched from DB

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // Create a pending payment record before payment
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency,
        status: "PENDING",
        userId,
        courseId,
      },
    });
    console.log("Payment created:", payment);  // logs newly created payment record

    // Prepare Flutterwave payment data
    const tx_ref = uuidv4(); // unique transaction ref
    const flutterwaveData = {
      tx_ref,
      amount,
      currency,
      redirect_url: `${process.env.FRONTEND_URL}/payment-success?paymentId=${payment.id}`,
      customer: {
        email: user.email,
        name: user.name,
      },
      customizations: {
        title: "Learnium Course Payment",
        description: `Payment for course ${courseId}`,
      },
      meta: {
        paymentId: payment.id,
      },
    };

    // Call Flutterwave API to get payment link
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      flutterwaveData,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Flutterwave key length:", process.env.FLUTTERWAVE_SECRET_KEY?.length);


    if (response.data.status === "success") {
      // Save tx_ref in payment record for future verification
      await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: tx_ref },
      });

      return res.status(StatusCodes.OK).json({
        paymentLink: response.data.data.link,
        paymentId: payment.id,
      });
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Failed to initiate payment" });
    }

   return res.status(StatusCodes.OK).json({ paymentId: payment.id });

  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

// Verify payment webhook from Flutterwave (called by Flutterwave, no auth)
exports.verifyPaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event !== "charge.completed") {
      // We only care about completed charges
      return res.status(StatusCodes.OK).json({ message: "Event ignored" });
    }

    // Verify signature - optional for extra security, depends on setup

    const { tx_ref, status, id: flutterwaveTransactionId } = data;

    // Find the payment in DB by tx_ref (stored as transactionId)
    const payment = await prisma.payment.findFirst({
      where: { transactionId: tx_ref },
    });

    if (!payment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Payment not found" });
    }

    if (status === "successful") {
      // Update payment status to SUCCESS
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });
      // Here you could also enroll user automatically, send email, etc.
    } else {
      // Update payment status to FAILED
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return res.status(StatusCodes.OK).json({ message: "Webhook processed" });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

// Get all payments (admin or user own payments)
exports.getAllPayments = async (req, res) => {
  const user = req.user;

  try {
    let payments;
    if (user.role === "ADMIN") {
      payments = await prisma.payment.findMany({
        include: { user: true, course: true },
      });
    } else {
      payments = await prisma.payment.findMany({
        where: { userId: user.id },
        include: { course: true },
      });
    }
    res.status(StatusCodes.OK).json(payments);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// Get single payment by ID (only admin or owner)
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true, course: true },
    });

    if (!payment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Payment not found" });
    }

    if (user.role !== "ADMIN" && payment.userId !== user.id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    res.status(StatusCodes.OK).json(payment);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// Delete payment by ID (admin only)
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (user.role !== "ADMIN") {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  try {
    await prisma.payment.delete({ where: { id } });
    res
      .status(StatusCodes.OK)
      .json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
