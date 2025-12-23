import mongoose from "mongoose";
const followRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ["pending", "accepted"],
    default: "pending"
  }
});
const FollowRequest = mongoose.model("FollowRequest",followRequestSchema)
export default FollowRequest;