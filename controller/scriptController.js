//it is returns with params of each script
import { Script } from "../models/script.models.js";
import User from "../models/user.models.js";
import scriptVersion from "../models/scriptVersion.models.js";
import { Comment } from "../models/comment.models.js";
import ScriptRequestAccess from "../models/scriptAccessRequest.model.js";
import upload from "../utils/cloudinary.js";
import scriptVersion from "../models/scriptVersion.models.js";

export const createNewVersion = async (req, res) => {
  try {
    const { scriptId } = req.param;
    const { body, editedBy } = req.body;
    const userid = req.userId;
    const check = await Script.findOne({ _id: scriptId, allowedUser: userid });
    const check2 = await Script.findOne({ _id: scriptId, author: userid });
    if (check.length === 0 && !check2.length === 0) {
      return res.status(404).json({ msg: "may be user is not verified" });
    } else {
      const Version = await new scriptVersion({
        body,
        editedBy,
      });
      const script = await Script.findByIdAndUpdate(
        scriptId,
        {
          $push: { edits: Version._id },
        },
        { new: true }
      );
    }
    //const script = await Script.findById(scriptId);
  } catch (error) {
    console.log(`error:${error}`);
    return res.status(500).json({ msg: `error :${error}` });
  }
};
export const deleteVersion = async (req, res) => {
  try {
    const { scriptId, versionId } = req.param;
    const userid = req.userId;
    const check = await Script.findOne({ _id: scriptId, allowedUser: userid });
    const check2 = await Script.findOne({ _id: scriptId, author: userid });
    if (check.length === 0 && !check2.length === 0) {
      return res.status(404).json({ msg: "may be user is not verified" });
    }
    const deleted = await scriptVersion.findByIdAndDelete(versionId);
    return res.status(200).json({ deleted });
  } catch (error) {
    console.log(`error:${error}`);
    return res.status(500).json({ msg: `error :${error}` });
  }
};
export const newscript = async (req, res) => {
  try {
    const { title, description, author, genre, purpose, visibility } = res.body;
    const script = await new Script({
      title,
      description,
      author,
      genre,
      purpose,
      visibility,
    });
    await script.save();
    return res.status(200).json({ msg: `script created`, script });
  } catch (error) {
    console.log(`error:${error}`);
    return res.status(500).json({ msg: `error :${error}` });
  }
};

export const removeScript = async (req, res) => {
  try {
    const scriptId = req.param.scriptId;
    const userid = req.userId;
    const remove = awaitScript.findOneAndDelete({
      _id: scriptId,
      author: userid,
    });
    if (remove) {
      return res.json({ msg: "deleted" });
    }
    return res.json({ msg: "u r not authorised" });

    //author can delete only equate author to user
  } catch (error) {
    return res.json({ msg: "error occured" });
  }
};

export const updateVersion = async (req, res) => {
  try {
    const { userid, scriptId, VersionId } = req.param;
    const { edit } = req.body;
    const check = await Script.findOne({ _id: scriptId, allowedUser: userid });
    const check2 = await Script.findOne({ _id: scriptId, author: userid });
    if (check.length === 0 && !check2.length === 0) {
      return res.status(404).json({ msg: "may be user is not verified" });
    } else {
      const edited = await scriptVersion.findByIdAndUpdate(
        VersionId,
        {
          $set: {
            body: edit,
            editedBy: userid,
          },
        },
        { new: true }
      );
    }
    return res.json({ msg: "saved", editedScript: edited });
  } catch (err) {
    return res.json({ msg: "error occured" });
  }
};
// const deleteVersion
export const addCommentScripts = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const commentKrneWalaUserKiId = req.id;

    const { text } = req.body;

    const script = await Script.findById(scriptId);

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

    script.comments.push(comment._id);
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
export const getCommentsOfScripts = async (req, res) => {
  try {
    const scriptId = req.params.id;

    const comments = await Comment.find({ script: scriptId }).populate(
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

// const likeHandle = async (req, res) => {};
export const getScriptVersion = async (req, res) => {
  try {
    versionId = req.param;
    versionScript = await scriptVersion.findById(versionId);
    return res.json(versionScript);
  } catch (error) {
    return res.json({ message: `error${err}` });
  }
};

export const loadScriptsOfUser = async (req, res) => {
  //copied
  try {
    const { lastId, title, onlyMine, bookmarked } = req.query;
    const visibility = "public";
    let filter = {};

    // Only my scripts
    if (onlyMine === "true") {
      filter.author = req.userId;
    }

    //  Visibility filter

    filter.visibility = visibility; // "public" | "private"

    //  Search by title
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // If asking for BOOKMARKED scripts
    if (bookmarked === "true") {
      //  Get logged-in user
      const user = await User.findById(req.userId).select("bookmarksScript");

      if (!user || user.bookmarksScript.length === 0) {
        return res.json({
          success: true,
          scripts: [],
          nextCursor: null,
        });
      }

      //  Filter only bookmarked scripts
      filter._id = { $in: user.bookmarksScript };
    }

    //  Cursor Pagination (applies to all cases)
    if (lastId) {
      filter._id = { ...(filter._id || {}), $lt: lastId };
    }

    const scripts = await Script.find(filter).sort({ _id: -1 }).limit(10);

    res.json({
      success: true,
      scripts,
      nextCursor: scripts.length > 0 ? scripts[scripts.length - 1]._id : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await ScriptRequestAccess.findById(requestId);

    await Script.findByIdAndUpdate(request.sender, {
      $push: { allowedUsers: request.receiver },
    });

    request.status = "accepted";
    await request.save();

    res.json({ msg: "Follow request accepted" });
  } catch (error) {
    return res.status(404).json({ message: `errpr:${error}` });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    await ScriptRequestAccess.findByIdAndDelete(requestId);
    res.json({ msg: "Follow request rejected" });
  } catch (error) {
    return res.status(404).json({ message: `error:${error}` });
  }
};

export async function addPhotoScript(req, res) {
  const { scriptId } = req.param;
  const localFilePath = req.file.path;

  const imageUrl = await upload(localFilePath);
  try {
    if (imageUrl) {
      //

      await Script.findByIdAndUpdate(
        scriptId,
        {
          $set: {
            image: imageUrl,
          },
        },
        { new: true }
      );
    }
  } catch (err) {
    res.json({ msg: `err${err}` });
  }
}
export const updateScript = async (req, res) => {
  try {
    const { scriptId } = req.params;
    const { title, description, author, genre, purpose, visibility } = req.body;

    const script = await Book.findById(scriptId);

    if (!script) {
      return res.status(404).json({ msg: "Book not found" });
    }

    if (!script.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to update this book" });
    }

    const updatedScript = await Script.findByIdAndUpdate(
      bscriptId,
      {
        title,
        description,
        author,
        genre,
        purpose,
        visibility,
      },
      { new: true, runValidators: true }
    );

    res.json(updatedScript);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const bookmarkScript = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const userid = req.userId;
    const script = await Script.findById(scriptId);
    if (!script)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(userid);
    if (user.bookmarks.includes(script._id)) {
      //actual way of checking references
      // already bookmarked -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarksScript: script._id } });
      await user.save();
      return res
        .status(200)
        .json({
          type: "unsaved",
          message: "Post removed from bookmark",
          success: true,
        });
    } else {
      // bookmark krna pdega
      await user.updateOne({ $addToSet: { bookmarksScript: script._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
export const searchScriptById = async (req, res) => {
  try {
    const { code } = req.query; // script mongoose id entered by user

    if (!code) {
      return res.status(400).json({ msg: "Script code is required" });
    }

    const script = await Book.findById(code);

    if (!script) {
      return res.status(404).json({ msg: "script not found" });
    }

    res.json({
      success: true,
      script,
    });
  } catch (err) {
    // Invalid ObjectId format error handled here
    res.status(500).json({ error: "Invalid script code" });
  }
};

