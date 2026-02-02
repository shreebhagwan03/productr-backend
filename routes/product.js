import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import auth from "../middleware/auth.js";

const router = express.Router();

/* CREATE */
router.post("/",auth, upload.array("images"), async (req, res) => {
  try {
    const { name, type, stock, mrp, price, brand, exchange } = req.body;

    if (!name || !type || !stock || !mrp || !price || !brand || !exchange) {
      return res.status(400).json({ message: "All fields required" });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const product = await Product.create({
      name,
      type,
      stock,
      mrp,
      price,
      brand,
      exchange,
      images: imageUrls,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* READ */
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

/* UPDATE */
router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const updateData = req.body;

    if (req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
      updateData.images = imageUrls;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// TOGGLE PUBLISH / UNPUBLISH
router.patch("/:id/publish", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.isPublished = !product.isPublished;
    await product.save();

    res.json({
      success: true,
      isPublished: product.isPublished,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/status/:type", async (req, res) => {
  const isPublished = req.params.type === "published";
  const products = await Product.find({ isPublished });
  res.json(products);
});

export default router;