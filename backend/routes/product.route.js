import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  getRecommendedProducts,
  toggleFeaturedProduct,
  updateProduct,
  searchProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// routes عامة - لا تحتاج مصادقة
router.get("/", getAllProducts);
router.get('/search', searchProduct);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductById);

// routes تحتاج صلاحيات أدمن
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id/toggle-featured", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);

export default router;