import express from "express";
import { chatModel } from "../langchain/ollamachat.js";
import Message from "../models/Message.js";
import Customization from "../models/Customization.js";
import { createChromaStore } from "../langchain/vectorStore.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("api chat called");

  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    // Step 1: Fetch the customization for context
    const customization = await Customization.findOne().sort({ _id: -1 });

    // Step 2: Create Chroma store and perform similarity search
    const store = await createChromaStore();
    const relevantDocs = await store.similaritySearch(message, 3);  // top 3 matches
    const contextText = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    // Step 3: Build the system prompt using context and message
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant for business support. Use the following business document info to answer the user's question:\n\n${contextText}`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Step 4: Save user message to MongoDB
    const userMessage = new Message({
      sender: "Me",
      role: "user",
      content: message,
      timeStamp: Date.now(),
    });
    await userMessage.save();

    // Step 5: Call the chatbot model with the context and user message
    const response = await chatModel.call(messages);

    const content = response.content;
    const aiMessage = new Message({
      content: content,
      sender: "BharatBot",
      role: "assistant",
      timeStamp: Date.now(),
    });
    await aiMessage.save();

    // Step 6: Send response to the client
    res.json({
      content: content,
      sender: "BharatBot",
      role: "assistant",
      timeStamp: Date.now(),
    });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
