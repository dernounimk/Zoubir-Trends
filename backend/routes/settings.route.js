// routes/settings.routes.js
import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", protectRoute, adminRoute, updateSettings); // 🔥 تأكد من أن هذا موجود

export default router;