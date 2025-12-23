import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    senderId:{type:mongoose.SchemaTypes.ObjectId, ref :'User'},
    senderId:{type:mongoose.SchemaTypes.ObjectId, ref :'User'},
    message:{type:String,required:true},

});
 const Message = mongoose.model("Message",messageSchema)
 export default Message
