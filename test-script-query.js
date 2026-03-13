import mongoose from "mongoose";
import dotenv from "dotenv";
import Script from "./models/script.models.js";
import { Comment } from "./models/comment.models.js";
import User from "./models/user.models.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB. Testing Script fetch...");
        try {
            const scripts = await Script.find({})
                .populate("author", "username profilePic")
                .populate({
                    path: "comments",
                    populate: {
                        path: "author",
                        select: "username profilePic"
                    }
                })
                .sort({ _id: -1 })
                .limit(10);
            console.log("SUCCESS. Fetched", scripts.length, "scripts.");
        } catch (err) {
            console.error("FAILED TO FETCH SCRIPTS:", err);
        }
        process.exit(0);
    })
    .catch(console.error);
