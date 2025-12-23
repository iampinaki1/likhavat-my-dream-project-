import mongoose from "mongoose";
const scriptRequestAccessSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
});
const ScriptRequestAccess = mongoose.model("ScriptRequestAccess",scriptRequestAccessSchema)
export default ScriptRequestAccess;