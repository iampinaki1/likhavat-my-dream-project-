import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    profilepic: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //make default null
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    writtings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Script" }],
    bookmarksScript: [{ type: mongoose.Schema.Types.ObjectId, ref: "Script" }],
    bookmarksBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    termAndCondition: { type: Boolean, default: false, required: true },
    isPrivate: { type: Boolean, default: true, required: true }, //only for follow all or request
  },
  { timestamp: true }
);
const User = mongoose.model("User", userSchema);
export default User;
