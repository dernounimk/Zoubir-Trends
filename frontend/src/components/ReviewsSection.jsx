import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "./StarRating";
import PeopleAlsoBought from "./PeopleAlsoBought";
import { InstagramIcon } from "lucide-react";

const ReviewsSection = ({
  product,
  reviews,
  reviewForm,
  setReviewForm,
  handleSubmitReview,
}) => {
  const { t, i18n } = useTranslation();
  const [showAllReviews, setShowAllReviews] = useState(false);

  // تحقق هل اللغة الحالية عربية
  const isRTL = i18n.language === "ar";

  return (
    <div
      className={`mx-auto mt-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8`}
      dir={isRTL ? "rtl" : "ltr"} // الاتجاه حسب اللغة
    >
      {/* قسم التقييمات */}
      <div className="mx-auto mt-12 p-6 rounded-xl w-full bg-[var(--color-bg)] shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
          {t("reviews.title")}
        </h2>

        {/* فورم التقييم */}
        {product.reviewsEnabled && (
          <form onSubmit={handleSubmitReview} className="mb-8">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الاسم */}
              <div>
                <label className="block mb-2">{t("reviews.name")}</label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, name: e.target.value })
                  }
                  className="w-full rounded-lg p-3 bg-[var(--color-bg-gray)]"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block mb-2">{t("reviews.instagram")}</label>
                <input
                  type="text"
                  value={reviewForm.instagram}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      instagram: e.target.value.trim(),
                    })
                  }
                  className="w-full rounded-lg p-3 bg-[var(--color-bg-gray)]"
                />
              </div>
            </div>

            {/* التعليق */}
            <div className="mb-4">
              <label className="block mb-2">{t("reviews.comment")}</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                className="w-full rounded-lg p-3 bg-[var(--color-bg-gray)]"
                rows="3"
              />
            </div>

            {/* التقييم + زر الإرسال */}
            <div
              className={`mb-4 flex items-center justify-between gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {/* النجوم */}
              <div>
                <label className="block mb-2">{t("reviews.rating")}</label>
                <StarRating
                  rating={reviewForm.rating}
                  setRating={(val) =>
                    setReviewForm({ ...reviewForm, rating: val })
                  }
                />
              </div>

              {/* زر الإرسال */}
              <button
                type="submit"
                className="self-end bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-2 rounded-lg"
              >
                {t("reviews.submit")}
              </button>
            </div>
          </form>
        )}

        {/* عرض التقييمات */}
        <div className="mt-6">
          {reviews.length === 0 && <p>{t("reviews.noReviews")}</p>}

          {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
            <div
              key={rev._id}
              className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-lg p-4 mb-4"
            >
              {/* الصف العلوي */}
{/* الصف العلوي */}
<div className="flex items-center justify-between mb-2">
  {/* اسم + نجوم */}
  <div
    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
  >
    {/* اسم المقيم */}
    <span className="font-semibold text-[var(--color-text-secondary)]">
      {rev.name}
    </span>
    {/* النجوم */}
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${
            i < rev.rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-400"
          }`}
        />
      ))}
    </div>
  </div>

  {/* التاريخ بجانب الاسم والنجوم */}
  <span className="text-xs text-[var(--color-text)]">
    {new Date(rev.createdAt).toLocaleDateString(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}
  </span>
</div>


              {/* نص التعليق */}
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {rev.comment}
              </p>

              {/* Instagram */}
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {rev.instagram && (
                  <div className="mt-2">
                    <a
                      href={`https://instagram.com/${rev.instagram.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-500 hover:underline text-sm"
                    >
                      <InstagramIcon size={16} />
                      @{rev.instagram.replace("@", "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* زر عرض المزيد */}
        {reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="mt-4 text-[var(--color-text)] text-center bg-[var(--color-bg-gray)] px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] transition-colors w-full"
          >
            {showAllReviews ? t("reviews.hide") : t("reviews.showMore")}
          </button>
        )}
      </div>

      {/* منتجات قد تعجبك */}
      {product && <PeopleAlsoBought currentProductId={product._id} />}
    </div>
  );
};

export default ReviewsSection;
