import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { useTranslation } from "react-i18next";

const PeopleAlsoBought = ({ currentProductId }) => {
  const { t, i18n } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // ✅ RTL / LTR
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1); // sm
      else if (window.innerWidth < 1024) setItemsPerPage(2); // md
      else if (window.innerWidth < 1280) setItemsPerPage(3); // lg
      else setItemsPerPage(4); // xl+
      setIsLargeScreen(window.innerWidth >= 1280);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("/products/recommendations");

        const products = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        const filtered = products.filter(
          (product) => product._id !== currentProductId
        );

        const normalized = filtered.map((product) => {
          let mainImage =
            product.images?.[0] ||
            product.image ||
            product.imageUrl ||
            "/default-product-image.png";

          const priceAfterDiscount =
            product.priceAfterDiscount ??
            product.price ??
            product.priceBeforeDiscount ??
            0;

          const priceBeforeDiscount =
            product.priceBeforeDiscount ?? priceAfterDiscount;

          return {
            ...product,
            mainImage,
            priceAfterDiscount,
            priceBeforeDiscount,
            averageRating: product.averageRating || 0,
            numReviews: product.numReviews || 0,
          };
        });

        setRecommendations(normalized);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId, t]);

  if (isLoading) return <LoadingSpinner />;
  if (recommendations.length === 0) return null;

  // ✅ شاشة كبيرة: عرض منتجين ثابتين
  if (isLargeScreen) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-[var(--color-text)]">
          {t("relate.relatedProducts")}
        </h3>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {recommendations.slice(0, 2).map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                image: product.mainImage,
                priceAfterDiscount: product.priceAfterDiscount,
                priceBeforeDiscount: product.priceBeforeDiscount,
                averageRating: product.averageRating,
                numReviews: product.numReviews,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // 📱 شاشة صغيرة: كاروسيل بالصفحات
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex === totalPages - 1;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-[var(--color-text)]">
        {t("relate.relatedProducts")}
      </h3>

      <div className="relative mt-6">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(${
                isRTL
                  ? currentIndex * 100 // RTL يتحرك يمين
                  : -currentIndex * 100 // LTR يتحرك يسار
              }%)`,
            }}
          >
            {recommendations.map((product) => (
              <div
                key={product._id}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <ProductCard
                  product={{
                    ...product,
                    image: product.mainImage,
                    priceAfterDiscount: product.priceAfterDiscount,
                    priceBeforeDiscount: product.priceBeforeDiscount,
                    averageRating: product.averageRating,
                    numReviews: product.numReviews,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* زر السابق (يسار) */}
        <button
          onClick={prevSlide}
          disabled={isStartDisabled}
          className={`absolute top-1/2 left-0 sm:-left-6 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            isStartDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* زر التالي (يمين) */}
        <button
          onClick={nextSlide}
          disabled={isEndDisabled}
          className={`absolute top-1/2 right-0 sm:-right-6 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            isEndDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
