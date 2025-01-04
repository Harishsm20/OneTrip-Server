import express from "express";
import {
  createPkg,
  verifyPayment,
} from "../controllers/payments.controller.js";
const router = express.Router();

router.post("/createPackage", createPkg);
router.post("/verifyPayment", verifyPayment);

export default router;
