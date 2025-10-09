import express from "express";
import { addReview, deleteAllReviews, deleteReviewById, getReviewsByProduct, toggleReviews } from "../controllers/review.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:productId", addReview); // إضافة تقييم
router.get("/:productId", getReviewsByProduct); // عرض التقييمات
router.put("/:productId/toggle-reviews", protectRoute, adminRoute, toggleReviews);
router.delete("/:productId/delete-reviews", protectRoute, adminRoute, deleteAllReviews);
router.delete("/:productId/review/:reviewId", protectRoute, adminRoute, deleteReviewById);

export default router;
