const prisma = require("../Models/prismaClient");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Initiate payment with Paystack
exports.initiatePayment = async (req, res) => {
  const { amount, currency, courseId } = req.body;
  const userId = req.user.id;

  console.log("User ID from token:", userId);
  console.log("Payment request body:", req.body);

  if (!amount || amount <= 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid amount" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    console.log("User fetched from DB:", user);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: "KES",
        status: "PENDING",
        userId,
        courseId,
      },
    });
    console.log("Payment created:", payment);

    // Convert UGX to KES (approx rate 1 UGX = 0.036 KES)
    const convertedAmountKES = Math.floor(amount * 0.036);

    // Paystack requires currency units (cents)
    const paystackAmount = convertedAmountKES * 100;

    console.log(`Converted ${amount} UGX to ${convertedAmountNGN} NGN (${paystackAmount} kobo)`);

    // Log secret key to confirm it's loaded ---
    console.log("Paystack secret loaded:", !!process.env.PAYSTACK_SECRET_KEY);
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Paystack secret key not configured" });
    }

    // Paystack payment initialization
    const tx_ref = uuidv4(); // unique transaction reference
    const paystackData = {
      email: user.email,
      amount: paystackAmount,
      reference: tx_ref,
      currency: "NGN",
      callback_url: `${process.env.FRONTEND_URL}/payment-success?paymentId=${payment.id}`,
      metadata: { paymentId: payment.id, courseId },
    };

    // Wrap Axios call with try-catch for detailed Paystack errors
    let response;
    try {
      response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        paystackData,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Paystack response:", response.data);
    } catch (err) {
      console.error("Paystack API error:", err.response?.data || err.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Paystack API error",
        details: err.response?.data,
      });
    }

    if (response.data.status) {
      // Save tx_ref in payment record for verification later
      await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: tx_ref },
      });

      return res.status(StatusCodes.OK).json({
        paymentLink: response.data.data.authorization_url,
        paymentId: payment.id,
      });
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Failed to initiate payment" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

// Verify payment webhook from Paystack
exports.verifyPaymentWebhook = async (req, res) => {
  try {
    // Paystack signature verification
    const signature = req.headers["x-paystack-signature"];
    if (!signature) {
      console.error("Missing Paystack signature");
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Missing signature" });
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Paystack signature");
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid signature" });
    }

    console.log("Webhook payload received:", req.body); // log entire webhook payload
    const { event, data } = req.body;

    if (!event || !data) {
      console.error("Invalid webhook format: missing event or data");
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid webhook format" });
    }

    if (event !== "charge.success") {
      console.log(`Ignored event type: ${event}`);
      return res.status(StatusCodes.OK).json({ message: "Event ignored" });
    }

    const { reference, status } = data;

    if (!reference) {
      console.error("No transaction reference in webhook data");
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing transaction reference" });
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: reference },
    });

    if (!payment) {
      console.error("Payment not found for reference:", reference);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Payment not found" });
    }

    const newStatus = status === "success" ? "SUCCESS" : "FAILED";
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus === "success" ? "SUCCESS" : "FAILED" },
    });
    console.log(`Payment ${payment.id} updated to status: ${newStatus}`);

    return res.status(StatusCodes.OK).json({ message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
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

// Get single payment by ID
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
