import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  scriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Script" },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});
export const Comment = mongoose.model("comment", commentSchema);
