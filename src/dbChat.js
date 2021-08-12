import mongoose from "mongoose";

const chatDataSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received:Boolean
});

export default mongoose.model('chatdatas',chatDataSchema);
