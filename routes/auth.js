import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendOtp from "../utils/sendOtp.js";

const router = express.Router();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { email, mobile, password, type } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password required" });

    let query = {};
    if (email) query.email = email;
    if (mobile) query.mobile = mobile;

    const user = await User.findOne(query);

    /* ================= LOGIN ================= */
    if (type === "login") {
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Wrong password" });

      // Generate OTP ONLY for login
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP only if email exists
      if (email) {
        await sendOtp(email, otp);
      }

      return res.json({
        success: true,
        message: "OTP sent successfully",
      });
    }

    /* ================= SIGNUP ================= */
    if (type === "signup") {
      if (user)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        email,
        mobile,
        password: hashed,
      });

      // NO OTP HERE
      return res.json({
        success: true,
        message: "Signup successful. Please login.",
      });
    }

    res.status(400).json({ message: "Invalid request type" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    let query = {};
    if (email) query.email = email;
    if (mobile) query.mobile = mobile;

    const user = await User.findOne(query);

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
