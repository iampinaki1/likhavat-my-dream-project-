import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilePic")
      .populate({
        path: "messages",
        options: { limit: 1, sort: { createdAt: -1 } },
      })
      .sort({ updatedAt: -1 });

    if (!conversations) {
      return res.status(404).json({ msg: "No conversations found" });
    }

    res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in getConversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // Check if current user is following the other user
    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(
      new mongoose.Types.ObjectId(userId)
    );

    if (!isFollowing) {
      return res.status(403).json({
        msg: "You can only message users you are following",
      });
    }

    // Fetch all messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    })
      .populate("senderId", "username profilePic")
      .populate("receiverId", "username profilePic")
      .sort({ createdAt: 1 });

    // Return messages (can be empty array if no messages yet)
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    // Check if sender is following receiver
    const sender = await User.findById(senderId);
    const isFollowing = sender.following.includes(
      new mongoose.Types.ObjectId(receiverId)
    );

    if (!isFollowing) {
      return res.status(403).json({
        msg: "You can only message users you are following",
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      createdAt: new Date(),
    });

    await newMessage.save();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    const populatedMessage = await newMessage.populate(
      "senderId",
      "username profilePic"
    );
    const populatedMessage2 = await populatedMessage.populate(
      "receiverId",
      "username profilePic"
    );

    res.status(201).json(populatedMessage2);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // Delete all messages in the conversation
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    });

    // Delete the conversation
    await Conversation.deleteOne({
      participants: { $all: [currentUserId, userId] },
    });

    res.status(200).json({ msg: "Conversation deleted successfully" });
  } catch (error) {
    console.log("Error in deleteConversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
