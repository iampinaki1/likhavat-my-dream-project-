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
  refresh
} from "../controller/authController.js";
import verifyUser from "../middlewires/auth.js"; //verifyUser=verify
import upload from "../middlewires/multer.js";


const router = express.Router();
router.route("/signup").post(signup);//checked
router.route("/verifySignup").post(verify_signup);//checked
router.route("/signin").post(signin);//checked
router.route("/logout").get(verifyUser,logout);//checked
router.route("/profile/password/reset").post(verifyUser,changePassword);
router.route("/profile/verify-otp").post(verifyUser,verify_newPassword);
router.route("/profile/delete").post(verifyUser,deleteUser);
router.route("/profile/add").post(verifyUser, upload.single("photo"), updateProfile);//checked
router.route("/:username/followunfollow").post(verifyUser,followUnfollow);//working

router.route("/acceptRequest").post(verifyUser,acceptRequest);
router.route("/rejectRequest").post(verifyUser,rejectRequest);
router.route("/receivedRequest").get(verifyUser,requestRecieved);//working
router.route("/profile/:username").get(verifyUser,username);//chal raha//  he
router.post("/refresh", refresh);
export default router;
