import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/connectDB.js";
import {
  authRoute,
  destinationRoute,
  packageRoute,
  paymentRoute,
  categoryRoute,
} from "./routes/route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

app.use("/api/destinationPage", destinationRoute);

app.use("/api/package", packageRoute);

app.use("/api/payment", paymentRoute);

app.use("/api/category", categoryRoute);

// Start server
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port", PORT);
});
