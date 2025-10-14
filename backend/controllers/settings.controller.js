import Setting from "../models/setting.model.js";
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import slugify from "slugify";
import cloudinary from "../lib/cloudinary.js";

// دالة رفع الصور إلى Cloudinary
const uploadIfBase64 = async (maybeImage, folder = "categories") => {
  if (!maybeImage) return null;

  try {
    // إذا كانت الصورة بصيغة base64
    if (typeof maybeImage === "string" && maybeImage.startsWith("data:image")) {
      const res = await cloudinary.uploader.upload(maybeImage, { folder });
      return { url: res.secure_url, public_id: res.public_id };
    }

    // إذا كانت الصورة رابط مباشر
    return { url: maybeImage, public_id: null };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return null;
  }
};

// قائمة ولايات الجزائر
const ALGERIAN_WILAYAS = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
  "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
  "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
  "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
  "31 - وهران", "32 - البيض", "33 - إيليزي", "34 - برج بوعريريج", "35 - بومرداس",
  "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة",
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
  "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - المغير",
  "50 - المنيعة", "51 - أولاد جلال", "52 - برج باجي مختار", "53 - بني عباس",
  "54 - تيميمون", "55 - توقرت", "56 - جانت", "57 - عين صالح", "58 - عين قزام"
];

// القيم الافتراضية لأسعار التوصيل
const DEFAULT_HOME_PRICE = 600;   // التوصيل للمنزل
const DEFAULT_OFFICE_PRICE = 400; // التوصيل للمكتب

// backend/controllers/settings.controller.js
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    console.log('🔧 Database Settings:', settings); // أضف هذا السطر

    if (!settings) {
      // إنشاء إعدادات افتراضية
      const deliveryList = ALGERIAN_WILAYAS.map(state => ({
        state,
        officePrice: DEFAULT_OFFICE_PRICE,
        homePrice: DEFAULT_HOME_PRICE,
        deliveryDays: 3
      }));

      settings = await Setting.create({
        categories: [],
        sizes: [],
        colors: [],
        delivery: deliveryList,
        orderCalculation: "all"
      });
    }

    // 🔥 تأكد من أن جميع الحقول موجودة
    const responseData = {
      success: true,
      categories: settings.categories || [],
      sizes: settings.sizes || [],
      colors: settings.colors || [],
      delivery: settings.delivery || [],
      orderCalculation: settings.orderCalculation || "all"
    };
    
        console.log('📤 Sending Settings Response:', responseData); // أضف هذا السطر
    res.json(responseData);

  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error loading settings",
      categories: [], // 🔥 ارجع مصفوفات فارغة بدلاً من undefined
      sizes: [],
      colors: [],
      delivery: [],
      orderCalculation: "all"
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const body = req.body;
    let settings = await Setting.findOne();
    
    if (!settings) {
      // إنشاء إعدادات جديدة إذا لم تكن موجودة
      const deliveryList = ALGERIAN_WILAYAS.map(state => ({
        state,
        officePrice: DEFAULT_OFFICE_PRICE,
        homePrice: DEFAULT_HOME_PRICE,
        deliveryDays: 3
      }));

      settings = await Setting.create({
        categories: [],
        sizes: [],
        colors: [],
        delivery: deliveryList,
        orderCalculation: "all"
      });
    }

    // --- إضافة تصنيف ---
    if (body.addCategory) {
      const { name } = body.addCategory;
      if (!name) {
        return res.status(400).json({ 
          success: false,
          message: "Category name required" 
        });
      }

      const image = await uploadIfBase64(body.addCategory.imageUrl || body.addCategory.image);
      const slug = slugify(name, { lower: true, strict: true });

      if (settings.categories.some(c => c.slug === slug)) {
        return res.status(400).json({ 
          success: false,
          message: "Category slug exists" 
        });
      }

      settings.categories.push({
        name,
        slug,
        imageUrl: image?.url || "",
        imageId: image?.public_id || null
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
      if (name) {
        settings.sizes.push({ 
          name, 
          type: type || "letter" 
        });
      }
    }

    // --- إزالة حجم ---
    if (body.removeSizeId) {
      const removedSize = settings.sizes.find(s => String(s._id) === String(body.removeSizeId));
      if (removedSize) {
        try {
          await Product.updateMany(
            { sizes: removedSize.name },
            { $pull: { sizes: removedSize.name } }
          );
          await Order.updateMany(
            { "products.selectedSize": removedSize.name },
            { $set: { "products.$[elem].selectedSize": null } },
            { arrayFilters: [{ "elem.selectedSize": removedSize.name }] }
          );
        } catch (error) {
          console.error("Error removing size from products/orders:", error);
        }
      }
      settings.sizes = settings.sizes.filter(s => String(s._id) !== String(body.removeSizeId));
    }

    // --- إضافة لون ---
    if (body.addColor) {
      const { name, hex } = body.addColor;
      if (name && hex) {
        settings.colors.push({ name, hex });
      }
    }

    // --- إزالة لون ---
    if (body.removeColorId) {
      const removedColor = settings.colors.find(c => String(c._id) === String(body.removeColorId));
      if (removedColor) {
        try {
          await Product.updateMany(
            { colors: removedColor.name },
            { $pull: { colors: removedColor.name } }
          );
          await Order.updateMany(
            { "products.selectedColor": removedColor.name },
            { $set: { "products.$[elem].selectedColor": null } },
            { arrayFilters: [{ "elem.selectedColor": removedColor.name }] }
          );
        } catch (error) {
          console.error("Error removing color from products/orders:", error);
        }
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
        state: item.state || "",
        officePrice: Number(item.officePrice) || 0,
        homePrice: Number(item.homePrice) || 0,
        deliveryDays: Number(item.deliveryDays) || 3
      }));
    }

    await settings.save();

    // إرجاع البيانات مع الهيكل الصحيح
    const responseData = {
      success: true,
      categories: settings.categories || [],
      sizes: settings.sizes || [],
      colors: settings.colors || [],
      delivery: settings.delivery || [],
      orderCalculation: settings.orderCalculation || "all"
    };

    res.json(responseData);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error updating settings" 
    });
  }
};