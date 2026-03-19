import mongoose from "mongoose";

const scriptVersionSchema = new mongoose.Schema(
  {
    body: { type: String, default: "" },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const scriptVersion = mongoose.model("ScriptVersion", scriptVersionSchema);
export default scriptVersion;
