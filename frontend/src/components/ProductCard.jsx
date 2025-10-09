import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const ProductCard = ({ product, onFavoriteToggle }) => {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(storedFavorites.some((item) => item._id === product._id));
  }, [product._id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    let storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (isFavorite) {
      storedFavorites = storedFavorites.filter((item) => item._id !== product._id);
      toast.success(t("removedFromFavorites"));
    } else {
      storedFavorites.push(product);
      toast.success(t("addedToFavorites"));
    }

    localStorage.setItem("favorites", JSON.stringify(storedFavorites));
    setIsFavorite(!isFavorite);

    // 🔥 إذا الصفحة الأم مررت دالة تحديث
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };
  
  return (
    <div dir="ltr" className="h-full flex">
      <Link
        to={`/product/${product._id}`}
        className="flex flex-col bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[var(--color-accent)] h-full w-full max-w-[340px] mx-auto"
      >
        {/* صورة المنتج مع العلامات */}
        <div className="relative w-full h-60 overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            src={
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : product.image
            }
            alt={product.name}
          />

          {/* علامة التخفيض */}
          {product.priceBeforeDiscount &&
            product.priceBeforeDiscount > (product.priceAfterDiscount ?? product.priceBeforeDiscount) && (
              <div className="absolute top-3 left-3 bg-[var(--color-accent)] text-[var(--color-on-accent)] px-2 py-1 rounded text-xs font-bold">
                {Math.round(
                  100 -
                    ((product.priceAfterDiscount ?? product.priceBeforeDiscount) /
                      product.priceBeforeDiscount) *
                      100
                )}
                %
              </div>
            )}

          {/* زر المفضلة */}
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 border border-[var(--color-border)] rounded-full p-3 flex items-center justify-center transition-colors ${
              isFavorite
                ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                : "bg-black/60 text-white hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)]"
            }`}
          >
            <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* تفاصيل المنتج */}
        <div className="flex flex-col flex-grow p-4">
          <div className="mb-4">
            <h5 className="text-[var(--color-text-secondary)] text-lg font-semibold mb-2 line-clamp-2">
              {product.name}
            </h5>

            {/* تقييم المنتج */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                const rating = product.averageRating || 0;
                const full = i + 1 <= Math.floor(rating);
                const half = i < rating && i + 1 > rating;
                return (
                  <Star
                    key={i}
                    size={14}
                    color="var(--color-text)"
                    fill={
                      full
                        ? "var(--color-text)"
                        : half
                        ? "url(#half-gradient)"
                        : "none"
                    }
                  />
                );
              })}

              {/* تعريف الـ gradient للـ half star */}
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="half-gradient" x1="0" x2="100%" y1="0" y2="0">
                    <stop offset="50%" stopColor="var(--color-text)" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* سعر المنتج */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text)] text-xl font-bold">
                {product.priceAfterDiscount ?? product.priceBeforeDiscount} DA
              </span>

              {product.priceBeforeDiscount &&
                product.priceBeforeDiscount >
                  (product.priceAfterDiscount ?? product.priceBeforeDiscount) && (
                  <span className="text-[var(--color-text-secondary)] text-sm line-through opacity-70">
                    {product.priceBeforeDiscount} DA
                  </span>
                )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
