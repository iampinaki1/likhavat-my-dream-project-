import upload from "../utils/cloudinary.js";
import { Book } from "../models/book.model.js";
import { Chapter } from "../models/chapter.model.js";
import User from "../models/user.models.js";
export const createBook = async (req, res) => {
  try {
    const { title, author, description,visibility } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      visibility
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createChapter = async (req, res) => {
  try {
    const { title, content, chapterNumber, bookId } = req.body;

    if (chapter.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to delete this chapter" });
    }
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    if (chapter.author.toString() !== req.userId) {
      //remember chapter.author is obid datatype which is different
      return res
        .status(403)
        .json({ msg: "You are not allowed to delete this chapter" });
    }
    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedChapter) {
      return res.status(404).json({ msg: "Chapter not found" });
    }

    res.json(updatedChapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { bookId,chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (chapter.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to delete this chapter" });
    }
    if (!chapter) {
      return res.status(404).json({ msg: "Chapter not found" });
    }

    await Book.findByIdAndUpdate(chapter.book, {
      $pull: { chapters: chapterId },
    });

    await Chapter.findByIdAndDelete(chapterId);

    res.json({ msg: "Chapter deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const addCommentBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const commentKrneWalaUserKiId = req.id;

    const { text } = req.body;

    const book = await Book.findById(bookId);

    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      script: scriptId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePic",
    });

    book.comments.push(comment._id);
    await post.save();

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

    const comments = await Comment.find({ bookId: bookId }).populate(
      "author",
      "username profilePic"
    );

    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });

    return res.status(200).json({ success: true, comments });
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

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        title,
        author,
        description,
         visibility
      },
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

    const book = await Book.findById(bookId).populate("chapters");

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

export const loadBooksOfUser = async (req, res) => {//copied
  try {
    const { lastId, visibility, title, onlyMine, bookmarked } = req.query;

    let filter = {};

    // Only my scripts
    if (onlyMine === "true") {
      filter.author = req.userId;
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
          scripts: [],
          nextCursor: null,
        });
      }   //  Filter only bookmarked scripts
            filter._id = { $in: user.bookmarksBook };
          }
      
          //  Cursor Pagination (applies to all cases)
          if (lastId) {
            filter._id = { ...(filter._id || {}), $lt: lastId };
          }
      
          const books = await Book.find(filter)
            .sort({ _id: -1 })
            .limit(10);
      
          res.json({
            success: true,
            books,
            nextCursor:
              books.length > 0 ? books[books.length - 1]._id : null,
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

    const book = await Book.findById(code).populate("chapters");

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

export const bookmarkBook = async (req,res) => {
    try {
        const bookId = req.params.id;
        const userid = req.userId;
        const script = await Book.findById(bookId);
        if(!script) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(userid);
        if(user.bookmarks.includes(script._id)){//actual way of checking references
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarksBooks:script._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarksBooks:script._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}