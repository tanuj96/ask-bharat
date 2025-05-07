import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
  businessDocumentPath: String,
  logoPath: String,
  iconPath: String,
  primaryColor: String,
  secondaryColor: String,
  modelResponse: String
});

export default mongoose.model("Customization", customizationSchema);
