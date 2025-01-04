import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter } from "./nodemailer.config.js";

export const sendVerficationEmail = async (email, verificationToken) => {
  try {
    transporter.sendMail({
      from: "One Trip",
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    transporter.sendMail({
      from: "One Trip",
      to: email,
      subject: "Welcome to One Trip",
      html: "<h1>Login Successfully, Welcome {name}</h1>".replace(
        "{name}",
        name
      ),
      category: "Welcome Email",
    });

    console.log("Welcome Email sent successfully");
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    transporter.sendMail({
      from: "One Trip",
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Reset Password",
    });

    console.log("Reset Password Email sent successfully");
  } catch (error) {
    console.error(`Error sending Reset Password`, error);

    throw new Error(`Error sending Reset Password: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    transporter.sendMail({
      from: "One Trip",
      to: email,
      subject: "Reset Password Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Reset Password Successful",
    });

    console.log("Password Reset Successful sent successfully");
  } catch (error) {
    console.error(`Error sending Reset Password Successful`, error);

    throw new Error(`Error sending Reset Password Successful: ${error}`);
  }
};
