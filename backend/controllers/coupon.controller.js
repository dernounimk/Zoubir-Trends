import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
	try {
		const coupons = await Coupon.find({ isActive: true });

		res.json(coupons);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;
		const coupon = await Coupon.findOne({ code: code, isActive: true });

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountAmount: coupon.discountAmount,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

function generateCouponCode() {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < 7; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export const createCoupon = async (req, res) => {
	try {
		const { discountAmount } = req.body;

		if (!discountAmount) {
			return res.status(400).json({ message: "قم بادخال قيمة كوبون التخفيض" });
		}

		if (Number(discountAmount) <= 0) {
			return res.status(400).json({ message: "أدخل قيمة كوبون صحيحة" });
		}

		let code;
		let exists = true;

		while (exists) {
			code = generateCouponCode();
			exists = await Coupon.findOne({ code });
		}

		const newCoupon = new Coupon({
			code,
			discountAmount,
		});

		await newCoupon.save();

		res.status(201).json({ message: "تم إنشاء الكوبون", coupon: newCoupon });
	} catch (error) {
		console.error("Error in createCoupon:", error.message);
		res.status(500).json({ message: "خطأ في السيرفر" });
	}
};

export const getAllCoupons = async (req, res) => {
	try {
		const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
		res.json(coupons);
	} catch (error) {
		console.error("Error in getAllCoupons:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleCouponStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const coupon = await Coupon.findById(id);

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		coupon.isActive = !coupon.isActive;
		await coupon.save();

		res.json({
			message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`,
			coupon,
		});
	} catch (error) {
		console.error("Error in toggleCouponStatus:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		const coupon = await Coupon.findByIdAndDelete(id);

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		res.json({ message: "Coupon deleted successfully" });
	} catch (error) {
		console.error("Error in deleteCoupon:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};