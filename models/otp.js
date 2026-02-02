import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  key: String, // email OR mobile
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: 300, // 5 minutes
  },
});

export default mongoose.model("Otp", otpSchema);
