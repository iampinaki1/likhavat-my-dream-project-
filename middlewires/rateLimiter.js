import { rateLimit } from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

// General API limiter — applied to all /api routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, msg: "Too many requests, please try again later." },
});

// Strict limiter for auth endpoints (signup, signin, OTP verify)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, msg: "Too many auth attempts, please try again in 15 minutes." },
});

// OTP resend — tightest
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isProd ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, msg: "Too many OTP requests, please wait 5 minutes." },
});
