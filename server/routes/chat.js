import express from 'express';
import { chatModel } from '../langchain/ollamachat.js';
import Message from '../models/Message.js';
import Customization from '../models/Customization.js';
import { queryVectorStore } from '../langchain/vectorStore.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { message, chatbotId } = req.body;

  if (!message || !chatbotId) {
    return res.status(400).json({ error: "Message and chatbotId are required" });
  }

  try {
    // Verify user owns this chatbot
    const customization = await Customization.findOne({ 
      chatbotId,
      owner: req.user._id
    });

    if (!customization) {
      return res.status(403).json({ error: "Unauthorized access to chatbot" });
    }

    let contextText = "";
    try {
      // Get context from vector store using simplified filter
      const relevantDocs = await queryVectorStore(message, 3, chatbotId);
      contextText = relevantDocs.length > 0
        ? relevantDocs.map(doc => doc.pageContent).join("\n\n")
        : "No relevant context found";
        
      console.log("Context retrieved:", {
        query: message,
        documentsFound: relevantDocs.length,
        chatbotId,
        ownerId: req.user._id.toString()
      });
    } catch (vectorError) {
      console.error("Vector store error (using empty context):", vectorError);
      contextText = "No additional context available";
    }

    // Rest of your existing chat processing logic...
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant for ${customization.businessName}. 
                  Use the following business information to answer questions:
                  ${contextText}`
      },
      {
        role: "user",
        content: message
      }
    ];

    // Save user message
    const userMessage = new Message({
      sender: "user",
      role: "user",
      content: message,
      chatbotId,
      owner: req.user._id,
      timeStamp: Date.now()
    });
    await userMessage.save();

    // Get AI response
    let response;
    try {
      response = await Promise.race([
        chatModel.call(messages),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 30000)
        )
      ]);
    } catch (aiError) {
      console.error("AI Response Error:", aiError);
      return res.status(500).json({ 
        error: "AI service unavailable",
        details: aiError.message 
      });
    }

    // Save AI message
    const aiMessage = new Message({
      content: response.content,
      sender: customization.businessName || "Assistant",
      role: "assistant",
      chatbotId,
      owner: req.user._id,
      timeStamp: Date.now()
    });
    await aiMessage.save();

    res.json({
      content: response.content,
      sender: customization.businessName || "Assistant",
      role: "assistant",
      timeStamp: Date.now()
    });

  } catch (err) {
    console.error("Chat Error:", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      error: "Failed to process chat request",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


export default router;