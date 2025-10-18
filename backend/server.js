import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import settingsRoutes from "./routes/settings.route.js";
import reviewRoutes from "./routes/review.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// ===== إعداد CORS محسن =====
app.use(cors({
  origin: [
    "https://zoubir-trends.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000", // أضيف للتنمية
  ],
  credentials: true, // غير إلى true إذا كنت تستخدم cookies/authentication
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// معالجة طلبات OPTIONS مسبقاً
app.options("*", cors());

// ===== Middleware =====
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);

// ===== endpoints للفحص =====
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ===== خدمة الـ frontend =====
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

// ===== معالجة الأخطاء =====
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    success: false,
    message: "Internal server error"
  });
});

// ===== تشغيل السيرفر =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${[
    "https://zoubir-trends.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ].join(", ")}`);
  connectDB();
});