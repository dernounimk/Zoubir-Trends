import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // 🔥 استخدم axios المخصصة
import { useTranslation } from "react-i18next";

const CreateProductForm = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
  
  // بيانات النموذج
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    priceBefore: "",
    priceAfter: null,
    category: "",
    sizes: [],
    colors: [],
    images: [],
  });

  // بيانات الخيارات من السيرفر
  const [categories, setCategories] = useState([]);
  const [sizesLetters, setSizesLetters] = useState([]);
  const [sizesNumbers, setSizesNumbers] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  // عرض مقاسات أرقام أو حروف
  const [showNumbers, setShowNumbers] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // تحميل الخيارات عند أول تحميل
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        console.log("🔄 جلب الإعدادات...");
        
        // 🔥 استخدم axios المخصصة بدون /api
        const res = await axios.get("/settings");
        const data = res.data;
        
        console.log("📊 البيانات المستلمة من /api/settings:", data);
        console.log("🔍 تفاصيل categories:", data.categories);
        console.log("🔍 تفاصيل sizes:", data.sizes);
        console.log("🔍 تفاصيل colors:", data.colors);

        // 🔥 إصلاح: معالجة القيم غير المعرفة
        const safeSizes = Array.isArray(data.sizes) ? data.sizes : [];
        const safeCategories = Array.isArray(data.categories) ? data.categories : [];
        const safeColors = Array.isArray(data.colors) ? data.colors : [];

        console.log("🛡️ البيانات الآمنة:", {
          safeCategories: safeCategories.length,
          safeSizes: safeSizes.length,
          safeColors: safeColors.length
        });

        setCategories(safeCategories);
        
        // 🔥 تصفية المقاسات بشكل صحيح
        const letters = safeSizes
          .filter(s => s && s.type === "letter" && s.name)
          .map(s => s.name)
          .filter(Boolean);
        
        const numbers = safeSizes
          .filter(s => s && s.type === "number" && s.name)
          .map(s => s.name)
          .filter(Boolean);
        
        setSizesLetters(letters);
        setSizesNumbers(numbers);
        setColorsList(safeColors);

        console.log("🎯 البيانات بعد المعالجة:", {
          categories: safeCategories.length,
          sizesLetters: letters.length,
          sizesNumbers: numbers.length,
          colorsList: safeColors.length
        });

        // تعيين أول فئة بشكل افتراضي فقط إذا كانت موجودة
        if (safeCategories.length > 0) {
          const firstCategory = safeCategories[0];
          console.log("🏷️ الفئة الأولى:", firstCategory);
          
          setNewProduct((prev) => ({ 
            ...prev, 
            category: firstCategory._id || firstCategory 
          }));
        } else {
          console.log("⚠️ لا توجد فئات متاحة");
          setNewProduct((prev) => ({ 
            ...prev, 
            category: "" 
          }));
        }

      } catch (error) {
        console.error("❌ خطأ في جلب الإعدادات:", error);
        console.error("تفاصيل الخطأ:", error.response?.data || error.message);
        
        toast.error(t("productForm.errors.loadSettings"));
        
        // 🔥 تعيين قيم افتراضية فارغة في حالة الخطأ
        setCategories([]);
        setSizesLetters([]);
        setSizesNumbers([]);
        setColorsList([]);
        setNewProduct((prev) => ({ ...prev, category: "" }));
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [t]);
  
  const toggleSelection = (field, value) => {
    setNewProduct((prev) => {
      if (field === 'colors') {
        // التعامل مع الألوان ككائنات
        const exists = prev.colors.some(c => 
          (typeof c === 'object' && c._id === value._id) || 
          (typeof c === 'string' && c === value._id)
        );
        
        if (exists) {
          return { 
            ...prev, 
            colors: prev.colors.filter(c => 
              (typeof c === 'object' ? c._id !== value._id : c !== value._id)
            ) 
          };
        } else {
          return { ...prev, colors: [...prev.colors, value] };
        }
      } else {
        // التعامل مع المقاسات كنصوص
        if (prev[field].includes(value)) {
          return { ...prev, [field]: prev[field].filter(item => item !== value) };
        } else {
          return { ...prev, [field]: [...prev[field], value] };
        }
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      toast.error(t("productForm.errors.maxImages"));
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(t("productForm.errors.invalidImage"));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.onerror = () => {
        toast.error(t("productForm.errors.imageReadError"));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من الصحة
    if (!newProduct.name.trim()) {
      toast.error(t("productForm.errors.name"));
      return;
    }
    
    if (!newProduct.priceBefore || isNaN(newProduct.priceBefore) || parseFloat(newProduct.priceBefore) <= 0) {
      toast.error(t("productForm.errors.priceBefore"));
      return;
    }
    
    if (newProduct.priceAfter && (
      isNaN(newProduct.priceAfter) || 
      parseFloat(newProduct.priceAfter) >= parseFloat(newProduct.priceBefore)
    )) {
      toast.error(t("productForm.errors.priceAfter"));
      return;
    }
    
    if (!newProduct.category) {
      toast.error(t("productForm.errors.category"));
      return;
    }
    
    if (newProduct.images.length < 1) {
      toast.error(t("productForm.errors.images"));
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 إنشاء المنتج...", newProduct);
      
      // إرسال بيانات المنتج إلى API
      await axios.post("/products", {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        priceBeforeDiscount: parseFloat(newProduct.priceBefore),
        priceAfterDiscount: newProduct.priceAfter ? parseFloat(newProduct.priceAfter) : null,
        category: typeof newProduct.category === 'object' ? newProduct.category._id : newProduct.category,
        sizes: newProduct.sizes,
        colors: newProduct.colors.map(c => typeof c === 'object' ? c._id : c),
        images: newProduct.images,
      });

      toast.success(t("productForm.success"));

      // إعادة تعيين النموذج
      setNewProduct({
        name: "",
        description: "",
        priceBefore: "",
        priceAfter: "",
        category: categories.length > 0 ? (categories[0]._id || categories[0]) : "",
        sizes: [],
        colors: [],
        images: [],
      });
      
    } catch (err) {
      console.error("❌ Error creating product:", err);
      const errorMessage = err.response?.data?.message || t("productForm.errors.create");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 عرض loading أثناء جلب البيانات
  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <span className={`${isRTL ? 'mr-3' : 'ml-3'}`}>{t("loading") || "جاري التحميل..."}</span>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] shadow-lg rounded-lg p-8 mb-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[var(--color-accent)]">{t("productForm.title")}</h2>

      {/* 🔥 إضافة عرض للمعلومات التشخيصية */}
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          <strong>التشخيص:</strong> {categories.length} فئة متاحة
        </p>
        <p className="text-sm text-yellow-800">
          الفئة المحددة: {newProduct.category || "لم يتم التحديد"}
        </p>
        <p className="text-sm text-yellow-800">
          الأحرف: {sizesLetters.length} | الأرقام: {sizesNumbers.length} | الألوان: {colorsList.length}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* الاسم */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.name")} *</label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder={t("productForm.namePlaceholder")}
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.description")}</label>
          <textarea
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows="3"
            className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder={t("productForm.descriptionPlaceholder")}
          />
        </div>

        {/* الأسعار */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("productForm.priceBefore")} *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.priceBefore}
              onChange={(e) => setNewProduct({ ...newProduct, priceBefore: e.target.value })}
              className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("productForm.priceAfter")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.priceAfter || ""}
              onChange={(e) => setNewProduct({ ...newProduct, priceAfter: e.target.value || null })}
              className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              placeholder={t("productForm.priceAfterPlaceholder")}
            />
          </div>
        </div>

        {/* الفئة */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.category")} *</label>
          <select
            value={typeof newProduct.category === 'object' ? newProduct.category._id : newProduct.category}
            onChange={(e) => {
              const selectedCat = categories.find(c => c._id === e.target.value);
              console.log("🔍 الفئة المحددة:", selectedCat);
              setNewProduct({ 
                ...newProduct, 
                category: selectedCat || e.target.value
              });
            }}
            className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            required
          >
            <option value="">{t("productForm.selectCategory") || "اختر فئة"}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-red-500 text-sm mt-1">
              ⚠️ لا توجد فئات متاحة. يرجى إضافة فئات من صفحة الإعدادات أولاً.
            </p>
          )}
        </div>

        {/* المقاسات */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.sizes")}</label>
          <button
            type="button"
            onClick={() => {
              setShowNumbers((prev) => !prev);
              setNewProduct((prev) => ({ ...prev, sizes: [] }));
            }}
            className="mb-3 px-4 py-2 rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {showNumbers 
              ? t("productForm.showLetters") 
              : t("productForm.showNumbers")}
          </button>
          
          <div className="flex flex-wrap gap-2">
            {(showNumbers ? sizesNumbers : sizesLetters).length > 0 ? (
              (showNumbers ? sizesNumbers : sizesLetters).map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSelection("sizes", size)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    newProduct.sizes.includes(size)
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-gray)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {size}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {t("productForm.noSizesAvailable") || "لا توجد مقاسات متاحة"}
              </p>
            )}
          </div>
        </div>

        {/* الألوان */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.colors")}</label>
          <div className="flex flex-wrap gap-2">
            {colorsList.length > 0 ? (
              colorsList.map((colorObj) => {
                const isSelected = newProduct.colors.some(c => 
                  (typeof c === 'object' ? c._id === colorObj._id : c === colorObj._id)
                );
                
                return (
                  <button
                    type="button"
                    key={colorObj._id}
                    onClick={() => toggleSelection("colors", colorObj)}
                    className={`px-4 py-2 rounded-md border transition-colors flex items-center gap-2 ${
                      isSelected
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-gray)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    <span 
                      className="w-4 h-4 border border-gray-300 rounded-full inline-block"
                      style={{ backgroundColor: colorObj.hex }}
                    />
                    {colorObj.name}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">
                {t("productForm.noColorsAvailable") || "لا توجد ألوان متاحة"}
              </p>
            )}
          </div>
        </div>

        {/* رفع الصور */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("productForm.uploadImages")} * ({newProduct.images.length}/5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className={`block w-full text-sm file:${isRTL ? "ml-4" : "mr-4"} file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[var(--color-accent)] file:text-white hover:file:bg-[var(--color-accent-hover)] transition-colors`}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {newProduct.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  alt={`Preview ${idx + 1}`} 
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading || loadingSettings}
          className="w-full flex justify-center items-center py-3 px-4 rounded-md text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <>
              <Loader className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 animate-spin`} />
              {t("productForm.creating")}
            </>
          ) : (
            <>
              <PlusCircle className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
              {t("productForm.createButton")}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;