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

poemSchema.index({ author: 1, _id: -1 });
poemSchema.index({ _id: -1 }); // feed pagination

export const Poem = mongoose.model("Poem", poemSchema);
