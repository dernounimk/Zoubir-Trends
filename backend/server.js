import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

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

// ===== إعداد CORS =====
const allowedOrigins = [
  "https://zoubir-trends.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// السماح بطلبات preflight
app.options("*", cors());

// ===== Middleware =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Middleware لمعالجة البيانات غير المعرفة =====
app.use((req, res, next) => {
  // تغليف res.json لمعالجة البيانات undefined
  const originalJson = res.json;
  res.json = function(data) {
    if (data === undefined || data === null) {
      return originalJson.call(this, { 
        success: false, 
        message: "No data returned",
        data: null 
      });
    }
    
    // تنظيف البيانات من undefined values
    const cleanData = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => cleanData(item)).filter(Boolean);
      } else if (obj && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null) {
            cleaned[key] = cleanData(value);
          }
        }
        return cleaned;
      }
      return obj;
    };
    
    const cleanedData = cleanData(data);
    return originalJson.call(this, cleanedData);
  };
  next();
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);

// ===== خدمة ملفات الـ frontend في الإنتاج =====
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
}

// ===== تشغيل السيرفر =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  connectDB();
});