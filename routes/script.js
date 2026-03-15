import express from "express";
import verifyUser from "../middlewires/auth.js";
import upload from "../middlewires/multer.js";
import {
  createNewVersion,
  newscript,
  deleteVersion,
  removeScript,
  updateVersion,
  addCommentScripts,
  getCommentsOfScripts,
  getScriptVersion,
  loadScriptsOfUser,
  requestScriptAccess,
  getScriptAccessRequests,
  acceptRequest,
  rejectRequest,
  bookmarkScript,
  toggleLikeScript,
  searchScriptById,
  addPhotoScript,
  updateScript
} from "../controller/scriptController.js";

const router = express.Router();
router.post("/script", verifyUser, newscript).get("/script", verifyUser, loadScriptsOfUser);
router.get("/script/search", verifyUser, searchScriptById);
router.put("/script/:id/update", verifyUser, updateScript);
router.put("/script/:id/addpic", verifyUser, upload.single("image"), addPhotoScript);
router.delete("/script/:id", verifyUser, removeScript);
router.post("/script/:id/version", verifyUser, createNewVersion);
router.delete("/script/:id/version/:versionId", verifyUser, deleteVersion);
router.put("/script/:id/version", verifyUser, updateVersion);
router.get("/script/:id/version/:versionId", verifyUser, getScriptVersion);
router.post("/script/:id/comment", verifyUser, addCommentScripts);
router.get("/script/:id/comment", verifyUser, getCommentsOfScripts);
router.post("/script/:id/bookmark", verifyUser, bookmarkScript);
router.post("/script/:id/like", verifyUser, toggleLikeScript);
router.post("/script/:id/request-access", verifyUser, requestScriptAccess);
router.get("/script/:id/requests", verifyUser, getScriptAccessRequests);
router.post("/script/:id/accept", verifyUser, acceptRequest);
router.post("/script/:id/reject", verifyUser, rejectRequest);
export default router;