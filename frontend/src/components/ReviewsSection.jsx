import { useState } from "react";
import { Star, InstagramIcon, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "./StarRating";
import PeopleAlsoBought from "./PeopleAlsoBought";

const ReviewsSection = ({
  product,
  reviews,
  reviewForm,
  setReviewForm,
  handleSubmitReview,
}) => {
  const { t, i18n } = useTranslation();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const isRTL = i18n.language === "ar";

  // حساب الإحصائيات
  const ratingStats = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return (
    <div
      className={`mx-auto mt-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* قسم التقييمات */}
      <div className="mx-auto mt-12 p-6 rounded-2xl w-full bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-gray)] shadow-lg border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            {t("reviews.title")}
          </h2>
          {totalReviews > 0 && (
            <div className="text-center bg-[var(--color-accent)] text-white px-4 py-2 rounded-full">
              <div className="text-lg font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-xs opacity-90">{totalReviews} {t("reviews.reviews")}</div>
            </div>
          )}
        </div>

        {/* إحصائيات التقييمات */}
        {totalReviews > 0 && (
          <div className="mb-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-3">
              {t("reviews.ratingBreakdown")}
            </h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${totalReviews > 0 ? (ratingStats[rating] / totalReviews) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)] w-8">
                  {ratingStats[rating]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* فورم التقييم */}
        {product.reviewsEnabled && (
          <div className="mb-8 p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              {t("reviews.addReview")}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
                    {t("reviews.name")} *
                  </label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    className="w-full rounded-xl p-3 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
                    placeholder={t("reviews.namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
                    {t("reviews.instagram")} *
                  </label>
                  <div className="relative">
                    <InstagramIcon 
                      size={18} 
                      className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" 
                    />
                    <input
                      type="text"
                      value={reviewForm.instagram}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          instagram: e.target.value.trim(),
                        })
                      }
                      className="w-full rounded-xl p-3 pl-10 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
                  {t("reviews.rating")} *
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  setRating={(val) =>
                    setReviewForm({ ...reviewForm, rating: val })
                  }
                  size={28}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
                  {t("reviews.comment")} *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full rounded-xl p-3 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
                  rows="4"
                  placeholder={t("reviews.commentPlaceholder")}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent)] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                {t("reviews.submit")}
              </button>
            </form>
          </div>
        )}

        {/* عرض التقييمات */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-[var(--color-text-secondary)] text-lg">
                {t("reviews.noReviews")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("reviews.beFirst")}
              </p>
            </div>
          ) : (
            (showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
              <div
                key={rev._id}
                className="group bg-white/70 dark:bg-gray-800/70 border border-[var(--color-border)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-[var(--color-accent)]"
              >
                {/* رأس التقييم */}
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--color-text)]">
                          {rev.name}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < rev.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Calendar size={14} />
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString(isRTL ? "ar" : "en", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* نص التعليق */}
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4 text-lg">
                  {rev.comment}
                </p>

                {/* Instagram */}
                {rev.instagram && (
                  <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <a
                      href={`https://instagram.com/${rev.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
                    >
                      <InstagramIcon size={16} />
                      @{rev.instagram.replace("@", "")}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* زر عرض المزيد */}
        {reviews.length > 3 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] text-[var(--color-text)] px-8 py-3 rounded-xl hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)] transition-all duration-300 font-medium"
            >
              {showAllReviews ? t("reviews.showLess") : t("reviews.showMore")} 
              ({showAllReviews ? 3 : reviews.length - 3})
            </button>
          </div>
        )}
      </div>

      {/* منتجات قد تعجبك */}
      {product && <PeopleAlsoBought currentProductId={product._id} />}
    </div>
  );
};

export default ReviewsSection;