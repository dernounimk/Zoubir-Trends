import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import useSettingStore from "../stores/useSettingStore";
import { Link, useParams } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/LoadingSpinner";

const CategoryPage = () => {
  const { 
    fetchProductsByCategory, 
    products, 
    isLoading: productsLoading 
  } = useProductStore();
  
  const { 
    categories,
    loadingMeta: categoriesLoading,
    fetchMetaData
  } = useSettingStore();
  
  const { category } = useParams();
  const { t } = useTranslation();
  const [categoryNotFound, setCategoryNotFound] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      fetchMetaData();
    }
  }, [categories.length, fetchMetaData]);

  useEffect(() => {
    if (category) {
      const foundCategory = categories.find(c => 
        c._id === category || 
        c.slug === category || 
        c.name.toLowerCase() === category.toLowerCase()
      );

      if (foundCategory) {
        fetchProductsByCategory(foundCategory._id);
        setCategoryNotFound(false);
      } else {
        setCategoryNotFound(true);
      }
    }
  }, [category, categories, fetchProductsByCategory]);

  const currentCategory = categories.find(c => 
    c._id === category || 
    c.slug === category || 
    c.name.toLowerCase() === category.toLowerCase()
  );

  const translatedCategoryName = currentCategory 
    ? t(`categories.${currentCategory.name}`, currentCategory.name)
    : t(`categories.${category}`, category?.charAt(0)?.toUpperCase() + category?.slice(1));

  if (categoriesLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (categoryNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold text-red-400 mb-4">
          {t('categoryPage.notFound')}
        </h1>
        <p className="text-xl text-gray-400">
          {t('categoryPage.notFoundMessage', { category: translatedCategoryName })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {currentCategory?.imageUrl && (
          <motion.div
            className="relative h-64 w-full mb-12 rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={currentCategory.imageUrl}
              alt={currentCategory.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
              <motion.h1
                className="text-4xl sm:text-5xl font-bold text-white"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {translatedCategoryName}
              </motion.h1>
            </div>
          </motion.div>
        )}

        {!currentCategory?.imageUrl && (
          <motion.h1
            className="text-center text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('categoryPage.title', { category: translatedCategoryName })}
          </motion.h1>
        )}

        {productsLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="xl" />
          </div>
        ) : (
          <>
            {products?.length === 0 && (
              <motion.div 
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-semibold text-[var(--color-text-secondary)] mb-4">
                  {t('categoryPage.noProducts')}
                </h2>
                <Link
                  to='/'
                  className='inline-flex items-center gap-2 text-m font-medium text-[var(--color-accent)] bg-[var(--color-text-secondary)] rounded hover:text-[var(--color-accent-hover)] p-1 hover:underline'
                >
                  {t("categoryPage.noProductsHint")}
                  <MoveRight size={16} />
                </Link>
              </motion.div>
            )}

            {products?.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    categoryName={currentCategory?.name}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;