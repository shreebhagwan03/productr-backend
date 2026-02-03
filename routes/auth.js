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

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or mobile required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    let query = {};
    if (email) query.email = email.toLowerCase();
    if (mobile) query.mobile = mobile;

    let user = await User.findOne(query);

    /* ===== LOGIN ===== */
    if (type === "login") {
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Wrong password" });
    }

    /* ===== SIGNUP ===== */
    if (type === "signup") {
      if (user)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      user = await User.create({
        email: email?.toLowerCase(),
        mobile,
        password: hashed,
      });
    }

    /* ===== GENERATE OTP ===== */
    const otp = generateOtp();

    user.otp = otp;   
    await user.save();

    /* ===== SEND EMAIL ===== */
    if (email) {
      await sendOtp(email, otp);
    }

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    let query = {};
    if (email) query.email = email.toLowerCase();
    if (mobile) query.mobile = mobile;

    const user = await User.findOne(query);

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // clear OTP after success
    user.otp = null;
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
