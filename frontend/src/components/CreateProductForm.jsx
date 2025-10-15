// CreateProductForm.js
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useTranslation } from "react-i18next";
import useSettingStore from '../stores/useSettingStore'; // 🔥 استخدم الـ store

const CreateProductForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // 🔥 استخدم الـ store بدلاً من state محلي
  const { 
    categories, 
    sizesLetters, 
    sizesNumbers, 
    colorsList, 
    fetchMetaData,
    loadingMeta 
  } = useSettingStore();

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

  const [showNumbers, setShowNumbers] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchMetaData(); // 🔥 استخدم الـ store
        
        // تعيين الفئة الافتراضية بعد جلب البيانات
        if (categories.length > 0) {
          setNewProduct(prev => ({ 
            ...prev, 
            category: categories[0]._id 
          }));
        }
      } catch (error) {
        console.error("خطأ في جلب الإعدادات:", error);
        toast.error(t("productForm.errors.loadSettings"));
      }
    };
    
    loadSettings();
  }, [fetchMetaData, t, categories.length]);

  const toggleSelection = (field, value) => {
    setNewProduct((prev) => {
      if (field === 'colors') {
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
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newProduct.name.trim()) return toast.error(t("productForm.errors.name"));
    if (!newProduct.priceBefore || isNaN(newProduct.priceBefore)) return toast.error(t("productForm.errors.priceBefore"));
    if (
      newProduct.priceAfter &&
      parseFloat(newProduct.priceAfter) >= parseFloat(newProduct.priceBefore)
    )
      return toast.error(t("productForm.errors.priceAfter"));
    if (newProduct.images.length < 1) return toast.error(t("productForm.errors.images"));

    setLoading(true);
    try {
      await axios.post("/products", {
        name: newProduct.name,
        description: newProduct.description,
        priceBeforeDiscount: parseFloat(newProduct.priceBefore),
        priceAfterDiscount: newProduct.priceAfter ? parseFloat(newProduct.priceAfter) : null,
        category: newProduct.category, // 🔥 هذا هو الـ ID
        sizes: newProduct.sizes,
        colors: newProduct.colors.map(c => typeof c === 'object' ? c._id : c),
        images: newProduct.images,
      });

      toast.success(t("productForm.success"));

      setNewProduct({
        name: "",
        description: "",
        priceBefore: "",
        priceAfter: "",
        category: categories.length > 0 ? categories[0]._id : "",
        sizes: [],
        colors: [],
        images: [],
      });
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error(t("productForm.errors.create"));
    }
    setLoading(false);
  };

  if (loadingMeta) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <span className="mr-2">{t("loading")}</span>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t("productForm.name")}</label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-text)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">{t("productForm.description")}</label>
          <textarea
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows="3"
            className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-text)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium">{t("productForm.priceBefore")}</label>
            <input
              type="text"
              value={newProduct.priceBefore}
              onChange={(e) => setNewProduct({ ...newProduct, priceBefore: e.target.value })}
              className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-text)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium">{t("productForm.priceAfter")}</label>
            <input
              type="text"
              value={newProduct.priceAfter || ""}
              onChange={(e) => setNewProduct({ ...newProduct, priceAfter: e.target.value || null })}
              className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-text)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">{t("productForm.category")}</label>
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-text)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)]"
            required
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.sizes")}</label>
          <button
            type="button"
            onClick={() => {
              setShowNumbers((prev) => !prev);
              setNewProduct((prev) => ({ ...prev, sizes: [] }));
            }}
            className="mb-3 px-3 py-1 rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-text)]"
          >
            {showNumbers 
              ? t("productForm.showLetters") 
              : t("productForm.showNumbers")}
          </button>
          <div className="flex flex-wrap gap-2">
            {(showNumbers ? sizesNumbers : sizesLetters).map((size) => (
              <button
                type="button"
                key={size._id || size} // 🔥 استخدم _id إذا كان كائن
                onClick={() => toggleSelection("sizes", size.name || size)} // 🔥 استخدم name
                className={`px-3 py-1 rounded-md border ${
                  newProduct.sizes.includes(size.name || size)
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-gray)] border-[var(--color-text)]"
                }`}
              >
                {size.name || size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.colors")}</label>
          <div className="flex flex-wrap gap-2">
            {colorsList.map((colorObj) => {
              const isSelected = newProduct.colors.some(c => 
                (typeof c === 'object' ? c._id === colorObj._id : c === colorObj._id)
              );
              
              return (
                <button
                  type="button"
                  key={colorObj._id}
                  onClick={() => toggleSelection("colors", colorObj)}
                  className={`px-3 py-1 rounded-md border flex items-center gap-2 ${
                    isSelected
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-gray)] border-[var(--color-accent)]"
                  }`}
                >
                  <span 
                    className="w-4 h-4 border border-gray-300 rounded-full inline-block"
                    style={{ backgroundColor: colorObj.hex }}
                  />
                  {colorObj.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("productForm.uploadImages")}</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className={`block w-full text-sm file:${isRTL ? "ml-4" : "mr-4"} file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[var(--color-accent)] file:text-white hover:file:bg-[var(--color-accent-hover)] focus:file:bg-[var(--color-accent-hover)]`}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {newProduct.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt="" className="w-20 h-20 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 rounded-md text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-accent-hover)] focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          disabled={loading}
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