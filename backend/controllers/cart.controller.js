import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
	try {
		const ids = req.query.ids?.split(",") || [];

		if (ids.length === 0) {
			return res.json([]);
		}

		const products = await Product.find({ _id: { $in: ids } });

		res.json(products);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
