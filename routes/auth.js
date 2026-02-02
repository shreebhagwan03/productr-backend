import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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


    // LOGIN
    if (type === "login") {
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Wrong password" });
    }

    //  SIGNUP
    if (type === "signup") {
      if (user)
        return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);


    if (type === "signup") {
      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        email,
        mobile,
        password: hashed,
        otp,
        otpExpiry,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    console.log("OTP:", otp);

    res.json({ success: true });
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
  return res.status(400).json({ message: "Invalid OTP" });
}


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
router.post("/resend-otp", async (req, res) => {
  const { email, mobile } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { mobile }],
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  console.log("New OTP:", otp);

  res.json({ success: true });
});


export default router;
