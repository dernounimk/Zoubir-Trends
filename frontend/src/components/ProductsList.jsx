import { motion, AnimatePresence } from "framer-motion";
import { Trash, Star, Eye, Pencil, Trash2, InstagramIcon, X,MessageSquare } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";
import dayjs from "dayjs";
  import axiosInstance from "../lib/axios";
import axios from "axios";

const iconButtonClass = "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500";

const ProductsList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sizesLetters, setSizesLetters] = useState([]);
  const [sizesNumbers, setSizesNumbers] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [managingReviews, setManagingReviews] = useState(null);

  const { deleteProduct, toggleFeaturedProduct, products, fetchAllProducts, updateProduct } = useProductStore();

  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showNumbers, setShowNumbers] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterDiscount, setFilterDiscount] = useState(false);
  const [filterFeature, setFilterFeature] = useState(false);


const filteredProducts = products.filter(product => {
  // فلترة حسب الاسم مع تجاهل حالة الأحرف
  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  // فلترة حسب التصنيف
  const matchesCategory =!selectedCategory || product.category?._id === selectedCategory || product.category === selectedCategory;
  
  // فلترة حسب وجود خصم
  const matchesDiscount =!filterDiscount || (product.priceAfterDiscount && product.priceAfterDiscount > 0);

  const matchesFeature =!filterFeature || product.isFeatured;
  
  return matchesSearch && matchesCategory && matchesDiscount && matchesFeature;
});


const highlightText = (text, highlight) => {
  if (!highlight) return text;

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part)? (
      <span key={i} className="bg-yellow-400 text-black rounded px-0.5">{part}</span>
    ): (
      part
    )
  );
};

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/settings");
        const data = res.data;

        setCategories(data.categories);
        setSizesLetters(data.sizes.filter((s) => s.type === "letter").map((s) => s.name));
        setSizesNumbers(data.sizes.filter((s) => s.type === "number").map((s) => s.name));
        setColorsList(data.colors);

        setIsLoading(false)
      } catch (error) {
        console.error("خطأ في جلب الإعدادات:", error);
        setIsLoading(false)
      }
    };
    fetchSettings();
  }, [t]);
  
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

const toggleSelection = (field, value) => {
  setEditingProduct((prev) => {
    if (!prev) return prev;
    const current = prev[field] || [];
    
    if (field === 'colors') {
      // التعامل مع الألوان ككائنات
      const exists = current.some(c => 
        (typeof c === 'object' && c._id === value._id) || 
        (typeof c === 'string' && c === value._id)
      );
      
      if (exists) {
        return { 
          ...prev, 
          [field]: current.filter(c => 
            (typeof c === 'object' ? c._id !== value._id : c !== value._id)
          ) 
        };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    } else {
      // التعامل مع المقاسات كنصوص
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    }
  });
};

  const openDeletePopup = (id) => {
    setSelectedProductId(id);
    setShowPopup(true);
  };

const editProduct = (product) => {
  // تحويل IDs الألوان إلى كائنات كاملة
  const fullColors = product.colors?.map(colorId => 
    colorsList.find(c => c._id == colorId) || colorId);
  
  // تحويل ID التصنيف إلى كائن كامل إذا كان ID فقط
  const fullCategory = typeof product.category === 'string' ? 
    categories.find(c => c._id === product.category) || product.category : 
    product.category;

  const safeProduct = {
    ...product,
    category: fullCategory,
    colors: fullColors || [],
    sizes: product.sizes || []
  };
  
  setEditingProduct(safeProduct);
};

  const handleDelete = () => {
    if (selectedProductId) {
      deleteProduct(selectedProductId);
      toast.success(t("productsList.deleteSuccess"));
      setShowPopup(false);
      setSelectedProductId(null);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      // تحويل الملفات الجديدة إلى Base64
      const oldImages = editingProduct.images || [];
      const newFiles = editingProduct.newImages || [];

      const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

      const newImagesBase64 = await Promise.all(newFiles.map(fileToBase64));
      const allImages = [...oldImages, ...newImagesBase64];

      // تجهيز البيانات للإرسال
      const payload = {
        ...editingProduct,
        category: editingProduct.category?._id || editingProduct.category,
        colors: editingProduct.colors?.map(c => c._id || c),
        sizes: editingProduct.sizes,
        images: allImages,
      };

      await updateProduct(editingProduct._id, payload);
      toast.success(t("productEditForm.success"));
      setEditingProduct(null);
    } catch (error) {
      toast.error(t("productEditForm.errors.update"));
      console.error("Update error:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="bg-[var(--color-bg-gray)] shadow-lg text-[var(--color-text-secondary)] rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >

<div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg mt-2">

<button
  onClick={() => setFilterDiscount(prev =>!prev)}
  className={`inline-flex gap-2 items-center cursor-pointer select-none rounded-md shadow-xl px-3 py-2 transition ${
    filterDiscount? "bg-[var(--color-accent-hover)]": "bg-[var(--color-bg)]"
  }`}
  aria-pressed={filterDiscount}
>
  <span>{t("productsList.onlyDiscounted")}</span>
</button>

<button
  onClick={() => setFilterFeature(prev =>!prev)}
  className={`inline-flex gap-2 items-center cursor-pointer select-none rounded-md shadow-xl px-3 py-2 transition ${
    filterFeature? "bg-[var(--color-accent-hover)]": "bg-[var(--color-bg)]"
  }`}
  aria-pressed={filterFeature}
>
  <span>{t("productsList.onlyFeatured")}</span>
</button>

  <select
    value={selectedCategory}
    onChange={e => setSelectedCategory(e.target.value)}
    className="rounded-md border border-[var(--color-bg)] bg-[var(--color-bg)] px-4 py-2 shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)] transition"
  >
    <option value="">{t("productsList.allCategories")}</option>
    {categories.map(cat => (
      <option key={cat._id} value={cat._id} className="bg-[var(--color-bg)]">{cat.name}</option>
    ))}
  </select>

    <input
    type="text"
    placeholder={t("productsList.searchPlaceholder")}
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="flex-grow min-w-[200px] rounded-md bg-[var(--color-bg)] shadow-xl placeholder-gray-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)] transition"
  />
</div>


      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-bg-gray)] text-xs">
          <thead className="bg-[var(--color-bg)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium uppercase tracking-wider min-w-[150px] text-center">
                {t("productsList.headers.product")}
              </th>
              <th className="px-4 py-3 text-left font-medium uppercase tracking-wider whitespace-nowrap text-center">
                {t("productsList.headers.price")}
              </th>
              <th className="px-4 py-3 text-left font-medium uppercase tracking-wider whitespace-nowrap text-center">
                {t("productsList.headers.category")}
              </th>
              <th className="px-4 py-3 text-center font-medium uppercase tracking-wider whitespace-nowrap text-center">
                {t("productsList.headers.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-gray)] divide-y divide-[var(--color-bg)]">
            {filteredProducts?.map((product) => (
              <tr key={product._id} className="hover:bg-[var(--color-bg-opacity)]">
                {/* خلية اسم المنتج */}
                <td className="px-2 py-2 text-center">
                  <Link to={`/product/${product._id}`} className="flex flex-col items-center">
                    <img
                      className="h-10 w-10 rounded-md object-cover mb-2"
                      src={
                        Array.isArray(product.images) && product.images.length
                          ? product.images[0]
                          : "/placeholder.jpg"
                      }
                      alt={product.name}
                    />
                    <div className={`${isRTL ? "mr-3" : "ml-3"} min-w-0`}>
                      <div className="text-sm font-medium hover:text-[var(--color-accent)] hover:underline truncate max-w-[180px]">
                        {highlightText(product.name, searchTerm)}
                      </div>
                    </div>
                  </Link>
                </td>

                {/* خلية السعر */}
                <td className="px-2 py-2 text-center">
                  {product.priceAfterDiscount != null ? (
                    <>
                      <div className="font-medium whitespace-nowrap">
                        {product.priceAfterDiscount} DA
                      </div>
                      {product.priceBeforeDiscount != null &&
                        product.priceBeforeDiscount > product.priceAfterDiscount && (
                          <div className="text-xs line-through text-gray-500 whitespace-nowrap">
                            {product.priceBeforeDiscount} DA
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="font-medium whitespace-nowrap">
                      {product.priceBeforeDiscount != null
                        ? `${product.priceBeforeDiscount} DA`
                        : t("productsList.priceUnavailable")}
                    </div>
                  )}
                </td>

                {/* خلية التصنيف */}
                <td className="break-words px-2 py-2 text-center">
                  {typeof product.category === 'object' ? 
                    product.category.name : 
                    categories.find(c => c._id === product.category)?.name || product.category}
                </td>

                {/* خلية الإجراءات */}
                <td className="px-1 py-2 font-medium text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* Toggle Featured */}
                    <button
                      onClick={async () => {
                        try {
                          await toggleFeaturedProduct(product._id);
                          toast.success(
                            product.isFeatured
                              ? t("productsList.unfeatureSuccess")
                              : t("productsList.featureSuccess")
                          );
                        } catch {
                          toast.error(t("productsList.updateError"));
                        }
                      }}
                      className={`rounded-full p-2 focus:outline-none focus:ring-0 ${
                        product.isFeatured
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-gray-900 text-gray-300 hover:bg-yellow-500/60 hover:text-gray-900"
                      }`}
                      title={product.isFeatured ? t("productsList.unfeatureTitle") : t("productsList.featureTitle")}
                    >
                      <Star className="h-5 w-5" />
                    </button>

                    {/* view review */}
                    <button
                      onClick={() => setManagingReviews(product)}
                      className="rounded-full p-2 bg-purple-500 text-white hover:bg-purple-600 focus:outline-none focus:ring-0"
                      title={t("productsList.reviewsTitle")}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>

                    {/* View product */}
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="rounded-full p-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-0"
                      title={t("productsList.viewTitle")}
                    >
                      <Eye className='h-5 w-5' />
                    </button>

                    {/* Edit product */}
                    <button
                      onClick={() => editProduct(product)}
                      className="rounded-full p-2 bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-0"
                      title={t("productsList.editTitle")}
                    >
                      <Pencil className='h-5 w-5' />
                    </button>

                    {/* Delete product */}
                    <button
                      onClick={() => openDeletePopup(product._id)}
                      className="rounded-full p-2 bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-0"
                      title={t("productsList.deleteTitle")}
                    >
                      <Trash className='h-5 w-5' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  {t("productsList.noProducts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {managingReviews && (
        <ReviewsPopup
          product={managingReviews}
          onClose={() => setManagingReviews(null)}
          isRTL={isRTL}
          t={t}
        />
      )}

      {/* نافذة التعديل */}
      {editingProduct &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--color-bg-gray)] flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--color-text)]">
                  {t("productEditForm.titleEdit")}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="hover:text-gray-500"
                  aria-label={t("productEditForm.close")}
                >
                  <X size={25} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* اسم المنتج */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("productEditForm.name")}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-[var(--color-bg-gray)] border border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-hover)] outline-none"
                  />
                </div>

                {/* الأسعار */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("productEditForm.priceBefore")}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.priceBeforeDiscount ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          priceBeforeDiscount: val === "" ? null : Number(val),
                        });
                      }}
                     className="w-full p-3 rounded-lg bg-[var(--color-bg-gray)] border border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-hover)] outline-none"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("productEditForm.priceAfter")}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.priceAfterDiscount ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          priceAfterDiscount: val === "" ? null : Number(val),
                        });
                      }}
                      className="w-full p-3 rounded-lg bg-[var(--color-bg-gray)] border border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-hover)] outline-none"
                      min="0"
                    />
                  </div>
                </div>

                {/* التصنيف */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("productEditForm.category")}
                  </label>
                  <select
                    value={typeof editingProduct.category === 'object' ? 
                      editingProduct.category._id : 
                      editingProduct.category}
                    onChange={(e) => {
                      const selectedCat = categories.find(c => c._id === e.target.value);
                      setEditingProduct({ 
                        ...editingProduct, 
                        category: selectedCat || e.target.value
                      });
                    }}
                    className="w-full p-3 rounded-lg bg-[var(--color-bg-gray)] border border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-hover)] outline-none"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* الألوان */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("productEditForm.colors")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorsList.map((colorObj) => {
                      const isSelected = editingProduct.colors?.some(c => 
                        (typeof c === 'object' ? c._id === colorObj._id : c === colorObj._id)
                      );
                      
                      return (
                        <button
                          type="button"
                          key={colorObj._id}
                          onClick={() => toggleSelection("colors", colorObj)}
                          className={`px-3 py-1 rounded-md border flex items-center gap-2 ${
                            isSelected
                              ? "bg-[var(--color-accent)] border-[var(--color-accent-hover)] text-white"
                              : "bg-[var(--color-bg-gray)] border-[var(--color-accent)]"
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-[var(--color-text-secondary)] inline-block"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                          {colorObj.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* المقاسات */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("productEditForm.sizes")}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNumbers((prev) => !prev);
                      setEditingProduct((prev) => ({
                        ...prev,
                        sizes: [],
                      }));
                    }}
                    className="mb-3 px-3 py-1 rounded-md bg-[var(--color-accent)] text-white hover:[var(--color-accent-hover)]"
                  >
                    {showNumbers 
                      ? t("productEditForm.showLetters") 
                      : t("productEditForm.showNumbers")}
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {(showNumbers ? sizesNumbers : sizesLetters).map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSelection("sizes", size)}
                        className={`px-3 py-1 rounded-md border ${
                          editingProduct.sizes?.includes(size)
                            ? "bg-[var(--color-accent)] border-[var(--color-accent-hover)] text-white"
                            : "bg-[var(--color-bg-gray)] border-[var(--color-accent)]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الصور */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("productEditForm.uploadImages")}
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setEditingProduct({
                        ...editingProduct,
                        newImages: files,
                      });
                    }}
                    className={`w-full text-sm file:${isRTL ? "ml-4" : "mr-4"} file:py-2 file:px-4 
                      file:rounded-lg file:border-0 file:text-sm file:font-medium
                      file:bg-[var(--color-accent)] file:text-white hover:file:bg-[var(--color-accent-hover)]`}
                  />

                  {/* عرض الصور الحالية */}
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {editingProduct.images?.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt="product"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              images: editingProduct.images.filter((_, i) => i !== idx),
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                          aria-label={t("productEditForm.removeImage")}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("productEditForm.description")}
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-[var(--color-bg-gray)] border border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-hover)] outline-none"
                    rows="3"
                  />
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="p-6 border-t border-[var(--color-bg-gray)] flex justify-end gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-500 text-white hover:bg-gray-600 px-5 py-2 rounded-lg font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] px-5 py-2 rounded-lg font-medium"
                >
                  {t("productEditForm.saveChanges")}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* نافذة عرض التفاصيل */}
      {viewingProduct &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-center text-[var(--color-text)] border-b border-[var(--color-bg-gray)] pb-3">
                {t("detailOf.productDetails")}
              </h3>

              <div className="space-y-4">
                <img
                  src={
                    Array.isArray(viewingProduct.images) && viewingProduct.images.length > 0
                      ? viewingProduct.images[0]
                      : "/placeholder.jpg"
                  }
                  alt={viewingProduct.name || t("detailOf.noName")}
                  className="w-full h-48 object-cover rounded-lg border border-[var(--color-bg-gray)]"
                />

                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.name")}</span>
                    <span>{viewingProduct.name?? t("detailOf.notExist")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.priceAfterDiscount")}</span>
                    <span>{viewingProduct.priceAfterDiscount!= null? `${viewingProduct.priceAfterDiscount} DA`: t("detailOf.notExist")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.priceBeforeDiscount")}</span>
                    <span>{viewingProduct.priceBeforeDiscount!= null? `${viewingProduct.priceBeforeDiscount} DA`: t("detailOf.notExist")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.category")}</span>
                    <span>{typeof viewingProduct.category === "object"? viewingProduct.category.name: categories.find(c => c._id === viewingProduct.category)?.name || viewingProduct.category}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.description")}</span>
                    <span dir={isRTL ? "ltr" : "rtl"}>{viewingProduct.description?.trim()? viewingProduct.description : t("detailOf.noDescription")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.status")}</span>
                    <span>{viewingProduct.isFeatured? t("detailOf.featured"): t("detailOf.normal")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.createdAt")}</span>
                    <span>{dayjs(viewingProduct.createdAt).format("HH:mm YYYY, MMM DD")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.updatedAt")}</span>
                    <span>{dayjs(viewingProduct.updatedAt).format("HH:mm YYYY, MMM DD")}</span>
                  </div>
                </div>

                {viewingProduct.colors?.length > 0 && (
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.colors")}</span>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.colors.map((color, idx) => {
                        // الحصول على بيانات اللون الكاملة سواء كان ID أو كائن
                        const colorData = typeof color === 'string' ? 
                          colorsList.find(c => c._id === color) : color;
                        
                        return colorData ? (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-gray)] rounded-lg border border-[var(--color-text-secondary)]"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-[var(--color-text-secondary)]"
                              style={{ backgroundColor: colorData.hex || '#ccc' }}
                            />
                            <span>{colorData.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {viewingProduct.sizes?.length > 0 && (
                  <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
                    <span className="text-[var(--color-accent-hover)]">{t("detailOf.sizes")}</span>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.sizes.map((size, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[var(--color-bg-gray)] rounded-lg border border-[var(--color-text-secondary)]"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="bg-gray-500 hover:bg-gray-600 px-5 py-2 m-auto text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* نافذة تأكيد منتج الحذف */}
      {createPortal(
        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md  border border-[var(--color-bg-gray)]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3 className="text-xl font-bold mb-4 text-center">
                  {t("deleteConfirmTitle")}
                </h3>
                <p className="text-gray-500 mb-6 text-center">
                  {t("productsList.deleteConfirmMessage")}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
                  >
                    {t("yesDelete")}
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default ProductsList;

const ReviewsPopup = ({ product, onClose, isRTL, t }) => {
  const deleteReviewByIdStore = useProductStore((s) => s.deleteReviewById);
  const deleteAllReviewsStore = useProductStore((s) => s.deleteAllReviews);
  const toggleReviewsStore = useProductStore((s) => s.toggleReviews);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [iDToDelete, setIDtoDelete] = useState(null);
  const [reviewsEnabled, setReviewsEnabled] = useState(product.reviewsEnabled);

  const [deleteOnePopup, setDeleteOnePopup] = useState(false);
  const [deleteAllPopup, setDeleteAllPopup] = useState(false);

useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`/reviews/${product._id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching reviews", err);
      setReviews([]);
    }
  };
  fetchReviews();
}, [product._id]);

const handleDeleteReview = async(reviewId) => {
  setDeleteOnePopup(true);
  setIDtoDelete(reviewId);
}
  const deleteReview = async () => {
    try {
      if (typeof deleteReviewByIdStore === "function") {
        await deleteReviewByIdStore(product._id, iDToDelete);
      } else {
        await axios.delete(`/reviews/${product._id}/review/${iDToDelete}`);
      }
      setReviews((prev) => prev.filter((r) => r._id !== iDToDelete));
      toast.success("تم حذف التقييم");
    } catch (err) {
      console.error("deleteReview error:", err);
      toast.error(err.response?.data?.message || "فشل حذف التقييم");
    } finally {
      setIDtoDelete(null);
      setDeleteOnePopup(false)
    }
  };

  const deleteAll = async () => {
    try {
      if (typeof deleteAllReviewsStore === "function") {
        await deleteAllReviewsStore(product._id);
      } else {
        await axios.delete(`/reviews/${product._id}/delete-reviews`);
      }
      setReviews([]);
      toast.success("تم حذف جميع التقييمات");
    } catch (err) {
      console.error("deleteAllReviews error:", err);
      toast.error(err.response?.data?.message || "فشل حذف التقييمات");
    } finally {
      setIDtoDelete(null);
      setDeleteAllPopup(false)
    }
  };

 const handleToggleReviews = async () => {
  try {
    if (typeof toggleReviewsStore === "function") {
      await toggleReviewsStore(product._id);
    } else {
      await axios.put(`/reviews/${product._id}/toggle-reviews`);
    }

    setReviewsEnabled((prev) => {
      const newState = !prev;
      toast.success(newState ? "تم تفعيل التقييمات" : "تم إيقاف التقييمات");
      return newState;
    });
  } catch (err) {
    console.error("toggleReviews error:", err);
    toast.error(err.response?.data?.message || "فشل تحديث حالة التقييمات");
  }
};

 return createPortal(
  <div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
    dir={isRTL ? "rtl" : "ltr"}
  >

          {/* حذف تقييم واحد */}
      {createPortal(
        <AnimatePresence>
          {deleteOnePopup && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md  border border-[var(--color-bg-gray)]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3 className="text-xl font-bold mb-4 text-center">
                  {t("deleteConfirmTitle")}
                </h3>
                <p className="text-gray-500 mb-6 text-center">
                  {t("deleteOneReviewMessage")}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={deleteReview}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
                  >
                    {t("yesDelete")}
                  </button>
                  <button
                    onClick={() => setDeleteOnePopup(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      {/* حذف جميع التقييمات */}
            {createPortal(
        <AnimatePresence>
          {deleteAllPopup && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md  border border-[var(--color-bg-gray)]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3 className="text-xl font-bold mb-4 text-center">
                  {t("deleteConfirmTitle")}
                </h3>
                <p className="text-gray-500 mb-6 text-center">
                  {t("deleteAllReviewMessage")}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={deleteAll}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
                  >
                    {t("yesDelete")}
                  </button>
                  <button
                    onClick={() => setDeleteAllPopup(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    <div className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-lg shadow-lg border border-[var(--color-bg-gray)] max-h-[90vh] overflow-y-auto relative">
      {/* العنوان */}
      <h3 className="text-2xl font-bold mb-6 text-center text-[var(--color-text)] border-b border-[var(--color-bg-gray)] pb-3">
        التقييمات
      </h3>

      {/* ملخص التقييمات */}
      <div className="space-y-3 max-w-md mx-auto mb-6">
        <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
          <span>{product.name}</span>
          <span className="flex items-center text-[var(--color-accent-hover)] font-semibold">
            {!isRTL ? (
              <>
                <Star className="h-5 w-5 mr-1" />
                {product.averageRating.toFixed(1) === 5 || 0 ? `${product.averageRating.toFixed(1)} / 5` : ` ${product.averageRating.toFixed(0)} / 5`}
              </>
            ) : (
              <>
                {product.averageRating.toFixed(1) === 5 || 0 ? `5 / ${product.averageRating.toFixed(1)}` : `5 / ${product.averageRating.toFixed(0)} `}
                <Star className="h-5 w-5 mr-1" />
              </>
            )}
          </span>
        </div>
        <div className="flex justify-between font-semibold border-b border-[var(--color-bg-gray)] pb-3 gap-4">
          {<span>{t("reviews.number")}</span>}
          <span className="flex items-center text-[var(--color-accent-hover)] font-semibold">
            {product.numReviews}
          </span>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-4 mb-6 items-center">
        {/* زر التبديل */}
<div
  className="relative flex bg-[var(--color-bg-gray)] rounded-full w-44 select-none overflow-hidden cursor-pointer"
  onClick={handleToggleReviews}
>
  <div
    className="absolute top-1 bottom-1 w-[47%] bg-[var(--color-accent-hover)] rounded-full transition-transform duration-300 ease-in-out"
    style={{
      right: isRTL ? "0.25rem" : "auto",
      left: isRTL ? "auto" : "0.25rem",
      transform: reviewsEnabled
        ? "translateX(0%)"
        : isRTL
        ? "translateX(-100%)"
        : "translateX(100%)",
    }}
  />
  <div className="relative flex-1 z-10 flex justify-center items-center pt-2 pb-2 text-sm font-medium">
    تفعيل
  </div>
  <div className="relative flex-1 z-10 flex justify-center items-center text-sm font-medium">
    إيقاف
  </div>
</div>

        <button
          onClick={() => reviews.length > 0 ? setDeleteAllPopup(true) : null}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full"
        >
          <Trash2 className="h-5 w-5" />
          حذف الكل
        </button>
      </div>

      {/* قائمة التقييمات */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : Array.isArray(reviews) && reviews.length > 0 ? (
        <div className="space-y-3">
{reviews.map((review) => (
  <div
    key={review._id}
    className="shadow-sm rounded-2xl p-4 mb-4 border border-[var(--color-accent)] bg-[var(--color-bg-gray)] flex justify-between items-start"
  >
    {/* القسم الأيسر (المحتوى) */}
    <div className="flex flex-col gap-2">
      {/* الاسم والتقييم */}
      <div className="flex items-center">
        <span className="font-semibold">{review.name}</span>
        <span className="flex items-center text-yellow-500 text-sm">
          <Star className="h-4 w-4 mr-1 fill-yellow-400" />
          {review.rating}/5
        </span>
      </div>

      {/* التعليق */}
      <p className="text-[var(--color-accent-hover)] font-semibold text-sm leading-relaxed">{review.comment}</p>

      {/* التاريخ */}
      <span className="text-gray-400 text-xs">
        {dayjs(review.createdAt).format("HH:mm MMMM/DD/YYYY")}
      </span>

      {/* إنستغرام */}
      {review.instagram && (
        <a
          href={`https://instagram.com/${review.instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-pink-500 hover:text-pink-600 text-sm"
        >
          <InstagramIcon size={16} />
          {review.instagram.replace("@", "")}
        </a>
      )}
    </div>

    {/* القسم الأيمن (الأزرار) */}
    <div>
      <button
        onClick={() => handleDeleteReview(review._id)}
        className="text-red-500 hover:text-red-600 transition-colors"
        title="حذف التقييم"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
))}

        </div>
      ) : (
        <p className="text-center">لا توجد تقييمات</p>
      )}

      {/* زر الإغلاق */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 m-auto text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          إغلاق
        </button>
      </div>
    </div>
  </div>,
  document.body
)
};