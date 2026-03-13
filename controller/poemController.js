import { Poem } from "../models/poem.model.js";

// Create a new poem
export const createPoem = async (req, res) => {
    try {
        const { title, content, subject } = req.body;
        const author = req.userId;

        if (!title || !content) {
            return res.status(400).json({ success: false, msg: "Title and content are required" });
        }

        const newPoem = new Poem({ title, content, subject, author });
        await newPoem.save();

        const populatedPoem = await Poem.findById(newPoem._id).populate('author', 'username profilePic');

        res.status(201).json({ success: true, poem: populatedPoem, msg: "Poem created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Get all poems with pagination
export const getPoems = async (req, res) => {
    try {
        const { author, lastId } = req.query;
        let filter = {};
        if (author) filter.author = author;

        // Cursor pagination
        if (lastId) {
            filter._id = { $lt: lastId };
        }

        const poems = await Poem.find(filter)
            .populate("author", "username profilePic")
            .sort({ _id: -1 })
            .limit(5);

        res.status(200).json({ 
            success: true, 
            poems,
            nextCursor: poems.length > 0 ? poems[poems.length - 1]._id : null
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Get single poem by ID
export const getPoemById = async (req, res) => {
    try {
        const { id } = req.params;
        const poem = await Poem.findById(id).populate("author", "username profilePic");

        if (!poem) return res.status(404).json({ success: false, msg: "Poem not found" });

        res.status(200).json({ success: true, poem });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Load poems of specific user with pagination
export const loadPoemsOfUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { lastId } = req.query;
        
        let filter = { author: userId };
        
        // Cursor pagination
        if (lastId) {
            filter._id = { $lt: lastId };
        }
        
        const poems = await Poem.find(filter)
            .populate("author", "username profilePic")
            .sort({ _id: -1 })
            .limit(5);

        res.status(200).json({ 
            success: true, 
            poems,
            nextCursor: poems.length > 0 ? poems[poems.length - 1]._id : null
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Toggle like
export const toggleLikePoem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const poem = await Poem.findById(id);
        if (!poem) return res.status(404).json({ success: false, msg: "Poem not found" });

        const isLiked = poem.likes.includes(userId);

        if (isLiked) {
            poem.likes = poem.likes.filter((likeId) => likeId.toString() !== userId.toString());
        } else {
            poem.likes.push(userId);
        }

        await poem.save();
        res.status(200).json({ success: true, likes: poem.likes });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Delete poem
export const deletePoem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const poem = await Poem.findById(id);
        if (!poem) return res.status(404).json({ success: false, msg: "Poem not found" });

        if (poem.author.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, msg: "Unauthorized" });
        }

        await Poem.findByIdAndDelete(id);
        res.status(200).json({ success: true, msg: "Poem deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};
