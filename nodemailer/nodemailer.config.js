import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "sanjithlap123@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});