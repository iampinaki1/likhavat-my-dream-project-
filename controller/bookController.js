import upload from "../utils/cloudinary.js";
import { Book } from "../models/book.model.js";
import { Chapter } from "../models/chapter.model.js";
import { Comment } from "../models/comment.models.js";
import User from "../models/user.models.js";
export const createBook = async (req, res) => {
  try {
    const { title, description, visibility, chapters, coverImage } = req.body;
    const authorId = req.userId || req.body.author;

    // Map 'private' from frontend to 'restricted' enum in the model
    const normalizedVisibility =
      visibility === "private" ? "restricted" : visibility || "restricted";

    const book = await Book.create({
      title,
      author: authorId,
      description,
      visibility: normalizedVisibility,
      image: coverImage || "no img",
    });

    if (chapters && chapters.length > 0) {
      for (const ch of chapters) {
        const newChapter = await Chapter.create({
          title: ch.title,
          content: ch.content,
          chapterNumber: ch.order || 1,
          book: book._id,
        });
        book.chapters.push(newChapter._id);
      }
    } else {
      const initialChapter = await Chapter.create({
        title: "Chapter 1",
        content: "Once upon a time...",
        chapterNumber: 1,
        book: book._id,
      });
      book.chapters.push(initialChapter._id);
    }

    await book.save();

    const populatedBook = await Book.findById(book._id)
      .populate("author", "username profilePic")
      .populate("chapters");

    res.status(201).json(populatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createChapter = async (req, res) => {
  try {
    const { title, content, chapterNumber, bookId } = req.body;//bookid is mongooseid
    const book = await Book.findById(bookId);
    if (book) {
      if (book.author.toString() !== req.userId) {
        return res.status(403).json({ msg: "You are not authorised" });
      }
      const chaptercheck = await Chapter.findOne({ chapterNumber, book: bookId });
      if (chaptercheck) { return res.json({ msg: "chapter already exist" }) }

      if (!chaptercheck) {
        const chapter = await Chapter.create({
          title,
          content,
          chapterNumber,
          book: bookId,
        });
        await Book.findByIdAndUpdate(
          bookId,
          { $push: { chapters: chapter._id } },
          { new: true }
        );
        res.status(201).json(chapter);
      }
      res.status(201).json({ msg: "chapter already exists" });
    }
    res.status(201).json({ msg: "book may be deleted recently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, content } = req.body;
    
    const chapter = await Chapter.findById(chapterId).populate('book');
    
    if (!chapter) {
      return res.status(404).json({ msg: "Chapter not found" });
    }
    
    // Check if user is the book author
    const book = await Book.findById(chapter.book);
    if (!book || book.author.toString() !== req.userId) {
      return res.status(403).json({ msg: "You are not allowed to edit this chapter" });
    }
    
    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { title, content },
      { new: true, runValidators: true }
    );

    res.json({ success: true, chapter: updatedChapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ msg: "Chapter not found" });
    }
    
    // Check if user is the book author
    const book = await Book.findById(chapter.book);
    if (!book || book.author.toString() !== req.userId) {
      return res.status(403).json({ msg: "You are not allowed to delete this chapter" });
    }

    await Book.findByIdAndUpdate(chapter.book, {
      $pull: { chapters: chapterId },
    });

    await Chapter.findByIdAndDelete(chapterId);

    res.json({ success: true, msg: "Chapter deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const addCommentBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const commentKrneWalaUserKiId = req.userId;

    const { text } = req.body;

    const book = await Book.findById(bookId);

    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      bookId: bookId, // Fixed reference
    });

    await comment.populate({
      path: "author",
      select: "username profilePic",
    });

    book.comments.push(comment._id);
    await book.save(); // Fixed post->book

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsOfBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { lastId } = req.query;

    let filter = { bookId: bookId };

    if (lastId) {
      filter._id = { $lt: lastId };
    }

    const comments = await Comment.find(filter)
      .populate("author", "username profilePic")
      .sort({ _id: -1 })
      .limit(5);

    return res.status(200).json({ 
      success: true, 
      comments,
      nextCursor: comments.length > 0 ? comments[comments.length - 1]._id : null
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, description, visibility } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    if (!book.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to update this book" });
    }

    // Map 'private' from frontend to 'restricted' enum in the model
    const normalizedVisibility =
      visibility === "private" ? "restricted" : visibility;

    const updateData = {
      title,
      author,
      description,
    };

    if (normalizedVisibility) {
      updateData.visibility = normalizedVisibility;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookWithChapters = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId)
      .populate("chapters")
      .populate("author", "username profilePic");

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export async function addPhoto(req, res) {
  const { BookId } = req.param;
  const localFilePath = req.file.path;

  const imageUrl = await upload(localFilePath);
  try {
    if (imageUrl) {
      await Book.findByIdAndUpdate(
        BookId,
        {
          $set: {
            image: imageUrl,
          },
        },
        { new: true }
      );
    }
    return res.json({
      msg: "Photo uploaded successfully",
      filename: req.file.filename,
      path: req.file.path,
    });
  } catch (err) {
    res.json({ msg: `err${err}` });
  }
}

export const loadBooksOfUser = async (req, res) => {
  //copied
  try {
    const { lastId, visibility, title, onlyMine, bookmarked, author } = req.query;

    let filter = {};

    // Only my scripts
    if (onlyMine === "true") {
      filter.author = req.userId;
    } else if (author) {
      filter.author = author;
    }

    //  Visibility filter
    if (visibility) {
      filter.visibility = visibility; // "public" | "private"
    }

    //  Search by title
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // If asking for BOOKMARKED scripts
    if (bookmarked === "true") {
      //  Get logged-in user
      const user = await User.findById(req.userId).select("bookmarksBook");

      if (!user || user.bookmarksBook.length === 0) {
        return res.json({
          success: true,
          books: [],
          nextCursor: null,
        });
      } //  Filter only bookmarked scripts
      filter._id = { $in: user.bookmarksBook };
    }

    //  Cursor Pagination (applies to all cases)
    if (lastId) {
      filter._id = { ...(filter._id || {}), $lt: lastId };
    }

    const books = await Book.find(filter)
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username profilePic"
        }
      })
      .sort({ _id: -1 })
      .limit(5);

    res.json({
      success: true,
      books,
      nextCursor: books.length > 0 ? books[books.length - 1]._id : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchBookById = async (req, res) => {
  try {
    const { code } = req.query; // book id entered by user

    if (!code) {
      return res.status(400).json({ msg: "Book code is required" });
    }

    const book = await Book.findById(code)
      .populate("chapters")
      .populate("author", "username profilePic");

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    res.json({
      success: true,
      book,
    });
  } catch (err) {
    // Invalid ObjectId format error handled here
    res.status(500).json({ error: "Invalid book code" });
  }
};

export const bookmarkBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userid = req.userId;
    const book = await Book.findById(bookId);
    if (!book)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(userid);
    if (user.bookmarksBook.includes(book._id)) {
      // already bookmarked -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarksBook: book._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      // bookmark
      await user.updateOne({ $addToSet: { bookmarksBook: book._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};

export const toggleLikeBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userid = req.userId;
    const book = await Book.findById(bookId);
    if (!book)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    if (book.likes.includes(userid)) {
      await book.updateOne({ $pull: { likes: userid } });
      return res.status(200).json({ type: "unliked", message: "Post unliked", success: true });
    } else {
      await book.updateOne({ $addToSet: { likes: userid } });
      return res.status(200).json({ type: "liked", message: "Post liked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
export const deleteBook = async (req, res) => {
  const userid = req.userId;
  const bookId = req.params.bookId
  const book = await Book.findOneAndDelete({
    _id: bookId,
    author: userid
  })
  if (!book) { return res.status(400).json({ msg: "user is not authorised" }) }

}
