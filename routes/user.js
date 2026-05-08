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
  getFollowList,
  resendSignupOtp,
  resendResetOtp,
} from "../controller/authController.js";
import verifyUser from "../middlewires/auth.js";
import upload from "../middlewires/multer.js";
import { validate, signupSchema, signinSchema, verifyOtpSchema, changePasswordSchema } from "../middlewires/validate.js";

const router = express.Router();
router.route("/signup").post(validate(signupSchema), signup);
router.route("/verifySignup").post(validate(verifyOtpSchema), verify_signup);
router.route("/resendSignupOtp").post(resendSignupOtp);
router.route("/signin").post(validate(signinSchema), signin);
router.route("/logout").get(verifyUser, logout);
router.route("/profile/password/reset").post(validate(changePasswordSchema), changePassword);
router.route("/profile/verify-otp").post(validate(verifyOtpSchema), verify_newPassword);
router.route("/profile/resend-reset-otp").post(resendResetOtp);
router.route("/profile/delete").post(verifyUser, deleteUser);
router.route("/profile/add").post(verifyUser, upload.single("photo"), updateProfile);
router.route("/:username/followunfollow").post(verifyUser, followUnfollow);
router.route("/acceptRequest").post(verifyUser, acceptRequest);
router.route("/rejectRequest").post(verifyUser, rejectRequest);
router.route("/receivedRequest").get(verifyUser, requestRecieved);
router.route("/profile/:username").get(verifyUser, username);
router.route("/all").get(verifyUser, getAllUsers);
router.route("/:username/followlist").get(verifyUser, getFollowList);
router.post("/refresh", refresh);
export default router;
