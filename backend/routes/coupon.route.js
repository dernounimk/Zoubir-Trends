// routes/coupon.route.js
import express from "express";
import {
  createCoupon,
  getCoupon,
  validateCoupon,
  getAllCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔥 تأكد من أن المسارات صحيحة
router.get("/", getCoupon); // GET /api/coupons
router.post("/validate", validateCoupon); // POST /api/coupons/validate
router.post("/create", protectRoute, adminRoute, createCoupon); // POST /api/coupons/create
router.get("/all", protectRoute, adminRoute, getAllCoupons); // GET /api/coupons/all
router.patch("/toggle/:id", protectRoute, adminRoute, toggleCouponStatus); // PATCH /api/coupons/toggle/:id
router.delete("/:id", protectRoute, adminRoute, deleteCoupon); // DELETE /api/coupons/:id

export default router;