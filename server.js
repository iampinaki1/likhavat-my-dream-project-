import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.js";
import  {rateLimit} from "express-rate-limit"
// import {  } from "../controllers/authController.js";

dotenv.config();
//import routes
const app = express();
const PORT = process.env.PORT || 4000;
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
// app.get("/health",(req,res)=>res.json({message:"working"}))

// app.get("*",(req,res)=>res.json({message:"working"}))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/api/user", userRoute);

app.get("/api/health", (req, res) =>
  res.json({
    message: "working",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
); //just to check the connected server is recent
app.get("/", (req, res) => {
  res.send("Server is running!");
});
app.use((req, res) => {
  res.status(404).json({ error: "no route found" });
});
async function start() {
  try {
    await connectDB();
    console.log(`database connected`);
    app.listen(PORT, () => {
      console.log(`server started at ${PORT}`);
    }); //template litral string dynamic string not static string
  } catch (err) {
    console.log(`error:${err}`);
  }
}

start();

//routes
// app.post("/api/v1/user/signupp", (req, res) => {
//   console.log("TEMP SIGNUP HIT", req.method, req.url, "body:", req.body);
//   return res.json({ ok: true });
// });
