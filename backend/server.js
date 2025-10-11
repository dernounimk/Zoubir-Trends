import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors"; // ⬅️ تأكد من استيراد cors

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import settingsRoutes from "./routes/settings.route.js";
import reviewRoutes from "./routes/review.route.js";
import { connectDB } from "./lib/db.js";

// ⬅️ تحميل environment variables الصحيحة
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// ⬅️ إعدادات CORS محدثة
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    "https://zoubir-trends.vercel.app"
  ],
  credentials: true
}));

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ⬅️ الرواتس
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);

// ⬅️ خدمة ملفات frontend في production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  connectDB();
});
