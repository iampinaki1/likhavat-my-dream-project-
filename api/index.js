import express from "express";
import connectDB from "../config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import userRoute from "../routes/user.js";
import scriptRoute from "../routes/script.js";
import bookRoute from "../routes/book.js";
import poemRoute from "../routes/poem.js";
import messageRoute from "../routes/message.js";

dotenv.config();

const app = express();

// ALWAYS PUT CORS FIRST!
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database connection flag
let dbConnected = false;
let dbConnectionPromise = null;

// Middleware to ensure DB is connected
const connectDBMiddleware = async (req, res, next) => {
  // Skip DB connection for health check
  if (req.path === "/api/health" || req.path === "/") {
    return next();
  }

  if (!dbConnected) {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB()
        .then(() => {
          dbConnected = true;
          console.log("Database connected");
        })
        .catch((err) => {
          console.error("Database connection error:", err);
          dbConnectionPromise = null; // Reset on failure
          return Promise.reject(err);
        });
    }
    try {
      await dbConnectionPromise;
    } catch (err) {
      return res.status(500).json({ error: "Database connection failed", details: err.message });
    }
  }
  next();
};

app.use(connectDBMiddleware);

// Routes
app.use("/api/user", userRoute);
app.use("/api/scripts", scriptRoute);
app.use("/api/books", bookRoute);
app.use("/api/poems", poemRoute);
app.use("/api/messages", messageRoute);

// Health check
app.get("/api/health", (req, res) =>
  res.json({
    message: "working",
    status: "OK",
    timestamp: new Date().toISOString(),
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "no route found" });
});

export default app;

export default app;
