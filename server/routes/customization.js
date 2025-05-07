import express from 'express';
import multer from 'multer';
import { addDocumentToStore } from '../langchain/vectorStore.js';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import Customization from '../models/Customization.js';
import auth from '../middlewares/auth.js';
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();


router.get('/', auth, async (req, res) => {
  console.log(req)
  try {
    const customizations = await Customization.find({ owner: req.user._id });
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customizations" });
  }
});

// Add this new route before the export
router.get('/:chatbotId', auth, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    
    // Verify user owns this chatbot
    const customization = await Customization.findOne({
      chatbotId,
      owner: req.user._id
    });

    if (!customization) {
      return res.status(404).json({ error: "Customization not found or unauthorized access" });
    }

    res.json(customization);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customization" });
  }
});

router.post('/', auth, upload.fields([
  { name: 'businessDocument', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      businessName,
      primaryColor = '#2563EB',
      secondaryColor = '#FFFFFF',
      fontFamily = 'Arial',
      chatHeight = '500px',
      chatWidth = '350px',
      position = 'bottom-right',
      welcomeMessage = 'Hi! How can I help you today?'
    } = req.body;

    const businessDocFile = req.files['businessDocument']?.[0];
    if (!businessDocFile) {
      return res.status(400).json({ error: 'Business document is required' });
    }

    // Process PDF
    const pdfBuffer = fs.readFileSync(businessDocFile.path);
    const pdfData = await pdfParse(pdfBuffer);
    const documentText = pdfData.text;

    // Generate unique chatbot ID
    const chatbotId = uuidv4();

    // Save to vector store with metadata
    await addDocumentToStore(documentText, { 
      businessName,
      chatbotId,
      ownerId: req.user._id.toString()
    });

    // Create customization record
    const customization = new Customization({
      owner: req.user._id,
      chatbotId,
      businessName,
      businessDocumentPath: businessDocFile.path,
      logoPath: req.files['logo']?.[0]?.path,
      iconPath: req.files['icon']?.[0]?.path,
      primaryColor,
      secondaryColor,
      fontFamily,
      chatHeight,
      chatWidth,
      position,
      welcomeMessage
    });

    await customization.save();

    // Add to user's businesses
    req.user.businesses.push(customization._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      chatbotId,
      embedCode: generateEmbedCode(chatbotId, customization),
      message: "Chatbot created successfully"
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Failed to create chatbot" });
  }
});

function generateEmbedCode(chatbotId, customization) {
  return `
    <iframe 
      src="${FRONTEND_URL}/embed/${chatbotId}"
      width="${customization.chatWidth}"
      height="${customization.chatHeight}"
      style="
        border: none;
        position: fixed;
        ${customization.position.includes('right') ? 'right' : 'left'}: 20px;
        bottom: 20px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      "
    ></iframe>
  `;
}

export default router;