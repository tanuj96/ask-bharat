import express from "express";
import Message from "../models/Message.js";
import Customization from "../models/Customization.js"; // Add this import
import auth from "../middlewares/auth.js"; 

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { chatbotId } = req.query;
    console.log("Fetching messages for chatbot:", chatbotId); // Debug log
    
    if (!chatbotId) {
      return res.status(400).json({ error: "chatbotId is required" });
    }

    // Verify user owns this chatbot
    const ownsChatbot = await Customization.exists({
      chatbotId,
      owner: req.user._id
    });

    if (!ownsChatbot) {
      return res.status(403).json({ error: "Unauthorized access to chatbot" });
    }

    const messages = await Message.find({ chatbotId })
      .sort({ timeStamp: 1 });
    
    console.log("Found messages:", messages.length); // Debug log
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ 
      error: "Failed to fetch messages",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;