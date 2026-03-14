import express from "express";
import {
  signup,
  verify_signup,
  verify_newPassword,
  changePassword,
  signin,
  logout,
  followUnfollow,
  deleteUser,
  updateProfile,
  username,
  acceptRequest,
  rejectRequest,
  requestRecieved,
  refresh,
  getAllUsers,
  resendSignupOtp,
  resendResetOtp,
} from "../controller/authController.js";
import verifyUser from "../middlewires/auth.js";
import upload from "../middlewires/multer.js";

const router = express.Router();
router.route("/signup").post(signup);
router.route("/verifySignup").post(verify_signup);
router.route("/resendSignupOtp").post(resendSignupOtp);
router.route("/signin").post(signin);
router.route("/logout").get(verifyUser, logout);
router.route("/profile/password/reset").post(changePassword);
router.route("/profile/verify-otp").post(verify_newPassword);
router.route("/profile/resend-reset-otp").post(resendResetOtp);
router.route("/profile/delete").post(verifyUser, deleteUser);
router.route("/profile/add").post(verifyUser, upload.single("photo"), updateProfile);
router.route("/:username/followunfollow").post(verifyUser, followUnfollow);
router.route("/acceptRequest").post(verifyUser, acceptRequest);
router.route("/rejectRequest").post(verifyUser, rejectRequest);
router.route("/receivedRequest").get(verifyUser, requestRecieved);
router.route("/profile/:username").get(verifyUser, username);
router.route("/all").get(verifyUser, getAllUsers);
router.post("/refresh", refresh);
export default router;
