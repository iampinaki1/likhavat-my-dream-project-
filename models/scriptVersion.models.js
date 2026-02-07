import mongoose from "mongoose";

const scriptVersionSchema = new mongoose.Schema({
  body: { type: String, required: true },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const scriptVersion = mongoose.model("scriptVersion", scriptVersionSchema);
export default scriptVersion;
