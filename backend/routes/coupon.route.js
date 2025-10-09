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

router.get("/", getCoupon);
router.post("/validate", validateCoupon);
router.post("/create", protectRoute, adminRoute, createCoupon);
router.get("/all", protectRoute, adminRoute, getAllCoupons);
router.patch("/toggle/:id", protectRoute, adminRoute, toggleCouponStatus);
router.delete("/:id", protectRoute, adminRoute, deleteCoupon);

export default router;
