import express from "express";
import Message from "../models/Message.js";
import { chatModel } from "../langchain/ollamachat.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

export default router;
