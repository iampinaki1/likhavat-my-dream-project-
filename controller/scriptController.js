//it is returns with params of each script
import Script from "../models/script.models.js";
import scriptVersion from "../models/scriptVersion.models.js";
import User from "../models/user.models.js";
import { Comment } from "../models/comment.models.js";
import ScriptRequestAccess from "../models/scriptAccessRequest.model.js";
import upload from "../utils/cloudinary.js";
import mongoose from "mongoose";

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
        { new: true },
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
    const { title, description, genre, purpose, visibility } = req.body;
    const author = req.userId;

    // Map 'private' from frontend to 'restricted' enum in the model
    const normalizedVisibility =
      visibility === "private" ? "restricted" : visibility || "restricted";

    const script = new Script({
      title,
      description,
      author,
      genre,
      purpose,
      visibility: normalizedVisibility,
    });
    await script.save();

    // Initialize an empty first draft!
    const initialVersion = new scriptVersion({
      body: "Start writing your script here...",
      editedBy: author,
    });
    await initialVersion.save();

    // Bind this version to the script 
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
        { new: true },
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
      .limit(10);

    res.json({
      success: true,
      scripts,
      nextCursor: scripts.length > 0 ? scripts[scripts.length - 1]._id : null,
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
        { new: true },
      );
    }
  } catch (err) {
    res.json({ msg: `err${err}` });
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
    const { codee } = req.query; // script mongoose id entered by user//bad me nanoid
    const code = new mongoose.Types.ObjectId(codee)
    if (!code) {
      return res.status(400).json({ msg: "Script code is required" });
    }

    const script = await Script.findById(code)
      .populate("author", "username profilePic")
      .populate({
        path: "edits",
        model: "scriptVersion"
      });

    if (!script) {
      return res.status(404).json({ msg: "script not found" });
    }

    res.json({
      success: true,
      script,
    });
  } catch (err) {
    // Invalid ObjectId format error handled here
    res.status(500).json({ error: `Invalid :${err}` });
  }
};
