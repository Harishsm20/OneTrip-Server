import { createRazorpayInstance } from "../config/razorpay.config.js";

import crypto from "crypto";
import { config } from "dotenv";
config();
const razorpayInstance = createRazorpayInstance();

export const createPkg = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    razorpayInstance.orders.create(options, (err, order) => {
      if (err) {
        console.error("Razorpay Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create order",
        });
      }
      return res.status(200).json(order);
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;

  const hmac = crypto.createHmac("sha256", secret);

  hmac.update(orderId + "|" + paymentId);

  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === signature) {
    return res.status(200).json({
      success: true,
      message: "Payment Verified",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Payment not verified",
    });
  }
};
