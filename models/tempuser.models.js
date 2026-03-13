import mongoose from "mongoose";

const tempuserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verificationCode: { type: Number, required: true },
    verificationCodeExpiry: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 150 } // Document auto-deletes after 2.5 minutes (150 seconds)
  },
  { timestamps: true }
);
const TempUser = mongoose.model("TempUser", tempuserSchema);
export default TempUser;
//  verificationCode:{type:Number,required: true, default:null},