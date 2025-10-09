import Setting from "../models/setting.model.js";
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import slugify from "slugify";
import cloudinary from "../lib/cloudinary.js";

// دالة رفع الصور إلى Cloudinary
const uploadIfBase64 = async (maybeImage, folder = "categories") => {
  if (!maybeImage) return null;

  // إذا كانت الصورة بصيغة base64
  if (typeof maybeImage === "string" && maybeImage.startsWith("data:image")) {
    const res = await cloudinary.uploader.upload(maybeImage, { folder });
    return { url: res.secure_url, public_id: res.public_id };
  }

  // إذا كانت الصورة رابط مباشر
  return { url: maybeImage, public_id: null };
};

// ------------------------------
// دالة الحصول على الإعدادات
// ------------------------------
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ 
        categories: [], 
        sizes: [], 
        colors: [], 
        delivery: [], 
        orderCalculation: "all" 
      });
    }
    res.json(settings);
  } catch (err) {
    console.error("getSettings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// دالة تحديث الإعدادات
// ------------------------------
export const updateSettings = async (req, res) => {
  try {
    const body = req.body;
    let settings = await Setting.findOne();
    if (!settings) settings = new Setting({ categories: [], sizes: [], colors: [] });

    // --- إضافة تصنيف ---
    if (body.addCategory) {
      const { name } = body.addCategory;
      if (!name) return res.status(400).json({ message: "Category name required" });

      const image = await uploadIfBase64(body.addCategory.imageUrl || body.addCategory.image);
      const slug = slugify(name, { lower: true, strict: true });

      if (settings.categories.some(c => c.slug === slug)) {
        return res.status(400).json({ message: "Category slug exists" });
      }

      settings.categories.push({
        name,
        slug,
        imageUrl: image.url,
        imageId: image.public_id
      });
    }

    // --- إزالة تصنيف ---
    if (body.removeCategoryId) {
      const removedCategory = settings.categories.find(c => String(c._id) === String(body.removeCategoryId));

      if (removedCategory && removedCategory.imageId) {
        try {
          await cloudinary.uploader.destroy(removedCategory.imageId);
          console.log("Category image deleted from Cloudinary:", removedCategory.imageId);
        } catch (err) {
          console.error("Failed to delete category image from Cloudinary:", err);
        }
      }

      settings.categories = settings.categories.filter(c => String(c._id) !== String(body.removeCategoryId));
    }

    // --- إضافة حجم ---
    if (body.addSize) {
      const { name, type } = body.addSize;
      if (name) settings.sizes.push({ name, type: type || "letter" });
    }

    // --- إزالة حجم ---
    if (body.removeSizeId) {
      const removedSize = settings.sizes.find(s => String(s._id) === String(body.removeSizeId));
      if (removedSize) {
        await Product.updateMany(
          { sizes: removedSize.name },
          { $pull: { sizes: removedSize.name } }
        );
        await Order.updateMany(
          { "products.selectedSize": removedSize.name },
          { $set: { "products.$[elem].selectedSize": null } },
          { arrayFilters: [{ "elem.selectedSize": removedSize.name }] }
        );
      }
      settings.sizes = settings.sizes.filter(s => String(s._id) !== String(body.removeSizeId));
    }

    // --- إضافة لون ---
    if (body.addColor) {
      const { name, hex } = body.addColor;
      if (name && hex) settings.colors.push({ name, hex });
    }

    // --- إزالة لون ---
    if (body.removeColorId) {
      const removedColor = settings.colors.find(c => String(c._id) === String(body.removeColorId));
      if (removedColor) {
        await Product.updateMany(
          { colors: removedColor._id },
          { $pull: { colors: removedColor._id } }
        );
        await Order.updateMany(
          { "products.selectedColor": removedColor._id },
          { $set: { "products.$[elem].selectedColor": null } },
          { arrayFilters: [{ "elem.selectedColor": removedColor._id }] }
        );
      }
      settings.colors = settings.colors.filter(c => String(c._id) !== String(body.removeColorId));
    }

    // --- حساب الطلبات ---
    if (body.orderCalculation && ["confirmed", "all"].includes(body.orderCalculation)) {
      settings.orderCalculation = body.orderCalculation;
    }

    // --- إعدادات التوصيل ---
    if (body.delivery && Array.isArray(body.delivery)) {
      settings.delivery = body.delivery.map(item => ({
        state: item.state,
        officePrice: Number(item.officePrice) || 0,
        homePrice: Number(item.homePrice) || 0,
        deliveryDays: Number(item.deliveryDays) || 3
      }));
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("updateSettings:", err);
    res.status(500).json({ message: "Server error" });
  }
};
