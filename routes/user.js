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
} from "../controller/authController.js";
import verifyUser from "../middlewires/auth.js"; //verifyUser=verify
import upload from "../middlewires/multer.js";


const router = express.Router();
router.route("/signup").post(signup);
router.route("/verifySignup").post(verify_signup);
router.route("/signin").post(signin);
router.route("/logout").get(verifyUser,logout);
router.route("/profile/password/reset").post(verifyUser,changePassword);
router.route("/profile/verify-otp").post(verifyUser,verify_newPassword);
router.route("/profile/delete").post(verifyUser,deleteUser);
router.route("/profile/add").post(verifyUser, upload.single("photo"), updateProfile);
router.route("/:username/followunfollow").post(verifyUser,followUnfollow);
router.route("/:username").get(verifyUser,username);
export default router;
//import { verifyUser } from "../controllers/authController.js";
// E:\projecttodolist\backend\controller\authController
// E:\projecttodolist\backend\controller\authController.js