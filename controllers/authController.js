import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateAuth } from "../utils/validateAuth.js";

/* OTP GENERATOR */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/*  REGISTER */
export const registerUser = async (req, res) => {
  try {
    const error = validateAuth(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or mobile required" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    let exist = null;

    if (email) {
      exist = await User.findOne({ email: email.toLowerCase() });
    }

    if (!exist && mobile) {
      exist = await User.findOne({ mobile });
    }

    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      email: email ? email.toLowerCase() : undefined,
      mobile: mobile || undefined,
      password: hashed,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const user = await User.findOne({
      ...(email && { email: email.toLowerCase() }),
      ...(mobile && { mobile }),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // password check only first time 
    if (password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong password" });
      }
    }


    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    console.log("OTP:", otp); 

    res.json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*VERIFY OTP  */
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //  OTP VERIFIED → CLEAR
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // JWT TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
