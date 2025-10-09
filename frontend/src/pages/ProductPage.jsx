import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useProductStore } from '../stores/useProductStore';
import { useCartStore } from '../stores/useCartStore';
import useSettingStore from '../stores/useSettingStore';
import { ShoppingCart, Minus, Plus, Star, InstagramIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import LoadingSpinner from "../components/LoadingSpinner";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";
import StarRating from "../components/StarRating";
import axios from "../lib/axios";
import ReviewsSection from "../components/ReviewsSection";

const ProductPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { fetchProductById } = useProductStore();
  const { colorsList } = useSettingStore(); // نستخدم colorsList من useSettingStore
  const { addToCart } = useCartStore();

  const [showReviews, setShowReviews] = useState(false);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
  name: "",
  comment: "",
  rating: 0,
  instagram: ""
});

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProductById(id);
        
        // تحويل IDs الألوان إلى كائنات كاملة
        const productWithFullColors = {
          ...data,
          colors: data.colors?.map(colorId => {
            return colorsList.find(c => c._id === colorId) || 
                   { _id: colorId, name: colorId, hex: '#cccccc' };
          }) || []
        };
 
        setProduct(productWithFullColors);

        // تعيين اللون الافتراضي إذا كان هناك ألوان
        if (productWithFullColors.colors?.length > 0) {
          setSelectedColor(productWithFullColors.colors[0]);
        }

        // تعيين المقاس الافتراضي إذا كان هناك مقاسات
        if (productWithFullColors.sizes?.length > 0) {
          setSelectedSize(productWithFullColors.sizes[0]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error(t("product.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, fetchProductById, colorsList]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/${id}`);
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.reviews)
          ? data.reviews
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setReviews(list);

        // تحديث التقييم وعدد المراجعات داخل المنتج
        if (list.length > 0) {
          const avg =
            list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length;
          setProduct((prev) => ({
            ...prev,
            averageRating: avg,
            numReviews: list.length,
          }));
        } else {
          setProduct((prev) => ({
            ...prev,
            averageRating: 0,
            numReviews: 0,
          }));
        }
      } catch (err) {
        console.error("Error fetching reviews", err);
        setReviews([]);
        setProduct((prev) => ({
          ...prev,
          averageRating: 0,
          numReviews: 0,
        }));
      }
    };
    fetchReviews();
  }, [id]);


// إضافة تقييم
const handleSubmitReview = async (e) => {
  e.preventDefault();
if (!reviewForm.name.trim()) {
  toast.error(t("product.enterName"));
  return;
}

if (!reviewForm.instagram.trim()) {
  toast.error(t("product.enterInstagram"));
  return;
}

if (!reviewForm.comment.trim()) {
  toast.error(t("product.enterComment"));
  return;
}

if (!reviewForm.rating) {
  toast.error(t("product.selectStars"));
  return;
}

const igRegex = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{2,30}$/;
if (reviewForm.instagram && !igRegex.test(reviewForm.instagram)) {
  toast.error(t("product.invalidInstagram"));
  return;
}

try {
  const res = await axios.post(`/reviews/${id}`, reviewForm);
  const newReview = res.data.review || res.data;
  setReviews([newReview, ...reviews]);
  setReviewForm({ name: "", instagram: "", comment: "", rating: 0 });
  toast.success(t("product.reviewAdded"));
} catch (err) {
  console.error("Add review error:", err);
  toast.error(err.response?.data?.message || t("product.reviewAddFailed"));
}
};

  if (isLoading) return <LoadingSpinner />;

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-secondary)]">
        {t("product.notFound")}
      </div>
    );
  }

  const priceAfterDiscount = product.priceAfterDiscount ?? product.priceBeforeDiscount;
  const hasDiscount = product.priceBeforeDiscount && product.priceBeforeDiscount > priceAfterDiscount;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];

  const handleAddToCart = () => {
    if (!selectedColor && product.colors?.length > 0) {
      toast.error(t("product.selectColor"));
      return;
    }

    if (!selectedSize && product.sizes?.length > 0) {
      toast.error(t("product.selectSize"));
      return;
    }

    addToCart({
      ...product,
      quantity,
      selectedColor: selectedColor?._id || selectedColor,
      selectedSize,
    });
    
    toast.success(`${product.name} ${t("product.addedToCart")}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-[var(--color-text-secondary)]" dir="rtl">
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: var(--color-text);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 1.5rem;
          font-weight: bold;
        }
      `}</style>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* معرض الصور */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl overflow-hidden"
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full h-full rounded-xl"
            loop={true}
            style={{ height: "500px" }}
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx} className="w-full h-full rounded-xl">
                <div className="w-full h-full flex justify-center items-center rounded-xl">
                  <img
                    src={img}
                    className="w-full h-full object-contain rounded-xl"
                    alt={product.name}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* تفاصيل المنتج */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">{product.name}</h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">{product.description}</p>

          {/* الأسعار */}
          <div className="mb-6 flex items-center gap-3">
            {hasDiscount && (
              <span className="text-2xl line-through text-gray-500">
                {product.priceBeforeDiscount} DA
              </span>
            )}
            <span className="text-3xl font-bold text-[var(--color-text)]">
              {priceAfterDiscount} DA
            </span>
          </div>

          {/* الألوان */}
          {product?.colors?.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-lg font-medium">{t("product.color")}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedColor?._id === color._id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-accent)]"
                    }`}
                  >
                    <span 
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* المقاسات */}
          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-lg font-medium">{t("product.size")}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedSize === size
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-accent)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* الكمية */}
          <div className="mb-6">
            <p className="mb-2 text-lg font-medium">{t("product.quantity")}</p>
            <div className="flex items-center gap-2">
              <button
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all
                  border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]`}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="text-[var(--color-text-secondary)]" />
              </button>
              <div className="px-4 py-2 rounded-lg border border-[var(--color-accent)] bg-transparent">
                <p className="text-lg">{quantity}</p>
              </div>
              <button
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all
                  border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]`}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>

          {/* زر إضافة للسلة */}
          <button
            className="flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-lg font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={
              (product.colors?.length > 0 && !selectedColor) ||
              (product.sizes?.length > 0 && !selectedSize)
            }
          >
            <ShoppingCart size={24} className="ml-3" />
            {t("product.addToCart")}
          </button>
        </motion.div>
      </div>
<ReviewsSection
  product={product}
  reviews={reviews}
  reviewForm={reviewForm}
  setReviewForm={setReviewForm}
  handleSubmitReview={handleSubmitReview}
/>
    </div>
  );
};

export default ProductPage;