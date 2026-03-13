import express from "express";
import verifyUser from "../middlewires/auth.js";
import {
    createPoem,
    getPoems,
    getPoemById,
    loadPoemsOfUser,
    toggleLikePoem,
    deletePoem
} from "../controller/poemController.js";

const router = express.Router();

router.post("/poem/create", verifyUser, createPoem);
router.get("/poem", verifyUser, getPoems);
router.get("/poem/user", verifyUser, loadPoemsOfUser);
router.get("/poem/:id", verifyUser, getPoemById);
router.post("/poem/:id/like", verifyUser, toggleLikePoem);
router.delete("/poem/:id", verifyUser, deletePoem);

export default router;
