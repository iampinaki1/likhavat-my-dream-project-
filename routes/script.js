import express from "express";
import verifyUser from "../middlewires/auth.js";
import upload from "../middlewires/multer.js";
import { validate, createScriptSchema, updateScriptSchema, versionBodySchema, commentSchema } from "../middlewires/validate.js";
import {
  createNewVersion, newscript, deleteVersion, removeScript,
  updateVersion, addCommentScripts, getCommentsOfScripts,
  getScriptVersion, loadScriptsOfUser, requestScriptAccess,
  getScriptAccessRequests, acceptRequest, rejectRequest,
  bookmarkScript, toggleLikeScript, searchScriptById,
  addPhotoScript, updateScript
} from "../controller/scriptController.js";

const router = express.Router();
router.post("/script", verifyUser, validate(createScriptSchema), newscript).get("/script", verifyUser, loadScriptsOfUser);
router.get("/script/search", verifyUser, searchScriptById);
router.put("/script/:id/update", verifyUser, validate(updateScriptSchema), updateScript);
router.put("/script/:id/addpic", verifyUser, upload.single("image"), addPhotoScript);
router.delete("/script/:id", verifyUser, removeScript);
router.post("/script/:id/version", verifyUser, validate(versionBodySchema), createNewVersion);
router.delete("/script/:id/version/:versionId", verifyUser, deleteVersion);
router.put("/script/:id/version", verifyUser, validate(versionBodySchema), updateVersion);
router.get("/script/:id/version/:versionId", verifyUser, getScriptVersion);
router.post("/script/:id/comment", verifyUser, validate(commentSchema), addCommentScripts);
router.get("/script/:id/comment", verifyUser, getCommentsOfScripts);
router.post("/script/:id/bookmark", verifyUser, bookmarkScript);
router.post("/script/:id/like", verifyUser, toggleLikeScript);
router.post("/script/:id/request-access", verifyUser, requestScriptAccess);
router.get("/script/:id/requests", verifyUser, getScriptAccessRequests);
router.post("/script/:id/accept", verifyUser, acceptRequest);
router.post("/script/:id/reject", verifyUser, rejectRequest);
export default router;