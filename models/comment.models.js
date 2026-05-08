import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  scriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Script" },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

commentSchema.index({ scriptId: 1, _id: -1 });
commentSchema.index({ bookId: 1, _id: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
