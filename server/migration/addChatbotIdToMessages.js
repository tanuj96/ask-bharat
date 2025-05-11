// migration/addChatbotIdToMessages.js
import mongoose from "mongoose";
import Message from "../models/Message.js";
import Customization from "../models/Customization.js";

async function migrate() {
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  
  // Find all messages without chatbotId and add default
  const result = await Message.updateMany(
    { chatbotId: { $exists: false } },
    { $set: { chatbotId: "legacy-messages" } }
  );
  
  console.log("Migrated messages:", result);
  process.exit();
}

migrate();