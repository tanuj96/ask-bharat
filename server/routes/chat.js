import express from "express";
import { chatModel } from "../langchain/ollamachat.js";
import Message from "../models/Message.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("api chat called");

  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    // Prepare the message in the required format
    const messages = [
      {
        role: "user",
        content: message,
      },
    ];

    const userMessage = new Message({
      sender: "Me",
      role: "user",
      content: message,
      timeStamp: Date.now(),
    });
    await userMessage.save();

    // Assuming chatModel.call() works with a list of messages
    const response = await chatModel.call(messages);

    const content = response.content;
    const aiMessage = new Message({
      content: content,
      sender: "BharatBot",
      role: "assistant",
      timeStamp: Date.now(),
    });
    await aiMessage.save();

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
