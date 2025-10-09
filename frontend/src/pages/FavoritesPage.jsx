import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Info, X } from "lucide-react";
import axios from "../lib/axios";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

const FavoritesPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [favorites, setFavorites] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  const hasFavorites = favorites.length > 0;

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  const handleFavoriteToggle = () => {
    const updated = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(updated);
  };

  useEffect(() => {
    const fetchFavoritesDetails = async () => {
      const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (storedFavorites.length === 0) return;

      try {
        const requests = storedFavorites.map((item) =>
          axios
            .get(`/products/${item._id}`)
            .then((res) => res.data)
            .catch(() => null)
        );

        const results = await Promise.all(requests);
        const validProducts = results.filter((p) => p !== null);

        setFavorites(validProducts);
        localStorage.setItem("favorites", JSON.stringify(validProducts));
      } catch (error) {
        console.error("Error fetching favorite products", error);
      }
    };

    fetchFavoritesDetails();
  }, []);

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-8 2xl:px-0">
        {/* العنوان + زر المعلومة */}
        <div className="flex justify-between items-center mb-6 relative">
          {favorites.length > 0 && (
            <h2 className="text-3xl font-bold text-[var(--color-text)]">
              {t("favoritesPage.title")}
            </h2>
          )}
          <div className="relative z-40">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full bg-[var(--color-accent)] 
                hover:bg-[var(--color-accent-hover)] 
                text-white transition"
            >
              <Info size={23} />
            </button>

            {showInfo && (
              <div
                className={`absolute top-full mt-2 z-40 bg-[var(--color-bg-gray)] border border-[var(--color-accent)] 
                  p-4 rounded-lg shadow-lg w-72 text-sm text-[var(--color-text-secondary)]
                  ${
                    isRTL
                      ? hasFavorites
                        ? "left-0"
                        : "right-0"
                      : hasFavorites
                      ? "right-0"
                      : "left-0"
                  }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className={isRTL ? "text-right" : "text-left"}>
                    {t("favoritesPage.info")}
                  </p>
                  <button onClick={() => setShowInfo(false)}>
                    <X size={20} className="text-[var(--color-accent)]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {favorites.length === 0 ? (
              <EmptyFavoritesUI />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favorites.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

const EmptyFavoritesUI = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heart className="h-24 w-24 text-[var(--color-text-secondary)]" />
      <h3 className="text-2xl font-semibold text-center text-[var(--color-text-secondary)]">
        {t("favoritesPage.emptyTitle")}
      </h3>
      <p className="text-[var(--color-text-secondary)] text-center">
        {t("favoritesPage.emptySubtitle")}
      </p>
      <Link
        className="mt-4 rounded-md bg-[var(--color-accent)] px-6 py-2 text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        to="/"
      >
        {t("favoritesPage.startShopping")}
      </Link>
    </motion.div>
  );
};
