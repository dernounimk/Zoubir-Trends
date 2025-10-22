import { useEffect } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../stores/useProductStore";
import CategoryItem from "../components/CategoryItem";
import useSettingStore from "../stores/useSettingStore";
import FeaturedProducts from "../components/FeaturedProducts";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();
  
  const { 
    fetchFeaturedProducts, 
    featuredProducts = [], 
    isLoading: productsLoading 
  } = useProductStore();

  const {
    categories,
    fetchMetaData,
    loadingMeta: categoriesLoading
  } = useSettingStore();

  // 🔥 أصلح الـ useEffect
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        try {
          // 🔥 استخدم Promise.all لجلب البيانات بشكل متوازي
          await Promise.all([
            fetchFeaturedProducts(),
            fetchMetaData()
          ]);
        } catch (error) {
          console.error("Error fetching homepage data:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchFeaturedProducts, fetchMetaData]);

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-accent)] mb-4">
            {t("homepage.title")}
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            {t("homepage.subtitle")}
          </p>
        </motion.div>

        {/* 🔥 تحسين عرض التصنيفات */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-accent)] text-center mb-8">
            {t("categories.title", "التصنيفات")}
          </h2>
          {categoriesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : categories.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {categories.map((category) => (
                <motion.div key={category._id} variants={itemVariants}>
                  <CategoryItem 
                    category={{
                      ...category,
                      href: `/products?category=${category._id}`,
                      imageUrl: category.imageUrl || '/default-category.jpg'
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)]">
                {t("categories.empty", "لا توجد تصنيفات متاحة")}
              </p>
            </div>
          )}
        </div>

        {/* 🔥 تحسين عرض المنتجات المميزة */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-accent)] text-center mb-8">
            {t("featured.title", "المنتجات المميزة")}
          </h2>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredProducts?.length > 0 ? (
            <FeaturedProducts featured={featuredProducts} /> 
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)]">
                {t("featured.empty", "لا توجد منتجات مميزة حالياً")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;