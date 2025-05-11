import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messages.js";
import chatRoutes from "./routes/chat.js";
import customizationRoutes from "./routes/customization.js";
import authRoutes from "./routes/auth.js";
import embedRoutes from "./routes/embed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.PRODUCTION_CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/customize-chatbot", customizationRoutes);
app.use("/api/customization", customizationRoutes);
app.use("/api/embed", embedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.errors 
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ 
      error: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));