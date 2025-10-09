import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const totalProducts = await Product.countDocuments();

		const products = await Product.find().skip(skip).limit(limit).lean();

		res.json({
			products,
			currentPage: page,
			totalPages: Math.ceil(totalProducts / limit),
			totalProducts,
		});
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const searchProduct = async (req, res) => {
  try {
    const searchTerm = req.query.q || "";
    if (!searchTerm.trim()) return res.json([]);

    const products = await Product.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .limit(10)
      .lean();

    const formatted = products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.priceAfterDiscount ?? p.priceBeforeDiscount,
      image: p.images?.[0] || "",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error in searchProduct:", error);
    res.status(500).json({ message: "Error searching products" });
  }
};

export const getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).lean();
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		res.json(product);
	} catch (error) {
		console.log("Error in getProductById controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		const featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts || featuredProducts.length === 0) {
			return res.status(404).json({ message: "No featured products found" });
		}

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      priceBeforeDiscount,
      priceAfterDiscount,
      images,
      category,
      sizes,
      colors,
    } = req.body;

    // تحقق من الحقول الإلزامية
    if (!name || !priceBeforeDiscount || !images || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // رفع الصور إذا كانت Base64
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (let img of images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          const uploadRes = await cloudinary.uploader.upload(img, {
            folder: "products",
          });
          uploadedImages.push(uploadRes.secure_url);
        } else {
          uploadedImages.push(img);
        }
      }
    }

    const product = new Product({
      name,
      description,
      priceBeforeDiscount: Number(priceBeforeDiscount),
      priceAfterDiscount: Number(priceAfterDiscount) || null,
      images: uploadedImages,
      category,
      sizes: sizes || [],
      colors: colors || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
	console.error("❌ Error in createProduct controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// حذف منتج
export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// حذف الصورة من Cloudinary
		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("Deleted image from Cloudinary");
			} catch (error) {
				console.log("Error deleting image from Cloudinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $lookup: {
          from: "reviews",          // اسم الكولكشن في MongoDB
          localField: "_id",
          foreignField: "product",
          as: "reviews"
        }
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          numReviews: { $size: "$reviews" }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          images: 1,
          priceBeforeDiscount: 1,
          priceAfterDiscount: 1,
          averageRating: { $ifNull: ["$averageRating", 0] },
          numReviews: 1
        }
      }
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category }).lean();
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      priceBeforeDiscount,
      priceAfterDiscount,
      images,
      category,
      sizes,
      colors,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // إذا كان هناك صور جديدة يتم رفعها
    let uploadedImages = product.images; // احتفظ بالقديمة افتراضياً
    if (images && Array.isArray(images) && images.length > 0) {
      uploadedImages = [];
      for (const img of images) {
        // إذا كانت الصورة Base64 أو رابط مؤقت يتم رفعها
        if (img.startsWith("data:image")) {
          const response = await cloudinary.uploader.upload(img, {
            folder: "products",
          });
          uploadedImages.push(response.secure_url);
        } else {
          // إذا كانت رابط جاهز (مثلاً عند الإبقاء على الصور القديمة)
          uploadedImages.push(img);
        }
      }
    }

    product.name = name ?? product.name;
	product.description = description ?? product.description;
	product.priceBeforeDiscount = priceBeforeDiscount ?? product.priceBeforeDiscount;

	if (priceAfterDiscount === null) {
		product.priceAfterDiscount = undefined; // حذف التخفيض
	} else if (priceAfterDiscount !== undefined) {
		product.priceAfterDiscount = priceAfterDiscount;
	}


	product.images = uploadedImages;
	product.category = category ?? product.category;
	product.sizes = sizes ?? product.sizes;
	product.colors = colors ?? product.colors;

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
