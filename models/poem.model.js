import mongoose from "mongoose";

const poemSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
        },
        likes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },
    },
    { timestamps: true }
);

export const Poem = mongoose.model("Poem", poemSchema);
