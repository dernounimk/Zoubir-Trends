import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import useSettingStore from "../stores/useSettingStore";

const CategoryItem = ({ category, href }) => {
  const { t, i18n } = useTranslation();
  const { categories } = useSettingStore();

  // البحث عن التصنيف الكامل إذا تم تمرير ID فقط
  const fullCategory = typeof category === 'string' ? 
    categories.find(c => c._id === category) : 
    category;

  // معالجة الترجمة المتعددة للاسم
  const translatedName = fullCategory?.name?.[i18n.language] || 
                       fullCategory?.name ||
                       t('category.unknown');

  // صورة افتراضية إذا لم توجد صورة
  const imageUrl = fullCategory?.imageUrl || '/default-category.jpg';

  // رابط افتراضي إذا لم يتم توفيره
  const categoryHref = href || `/category/${fullCategory?.slug || fullCategory?._id}`;

  return (
    <motion.div
      className="relative overflow-hidden h-80 w-full rounded-xl shadow-lg group"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link to={categoryHref}>
        <div className="w-full h-full cursor-pointer relative">
          {/* طبقة تدرج لوني */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          
          {/* صورة التصنيف */}
          <img
            src={imageUrl}
            alt={translatedName}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/default-category.jpg';
            }}
          />
          
          {/* محتوى التصنيف */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-1">
            <h3 className="text-white text-2xl font-bold">
              {translatedName}
            </h3>
            
            {/* عدد المنتجات (اختياري) */}
            {fullCategory?.productCount && (
              <span className="inline-block mt-2 px-3 py-1 bg-black/30 text-white text-xs rounded-full backdrop-blur-sm">
                {t("category.productsCount", { count: fullCategory.productCount })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryItem;