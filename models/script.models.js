import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    image:{type:String, required:true ,default:"no img"},
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    comments: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User",required:true },
          comment: { type: String ,required:true},
        },
      ],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    genre: {
      // 🎬 Genre field - user can choose one from list
      type: String,
      enum: [
        "Drama",
        "Comedy",
        "Romance",
        "Horror",
        "Thriller",
        "Action",
        "Adventure",
        "Science Fiction",
        "Fantasy",
        "Social Message",
        "Biography",
        "Historical",
      ],
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        "Short Film",
        "Stage Play",
        "YouTube Skit",
        "Advertisement",
        "Educational Video",
        "Awareness Video",
      ],
      required: true,
    },
    // Who can view this content
    visibility: {
      type: String,
      enum: ["public", "restricted"],
      // 'restricted' = selected users only
      default: "restricted",
    }, //Array of allowed user IDs (used only when visibility = 'restricted')

    allowedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    createdAt: { type: Date, default: Date.now },

    edits: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ScriptVersion",
      default: [],
    }, //schema with ref to model
  },

  { timestamps: true }
);


const Script = mongoose.model("Script", scriptSchema);
export default Script