import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, instagram, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ تحقق إذا كانت التقييمات مفعلة
    if (!product.reviewsEnabled) {
      return res.status(403).json({ message: "Reviews are disabled for this product" });
    }

    // ✅ تحقق من Instagram regex
    if (instagram && !/^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/.test(instagram)) {
      return res.status(400).json({ message: "Invalid Instagram username" });
    }

    const review = new Review({
      product: productId,
      name,
      instagram,
      rating,
      comment,
    });

    await review.save();

    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.averageRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // اعكس القيمة
    product.reviewsEnabled = !product.reviewsEnabled;
    await product.save();

    res.json({ 
      message: `Reviews ${product.reviewsEnabled ? "enabled" : "disabled"}`, 
      reviewsEnabled: product.reviewsEnabled 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReviewById = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // احذف التقييم
    await Review.findByIdAndDelete(reviewId);

    // حدث إحصائيات المنتج
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    await product.save();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Review.deleteMany({ product: productId });

    product.numReviews = 0;
    product.averageRating = 0;
    await product.save();

    res.json({ message: "All reviews deleted for this product" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};