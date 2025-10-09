import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		discountAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
