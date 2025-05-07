import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messages.js";
import chatRoutes from "./routes/chat.js";
import customizationRoutes from "./routes/customization.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/customize-chatbot", customizationRoutes);


mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`AskBharat Backend Running on port : ${PORT}`)
    )
  )
  .catch((err) => console.error(err));
