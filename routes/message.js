import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from "../controller/messageController.js";
import verifyUser from "../middlewires/auth.js";

const router = express.Router();

router.route("/conversations").get(verifyUser, getConversations);
router.route("/send").post(verifyUser, sendMessage);
router.route("/:userId").get(verifyUser, getMessages);
router.route("/:userId/delete").delete(verifyUser, deleteConversation);

export default router;


