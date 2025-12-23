import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, required: true, default: "no img" },
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },
    
    visibility: {
      type: String,
      enum: ["public", "restricted"],
      // 'restricted' = selected users only
      default: "restricted",
    },

    // Store only Chapter IDs
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
  },

  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
