import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";
import { useTranslation } from "react-i18next";

const FeaturedProducts = ({ featured }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // إذا لم تكن البيانات تُحمّل من API فلا حاجة لـ isLoading، فقط أضفتها للتماثل
  if (isLoading) return <LoadingSpinner />;

  if (!featured || featured.length === 0)
    return (
        <p></p>
    );

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerPage, featured.length - itemsPerPage));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= featured.length - itemsPerPage;

  return (
    <div className="mt-8">
      <h2 className="text-4xl font-semibold text-[var(--color-accent)] text-center mb-6">
        {t("featured.title")}
      </h2>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(${isRTL ? '' : '-'}${currentIndex * (100 / itemsPerPage)}%)`
            }}
          >
            {featured.map((product) => (
              <div
                key={product._id}
                className={`w-full flex-shrink-0 px-2`}
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          disabled={isStartDisabled}
          className={`absolute top-1/2 left-0 sm:-left-6 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
            isStartDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-accent-hover)]"
          }`}
          aria-label={t("featured.prev", "Previous")}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          disabled={isEndDisabled}
          className={`absolute top-1/2 right-0 sm:-right-6 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
            isEndDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-accent-hover)]"
          }`}
          aria-label={t("featured.next", "Next")}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedProducts;
