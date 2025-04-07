import mongoose from 'mongoose';


const VerificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    verificationCode: { type: Number },
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL index
  }, { timestamps: true });
  

export default mongoose.models.Verification || mongoose.model('Verification', VerificationSchema);
