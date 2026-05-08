import Script from "../models/script.models.js";
import ScriptVersion from "../models/scriptVersion.models.js";
import User from "../models/user.models.js";
import { Comment } from "../models/comment.models.js";
import ScriptRequestAccess from "../models/scriptAccessRequest.model.js";
import upload from "../utils/cloudinary.js";
import mongoose from "mongoose";

// ─── createNewVersion ────────────────────────────────────────────────────────
// Only the author can create a new version.
// New version body is pre-filled with the latest existing version's body.
export const createNewVersion = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const { body } = req.body;
    const userId = req.userId;

    const script = await Script.findOne({ _id: scriptId, author: userId })
      .populate({ path: "edits", model: "ScriptVersion" });

    if (!script) {
      return res.status(403).json({ msg: "Only the script author can create new versions" });
    }

    // Default body = last version's body so author can build on it
    const lastVersion = script.edits?.[script.edits.length - 1];
    const newBody = body !== undefined ? body : (lastVersion?.body || "");

    const newVersion = new ScriptVersion({
      body: newBody,
      editedBy: userId,
    });
    await newVersion.save();

    script.edits.push(newVersion._id);
    await script.save();

    return res.status(201).json({ success: true, msg: "Version created", version: newVersion });
  } catch (error) {
    console.error("createNewVersion error:", error);
    return res.status(500).json({ msg: `Error: ${error.message}` });
  }
};
export const deleteVersion = async (req, res) => {
  try {
    const { id: scriptId, versionId } = req.params;
    const userid = req.userId;

    const script = await Script.findOne({ _id: scriptId, author: userid });
    if (!script) {
      return res.status(403).json({ msg: "Only the script author can delete versions" });
    }

    await ScriptVersion.findByIdAndDelete(versionId);

    // Remove from script's edits array
    await Script.findByIdAndUpdate(scriptId, { $pull: { edits: versionId } });

    return res.status(200).json({ success: true, msg: "Version deleted" });
  } catch (error) {
    console.error(`deleteVersion error: ${error}`);
    return res.status(500).json({ msg: `error: ${error}` });
  }
};
export const newscript = async (req, res) => {
  try {
    const { title, description, genre, purpose, visibility, coverImage } = req.body;
    const author = req.userId;

    const normalizedVisibility =
      visibility === "private" ? "restricted" : visibility || "restricted";

    const script = new Script({
      title,
      description,
      author,
      genre,
      purpose,
      visibility: normalizedVisibility,
      ...(coverImage && coverImage.trim() ? { image: coverImage.trim() } : {}),
    });
    await script.save();

    const initialVersion = new ScriptVersion({
      body: "",
      editedBy: author,
    });
    await initialVersion.save();

    script.edits.push(initialVersion._id);
    await script.save();

    return res.status(200).json({ msg: `script created`, script });
  } catch (error) {
    console.log(`error:${error}`);
    return res.status(500).json({ msg: `error :${error}` });
  }
};

export const removeScript = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const userid = req.userId;

    const removed = await Script.findOneAndDelete({
      _id: scriptId,
      author: userid,
    });

    if (!removed) {
      return res.status(403).json({ msg: "You are not authorised to delete this script" });
    }

    return res.json({ msg: "deleted" });
  } catch (error) {
    console.error("removeScript error:", error);
    return res.status(500).json({ msg: "error occured" });
  }
};

export const updateVersion = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const { versionId, body } = req.body;
    const userId = req.userId;
    
    // Only the author can update versions
    const script = await Script.findOne({ _id: scriptId, author: userId });
    
    if (!script) {
      return res.status(403).json({ msg: "Only the script author can edit versions" });
    }
    
    const updatedVersion = await ScriptVersion.findByIdAndUpdate(
      versionId,
      { $set: { body, editedBy: userId } },
      { new: true }
    );
    
    if (!updatedVersion) {
      return res.status(404).json({ msg: "Version not found" });
    }
    
    return res.json({ success: true, msg: "Version saved", version: updatedVersion });
  } catch (err) {
    console.error("updateVersion error:", err);
    return res.status(500).json({ msg: "Error occurred" });
  }
};
// const deleteVersion
export const addCommentScripts = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const commentKrneWalaUserKiId = req.userId;

    const { text } = req.body;

    const script = await Script.findById(scriptId);

    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      scriptId: scriptId,
    });

    console.log("Created script comment:", {
      id: comment._id,
      scriptId: comment.scriptId,
      author: comment.author,
    });

    await comment.populate({
      path: "author",
      select: "username profilePic",
    });

    script.comments.push(comment._id);
    await script.save(); // Fix post.save()

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
    const { lastId } = req.query;

    let filter = { scriptId: scriptId };

    if (lastId) {
      filter._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const comments = await Comment.find(filter)
      .populate("author", "username profilePic")
      .sort({ _id: -1 })
      .limit(5);

    return res.status(200).json({ 
      success: true, 
      comments,
      nextCursor: comments.length === 5 ? comments[comments.length - 1]._id : null
    });
  } catch (error) {
    console.log(error);
  }
};

// const likeHandle = async (req, res) => {};
export const getScriptVersion = async (req, res) => {
  try {
    const versionId = req.params.versionId;
    const versionScript = await ScriptVersion.findById(versionId);
    return res.json({ success: true, version: versionScript });
  } catch (error) {
    return res.status(500).json({ message: `error: ${error}` });
  }
};

export const loadScriptsOfUser = async (req, res) => {
  //copied
  try {
    const { lastId, title, onlyMine, bookmarked, author } = req.query;
    let filter = {};

    // Only my scripts (for feeds where user wants their own content)
    if (onlyMine === "true") {
      filter.author = req.userId;
    } else if (author) {
      // Explicit author filter (used on profile page)
      filter.author = author;
    }

    // Visibility rules:
    // - If viewing own scripts (onlyMine=true OR author === req.userId) → show all visibilities
    // - Otherwise (home feed / viewing someone else's profile) → only public scripts
    const isViewingOwn =
      onlyMine === "true" ||
      (author && req.userId && author.toString() === req.userId.toString());

    if (!isViewingOwn) {
      filter.visibility = "public";
    }

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

    const scripts = await Script.find(filter)
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
      scripts,
      nextCursor: scripts.length === 5 ? scripts[scripts.length - 1]._id : null,
    });
  } catch (err) {
    console.error("loadScriptsOfUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new access request for a script
export const requestScriptAccess = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const userId = req.userId;

    const script = await Script.findById(scriptId).populate("author", "username");
    if (!script) {
      return res.status(404).json({ msg: "Script not found" });
    }

    // Author already has full access
    if (script.author.equals(userId)) {
      return res.status(400).json({ msg: "You are the author of this script" });
    }

    // Already in allowed users
    if ((script.allowedUsers || []).some(id => id.equals(userId))) {
      return res.status(400).json({ msg: "You already have access to this script" });
    }

    // Existing pending request
    const existing = await ScriptRequestAccess.findOne({
      sender: userId,
      receiver: scriptId,
      status: "pending",
    });

    if (existing) {
      return res.json({ success: true, msg: "Request already pending" });
    }

    const request = await ScriptRequestAccess.create({
      sender: userId,
      receiver: scriptId,
      status: "pending",
    });

    await request.populate("sender", "username profilePic");

    return res.status(201).json({
      success: true,
      msg: "Access request sent",
      request,
    });
  } catch (error) {
    console.error("requestScriptAccess error:", error);
    return res.status(500).json({ msg: "Failed to send access request" });
  }
};

// List pending access requests for a script (author only)
export const getScriptAccessRequests = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const userId = req.userId;

    const script = await Script.findById(scriptId);
    if (!script) {
      return res.status(404).json({ msg: "Script not found" });
    }

    if (!script.author.equals(userId)) {
      return res.status(403).json({ msg: "You are not allowed to view these requests" });
    }

    const requests = await ScriptRequestAccess.find({
      receiver: scriptId,
      status: "pending",
    }).populate("sender", "username profilePic");

    return res.json({ success: true, requests });
  } catch (error) {
    console.error("getScriptAccessRequests error:", error);
    return res.status(500).json({ msg: "Failed to load access requests" });
  }
};

// Accept / reject a specific access request (by requestId in path)
export const acceptRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const request = await ScriptRequestAccess.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const script = await Script.findById(request.receiver);
    if (!script) {
      return res.status(404).json({ msg: "Script not found" });
    }

    if (!script.author.equals(req.userId)) {
      return res.status(403).json({ msg: "You are not allowed to accept this request" });
    }

    await Script.findByIdAndUpdate(script._id, {
      $addToSet: { allowedUsers: request.sender },
    });

    request.status = "accepted";
    await request.save();

    res.json({ success: true, msg: "Access request accepted" });
  } catch (error) {
    console.error("acceptRequest error:", error);
    return res.status(500).json({ message: `error:${error}` });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const request = await ScriptRequestAccess.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const script = await Script.findById(request.receiver);
    if (!script) {
      return res.status(404).json({ msg: "Script not found" });
    }

    if (!script.author.equals(req.userId)) {
      return res.status(403).json({ msg: "You are not allowed to reject this request" });
    }

    await ScriptRequestAccess.findByIdAndDelete(requestId);
    res.json({ success: true, msg: "Access request rejected" });
  } catch (error) {
    console.error("rejectRequest error:", error);
    return res.status(500).json({ message: `error:${error}` });
  }
};

export async function addPhotoScript(req, res) {
  const { id: scriptId } = req.params;
  const localFilePath = req.file?.path;

  if (!localFilePath) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  try {
    const imageUrl = await upload(localFilePath);
    if (imageUrl) {
      await Script.findByIdAndUpdate(
        scriptId,
        { $set: { image: imageUrl } },
        { new: true }
      );
      return res.json({ success: true, imageUrl });
    }
    return res.status(500).json({ msg: "Upload failed" });
  } catch (err) {
    return res.status(500).json({ msg: `err: ${err}` });
  }
}
export const updateScript = async (req, res) => {
  try {
    const { id } = req.params;
    const scriptId = new mongoose.Types.ObjectId(id);
    const { title, description, author, genre, purpose, visibility } = req.body;

    const script = await Script.findById(scriptId);

    if (!script) {
      return res.status(404).json({ msg: "Script not found" });
    }

    if (!script.author.equals(req.userId)) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to update this script" });
    }

    // Map 'private' from frontend to 'restricted' enum in the model
    const normalizedVisibility =
      visibility === "private" ? "restricted" : visibility;

    const updatedScript = await Script.findByIdAndUpdate(
      scriptId,
      {
        title,
        description,
        author,
        genre,
        purpose,
        ...(normalizedVisibility && { visibility: normalizedVisibility }),
      },
      { new: true, runValidators: true },
    );

    res.json(updatedScript);
  } catch (err) {
    console.error("updateScript error:", err);
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
        .json({ message: "Script not found", success: false });

    const user = await User.findById(userid);
    if (user.bookmarksScript.includes(script._id)) {
      // already bookmarked -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarksScript: script._id } });
      await user.save();
      return res.status(200).json({
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

export const toggleLikeScript = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const userid = req.userId;
    const script = await Script.findById(scriptId);
    if (!script)
      return res
        .status(404)
        .json({ message: "Script not found", success: false });

    if (script.likes.includes(userid)) {
      await script.updateOne({ $pull: { likes: userid } });
      return res.status(200).json({ type: "unliked", message: "Post unliked", success: true });
    } else {
      await script.updateOne({ $addToSet: { likes: userid } });
      return res.status(200).json({ type: "liked", message: "Post liked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
export const searchScriptById = async (req, res) => {
  try {
    const { codee } = req.query;
    const code = new mongoose.Types.ObjectId(codee);
    if (!code) {
      return res.status(400).json({ msg: "Script code is required" });
    }

    const script = await Script.findById(code)
      .populate("author", "username profilePic")
      .populate("allowedUsers", "username profilePic")
      .populate({
        path: "edits",
        model: "ScriptVersion",
        populate: { path: "editedBy", select: "username" }
      });

    if (!script) {
      return res.status(404).json({ msg: "script not found" });
    }

    const userId = req.userId?.toString();
    const authorId = (script.author?._id || script.author)?.toString();
    const isAuthor = userId === authorId;
    const isAllowed = (script.allowedUsers || []).some(u => (u._id || u)?.toString() === userId);

    if (script.visibility === "restricted" && !isAuthor && !isAllowed) {
      return res.status(403).json({ msg: "You do not have access to this script" });
    }

    res.json({ success: true, script });
  } catch (err) {
    res.status(500).json({ error: `Invalid :${err}` });
  }
};
