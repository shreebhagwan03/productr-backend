import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  mobile: {
    type: String,
    match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters"],
  },
  otp: String,
  otpExpiry: Date,
});


export default mongoose.model("User", userSchema);
