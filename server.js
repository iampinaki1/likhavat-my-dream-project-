import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.js";
import scriptRoute from './routes/script.js';
import bookRoute from './routes/book.js';
import poemRoute from './routes/poem.js';
import messageRoute from './routes/message.js';
import { setupSocket } from "./sockets/socketmanagement.js";
import { generalLimiter, authLimiter, otpLimiter } from "./middlewires/rateLimiter.js";
import { errorHandler } from "./middlewires/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// General rate limit on all API routes
app.use('/api', generalLimiter);

// Tighter limits on auth endpoints
app.use('/api/user/signup', authLimiter);
app.use('/api/user/signin', authLimiter);
app.use('/api/user/verifySignup', authLimiter);
app.use('/api/user/profile/verify-otp', authLimiter);
app.use('/api/user/profile/password/reset', authLimiter);
app.use('/api/user/resendSignupOtp', otpLimiter);
app.use('/api/user/profile/resend-reset-otp', otpLimiter);

app.use("/api/user", userRoute);
app.use("/api/scripts", scriptRoute);
app.use("/api/books", bookRoute);
app.use("/api/poems", poemRoute);
app.use("/api/messages", messageRoute);

app.get("/api/health", (req, res) =>
  res.json({
    message: "working",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

app.get("/", (req, res) => res.send("Server is running!"));

app.use((req, res) => res.status(404).json({ error: "no route found" }));

// Centralized error handler — must be last
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    console.log(`database connected`);
    const { server } = setupSocket(app);
    server.listen(PORT, () => {
      console.log(`server started at ${PORT}`);
    });
  } catch (err) {
    console.error(`startup error: ${err}`);
    process.exit(1);
  }
}

start();
