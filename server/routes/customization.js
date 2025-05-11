import express from 'express';
import multer from 'multer';
import { addDocumentToStore } from '../langchain/vectorStore.js';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import Customization from '../models/Customization.js';
import auth from '../middlewares/auth.js';
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure multer with enhanced error handling
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'businessDocument' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for business documents'));
    }
    if ((file.fieldname === 'logo' || file.fieldname === 'icon') && 
        !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for logo and icon'));
    }
    cb(null, true);
  }
});

const router = express.Router();

router.get('/', auth, async (req, res) => {
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

// Enhanced middleware chain with error handling
router.post('/', 
  auth, 
  (req, res, next) => {
    console.log('Authenticated user:', req.user?._id);
    next();
  },
  upload.fields([
    { name: 'businessDocument', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      // Debug logging for incoming request
      console.log('Request received with files:', {
        businessDocument: req.files['businessDocument']?.[0]?.originalname,
        logo: req.files['logo']?.[0]?.originalname,
        icon: req.files['icon']?.[0]?.originalname
      });
      console.log('Request body:', req.body);

      const businessDocFile = req.files['businessDocument']?.[0];
      
      if (!businessDocFile) {
        return res.status(400).json({ 
          error: 'Business document is required',
          receivedFiles: Object.keys(req.files || {})
        });
      }

      // Validate required fields with better error messages
      const requiredFields = ['businessName'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          missingFields
        });
      }

      // Process PDF with enhanced error handling
      let documentText;
      try {
        const pdfBuffer = fs.readFileSync(businessDocFile.path);
        console.log(`PDF file loaded (${pdfBuffer.length} bytes)`);
        
        // Attempt parsing with timeout
        const parseWithTimeout = async (buffer, options = {}) => {
          return Promise.race([
            pdfParse(buffer, options),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('PDF parsing timeout')), 10000))
          ]);
        };

        try {
          const pdfData = await parseWithTimeout(pdfBuffer);
          documentText = pdfData.text;
          console.log('PDF parsed successfully. Text length:', documentText.length);
        } catch (firstAttemptError) {
          console.warn('First PDF parse attempt failed, trying alternative parser...');
          const pdfData = await parseWithTimeout(pdfBuffer, {
            version: 'v1.10.100',
            max: 1024 * 1024
          });
          documentText = pdfData.text;
          console.log('Fallback parse successful. Text length:', documentText.length);
        }

        if (!documentText || documentText.trim().length === 0) {
          // Debug: Save the PDF buffer for inspection
          fs.writeFileSync('debug_last_failed_pdf.pdf', pdfBuffer);
          throw new Error('PDF parsed but contains no text');
        }
      } catch (pdfError) {
        console.error('PDF processing failed:', pdfError);
        // Clean up files
        Object.values(req.files).forEach(files => {
          files.forEach(file => fs.unlinkSync(file.path));
        });
        return res.status(400).json({ 
          error: 'PDF processing failed',
          details: pdfError.message,
          suggestion: 'Please try a different PDF file'
        });
      }

      // Generate unique chatbot ID
      const chatbotId = uuidv4();
      console.log('Generated chatbot ID:', chatbotId);

      // Enhanced vector store handling
      try {
        console.log('Attempting to add document to vector store...');
        const vectorStoreResult = await addDocumentToStore(documentText, chatbotId, { 
          businessName: req.body.businessName,
          ownerId: req.user._id.toString()
        });
        console.log('Vector store result:', vectorStoreResult);
      } catch (vectorError) {
        console.error('Vector store error:', {
          message: vectorError.message,
          stack: vectorError.stack
        });
        throw new Error('Knowledge base storage failed');
      }

      // Create and save customization with transaction-like behavior
      let customization;
      try {
        customization = new Customization({
          owner: req.user._id,
          chatbotId,
          businessName: req.body.businessName,
          businessDocumentPath: businessDocFile.path,
          logoPath: req.files['logo']?.[0]?.path,
          iconPath: req.files['icon']?.[0]?.path,
          primaryColor: req.body.primaryColor || '#2563EB',
          secondaryColor: req.body.secondaryColor || '#FFFFFF',
          fontFamily: req.body.fontFamily || 'Arial',
          chatHeight: req.body.chatHeight || '500px',
          chatWidth: req.body.chatWidth || '350px',
          position: req.body.position || 'bottom-right',
          welcomeMessage: req.body.welcomeMessage || 'Hi! How can I help you today?'
        });

        await customization.save();
        console.log('Customization saved:', customization._id);

        // Update user's businesses
        req.user.businesses.push(customization._id);
        await req.user.save();
        console.log('User profile updated');
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Attempt to clean up vector store if possible
        try {
          // You would need to implement this function
          await removeDocumentFromStore(chatbotId);
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
        throw new Error('Database operation failed');
      }

      // Success response
      return res.status(201).json({
        success: true,
        chatbotId,
        embedCode: generateEmbedCode(chatbotId, customization),
        message: "Chatbot created successfully",
        customizationId: customization._id
      });

    } catch (error) {
      console.error('Endpoint error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Clean up any uploaded files
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            if (file?.path && fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      return res.status(500).json({ 
        error: "Chatbot creation failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Add this to your customization routes
router.delete('/:chatbotId', auth, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    
    // Verify user owns this chatbot
    const customization = await Customization.findOneAndDelete({
      chatbotId,
      owner: req.user._id
    });

    if (!customization) {
      return res.status(404).json({ error: "Chatbot not found or unauthorized" });
    }

    // Clean up vector store documents
    await deleteChatbotDocuments(chatbotId);

    res.json({ success: true, message: "Chatbot deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chatbot" });
  }
});

function generateEmbedCode(chatbotId, customization) {
  const positionStyle = customization.position.includes('right') ? 
    'right: 20px;' : 'left: 20px;';
  
  return `
    <iframe 
      src="${FRONTEND_URL}/embed/${chatbotId}"
      width="${customization.chatWidth}"
      height="${customization.chatHeight}"
      style="
        border: none;
        position: fixed;
        ${positionStyle}
        bottom: 20px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        overflow: hidden;
      "
      allow="microphone"
      title="${customization.businessName} Chatbot"
    ></iframe>
  `.trim();
}

export default router;