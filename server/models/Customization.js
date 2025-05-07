import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
  businessName: String,
  businessDocument: String,
  logo: String,
  icon: String,
  primaryColor: String,
  secondaryColor: String,
  modelResponse: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Customization", customizationSchema);
