import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    default: 'user',
  },
  content: {
    type: String,
    required: true,
  },
  chatbotId: {  // Add this field
    type: String,
    required: true,
    index: true
  },
  owner: {  // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Message", messageSchema);