import express from "express";
import multer from "multer";
import { chatModel } from "../langchain/ollamachat.js";
import fs from "fs";
import pdfParse from "pdf-parse";
import Customization from "../models/Customization.js";

// Ensure 'uploads' folder exists
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/", upload.fields([
  { name: 'businessDocument', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), async (req, res) => {
  try {
    const { primaryColor, secondaryColor } = req.body;
    const businessDocFile = req.files['businessDocument'][0];
    const logoFile = req.files['logo'][0];
    const iconFile = req.files['icon'][0];

    // Read and parse PDF content
    const pdfBuffer = fs.readFileSync(businessDocFile.path);
    const pdfData = await pdfParse(pdfBuffer);
    const documentText = pdfData.text;

    // Fine-tune chatbot with document content (Langchain call)
    const messages = [{ role: "user", content: documentText }];
    const response = await chatModel.call(messages);

    // Save customization info into MongoDB
    const customization = new Customization({
      businessDocumentPath: businessDocFile.path,
      logoPath: logoFile.path,
      iconPath: iconFile.path,
      primaryColor,
      secondaryColor,
      modelResponse: response.content
    });

    await customization.save();

    res.json({
      success: true,
      message: "Chatbot customized successfully",
      modelResponse: response.content
    });

  } catch (error) {
    console.error('Customization error:', error);
    res.status(500).json({ error: "Failed to customize chatbot" });
  }
});

export default router;
