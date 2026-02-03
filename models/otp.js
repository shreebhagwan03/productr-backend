import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  key: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Otp", otpSchema);
