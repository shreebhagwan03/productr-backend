import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  key: String, // email OR mobile
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Otp", otpSchema);
