import express from "express";
import verifyUser from "../middlewires/auth.js";
import { validate, createBookSchema, createChapterSchema, commentSchema } from "../middlewires/validate.js";
import {
  addPhoto, createBook, createChapter, editChapter, deleteChapter,
  deleteBook, getBookWithChapters, addCommentBook, getCommentsOfBook,
  updateBook, loadBooksOfUser, searchBookById, bookmarkBook, toggleLikeBook,
} from "../controller/bookController.js";

const router = express.Router();
router.post("/book/create", verifyUser, validate(createBookSchema), createBook);
router.post("/book/:id/bookmark", verifyUser, bookmarkBook);
router.post("/book/:id/like", verifyUser, toggleLikeBook);
router.put("/book/:bookId/addImage", verifyUser, addPhoto);
router.delete("/book/:bookId", verifyUser, deleteBook);
router.post("/chapter", verifyUser, validate(createChapterSchema), createChapter);
router.put("/chapter/:chapterId", verifyUser, editChapter);
router.delete("/book/:id/chapter/:chapterId", verifyUser, deleteChapter);
router.get("/book/:bookId", verifyUser, getBookWithChapters);
router.get("/book", verifyUser, loadBooksOfUser);
router.put("/book/:bookId/update", verifyUser, updateBook);
router.post("/book/:id/comment", verifyUser, validate(commentSchema), addCommentBook);
router.get("/book/:id/comment", verifyUser, getCommentsOfBook);
router.get("/book/search", verifyUser, searchBookById);
router.delete("/book/:id", verifyUser, deleteBook);

export default router;