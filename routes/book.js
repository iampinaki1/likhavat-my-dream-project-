import express from "express";
import verifyUser from "../middlewires/auth.js";
import {
  addPhoto,
  createBook,
  createChapter,
  editChapter,
  deleteChapter,
  deleteBook,
  getBookWithChapters,
  addCommentBook,
  getCommentsOfBook,
  updateBook,
  loadBooksOfUser,
  searchBookById,
  bookmarkBook,
} from "../controller/bookController";

const router = express.Router();
router.post("/book/create", verifyUser, createBook);
router.put("/book/:bookId/addImage", verifyUser, addPhoto);
router.delete("/book/:bookId", verifyUser, deleteBook);
router.post("/chapter", verifyUser, createChapter);
router.put("/chapter/:chapterId", verifyUser, editChapter);
router.delete("book/:id/chapter/:chapterId", verifyUser, deleteChapter);
router.get("/book/:bookId", verifyUser, getBookWithChapters);
router.get("/book", verifyUser, loadBooksOfUser);
router.put("/book/:bookId/update", verifyUser, updateBook);
router.post("/book/:id/comment", verifyUser, addCommentBook);
router.get("/book/:id/comment", verifyUser, getCommentsOfBook); //could have used route chaining
router.get("/book/search", verifyUser, searchBookById);
router.post("/script/:id/bookmark", verifyUser, bookmarkBook); 
//edit request ko auto bookmark kar de ya first bookmark then request send//only his books