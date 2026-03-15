import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

// Get conversations for a user (cursor-based, most recently updated first)
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { lastUpdated } = req.query;
    const LIMIT = 15;

    const filter = { participants: userId };
    if (lastUpdated) {
      filter.updatedAt = { $lt: new Date(lastUpdated) };
    }

    const conversations = await Conversation.find(filter)
      .populate("participants", "username profilePic")
      .populate({
        path: "messages",
        options: { limit: 1, sort: { createdAt: -1 } },
      })
      .sort({ updatedAt: -1 })
      .limit(LIMIT)
      .lean();

    res.status(200).json({
      success: true,
      conversations,
      nextCursor: conversations.length === LIMIT
        ? conversations[conversations.length - 1].updatedAt
        : null,
    });
  } catch (error) {
    console.log("Error in getConversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a conversation (cursor-based, newest first)
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lastId } = req.query;
    const currentUserId = req.userId;
    const LIMIT = 20;

    const filter = {
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    };

    if (lastId) {
      filter._id = { $lt: lastId };
    }

    const messages = await Message.find(filter)
      .populate("senderId", "username profilePic")
      .populate("receiverId", "username profilePic")
      .sort({ _id: -1 })
      .limit(LIMIT)
      .lean();

    // Return newest-first; frontend will reverse for display
    res.status(200).json({
      success: true,
      messages,
      nextCursor: messages.length === LIMIT ? messages[messages.length - 1]._id : null,
    });
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
