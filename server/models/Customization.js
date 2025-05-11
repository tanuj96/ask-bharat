import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const customizationSchema = new mongoose.Schema({
  chatbotId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: String,
  businessDocumentPath: String,
  logoPath: String,
  iconPath: String,
  primaryColor: {
    type: String,
    default: '#2563EB'
  },
  secondaryColor: {
    type: String,
    default: '#FFFFFF'
  },
  fontFamily: {
    type: String,
    default: 'Arial'
  },
  chatHeight: {
    type: String,
    default: '500px'
  },
  chatWidth: {
    type: String,
    default: '350px'
  },
  position: {
    type: String,
    enum: ['bottom-right', 'bottom-left'],
    default: 'bottom-right'
  },
  welcomeMessage: {
    type: String,
    default: 'Hi! How can I help you today?'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

customizationSchema.index({ owner: 1 });
customizationSchema.index({ chatbotId: 1 }, { unique: true });

customizationSchema.virtual('embedUrl').get(function() {
  return `${process.env.FRONTEND_URL}/embed/${this.chatbotId}`;
});

export default mongoose.model('Customization', customizationSchema);