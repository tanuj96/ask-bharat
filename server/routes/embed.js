import express from 'express';
import Customization from '../models/Customization.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const customization = await Customization.findOne({ chatbotId });

    if (!customization) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const embedCode = `
      <div id="chatbot-container-${chatbotId}"></div>
      <script>
        (function() {
          const container = document.getElementById('chatbot-container-${chatbotId}');
          const iframe = document.createElement('iframe');
          iframe.src = 'http://yourdomain.com/embed-window/${chatbotId}';
          iframe.style.border = 'none';
          iframe.style.width = '${customization.chatWidth}';
          iframe.style.height = '${customization.chatHeight}';
          iframe.style.position = 'fixed';
          iframe.style.${customization.position.includes('right') ? 'right' : 'left'} = '20px';
          iframe.style.bottom = '20px';
          iframe.style.zIndex = '1000';
          iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          container.appendChild(iframe);
        })();
      </script>
    `;

    res.json({
      success: true,
      embedCode,
      chatbotId,
      customization
    });
  } catch (error) {
    console.error('Embed error:', error);
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
});

router.get('/window/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const customization = await Customization.findOne({ chatbotId });

    if (!customization) {
      return res.status(404).send('Chatbot not found');
    }

    // Here you would render your chat window HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${customization.businessName} Chatbot</title>
          <style>
            body { margin: 0; font-family: ${customization.fontFamily}; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.chatbotConfig = ${JSON.stringify(customization)};
            // Load your chat window script here
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error loading chatbot');
  }
});

export default router;