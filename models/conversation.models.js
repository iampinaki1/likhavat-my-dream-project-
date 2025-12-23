import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    paticipants:{type:mongoose.SchemaTypes.ObjectId,
        ref:"User"
    },
    message:{type:mongoose.Schema.ObjectId, ref:"Message"},

})
const Conversation = mongoose.model("Conversation",conversationSchema)
export default Conversation