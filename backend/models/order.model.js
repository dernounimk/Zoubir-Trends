import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			require: true,
			unique: true
		},
		fullName: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		wilaya: {
			type: String,
			required: true,
		},
		baladia: {
			type: String,
			required: true,
		},
		deliveryPlace: {
			type: String,
			enum: ["home", "office"],
			required: true,
		},
		deliveryPrice: {
			type: Number,
			required: true,
		},
		products: [
		{
			product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
			quantity: { type: Number, required: true, min: 1 },
			price: { type: Number, required: true, min: 0 },
			selectedColor: { type: String },
			selectedSize: { type: String },
		}
		],
		note: {
			type: String,
			default: "",
		},
		coupon: {
			code: { type: String },
			discountAmount: { type: Number },
		},
		isConfirmed: {
			type: Boolean,
			default: false,
			required: true
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		deliveryPhone: {
			type: String
		},
		isAskForPhone: {
			type: Boolean,
			default: false
		},
		confirmedAt: {
			type: Date,
			default: null
		}
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
