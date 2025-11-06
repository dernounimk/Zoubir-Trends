import { useState } from "react";
import { Star, InstagramIcon, MessageCircle } from "lucide-react";
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

  // حساب إحصائيات التقييمات
  const ratingStats = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;

  return (
    <div className="mx-auto mt-16 max-w-7xl w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* العمود الأيسر: إحصائيات التقييمات */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-gray)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)]">
            {/* التقييم العام */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-[var(--color-text)]">
                  {averageRating.toFixed(1)}
                </span>
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-[var(--color-text-secondary)]">
                {totalReviews > 0 ? t("reviews.basedOn", { count: totalReviews }) : t("reviews.noReviewsYet")}
              </p>
            </div>

            {/* توزيع التقييمات - يظهر فقط إذا كان هناك تقييمات */}
            {totalReviews > 0 && (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = (ratingStats[rating] / totalReviews) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-[var(--color-text-secondary)]">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)] w-8 text-left">
                        {ratingStats[rating]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* إضافة تقييم جديد */}
          {product.reviewsEnabled && (
            <div className="mt-6 bg-[var(--color-bg)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
                {t("reviews.addReview")}
              </h3>
              
              <div className="mb-4">
                <StarRating
                  rating={reviewForm.rating}
                  setRating={(val) => setReviewForm({ ...reviewForm, rating: val })}
                  size="lg"
                />
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("reviews.name")}
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full rounded-xl p-3 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                />

                <div className="relative">
                  <InstagramIcon className="absolute top-3 left-3 w-5 h-5 text-pink-500" />
                  <input
                    type="text"
                    placeholder={t("reviews.instagram")}
                    value={reviewForm.instagram}
                    onChange={(e) => setReviewForm({ ...reviewForm, instagram: e.target.value.trim() })}
                    className="w-full rounded-xl p-3 pl-10 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                  />
                </div>

                <textarea
                  placeholder={t("reviews.comment")}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl p-3 bg-[var(--color-bg-gray)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] transition-all resize-none"
                />

                <button
                  onClick={handleSubmitReview}
                  className="w-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {t("reviews.submit")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* العمود الأيمن: قائمة التقييمات */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--color-bg)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {t("reviews.title")} {totalReviews > 0 && `(${totalReviews})`}
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg">
                  {t("reviews.noReviews")}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(showAllReviews ? reviews : reviews.slice(0, 5)).map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-gradient-to-br from-[var(--color-bg-gray)] to-transparent border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                  >
                    {/* رأس التقييم */}
                    <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-start gap-3">
                        {/* صورة المستخدم الافتراضية */}
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {rev.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[var(--color-text)]">
                              {rev.name}
                            </span>
                            {rev.instagram && (
                              <a
                                href={`https://instagram.com/${rev.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm"
                              >
                                <InstagramIcon size={14} />
                                @{rev.instagram.replace("@", "")}
                              </a>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
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
                            <span className="text-xs text-[var(--color-text-secondary)]">
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

                    {/* نص التقييم */}
                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4">
                      {rev.comment}
                    </p>

                    {/* علامات مفيدة */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {rev.verified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {t("reviews.verified")}
                        </span>
                      )}
                      {rev.recommended && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {t("reviews.recommended")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* زر عرض المزيد */}
            {reviews.length > 5 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="bg-[var(--color-bg-gray)] hover:bg-[var(--color-accent)] hover:text-white text-[var(--color-text)] px-8 py-3 rounded-xl border border-[var(--color-border)] transition-all duration-300 font-semibold"
                >
                  {showAllReviews ? t("reviews.showLess") : t("reviews.showMore")}
                  {` (${showAllReviews ? 5 : reviews.length - 5})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* منتجات قد تعجبك */}
      <div className="mt-12">
        {product && <PeopleAlsoBought currentProductId={product._id} />}
      </div>
    </div>
  );
};

export default ReviewsSection;