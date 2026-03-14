import app from "./api/index.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { setupSocket } from "./sockets/socketmanagement.js";

dotenv.config();
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    console.log(`Database connected`);
    const { server, io } = setupSocket(app);
    server.listen(PORT, () => {
      console.log(`Server started at ${PORT}`);
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}

start();
