import { ArrowRight, CheckCircle, HandHeart, Truck, Copy } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import NotFoundPage from "./NotFoundPage";

const PurchaseSuccessPage = () => {
  const { clearCart } = useCartStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const location = useLocation();
  const { orderNumber, deliveryDays } = location.state || {};

  useEffect(() => {
    if (!orderNumber) return;

    clearCart();

    const storedOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    const now = Date.now();
    const maxAge = 4 * 24 * 60 * 60 * 1000; // 4 أيام

    const filteredOrders = storedOrders.filter(
      (order) => order.orderNumber && now - order.timestamp < maxAge
    );
    const isOrderExists = filteredOrders.some(
      (order) => order.orderNumber === orderNumber
    );

    if (!isOrderExists) {
      filteredOrders.push({ orderNumber, timestamp: now });
    }

    localStorage.setItem("userOrders", JSON.stringify(filteredOrders));
  }, [clearCart, orderNumber]);

  if (!orderNumber) return <NotFoundPage />;

  // ✅ دالة النسخ تعمل على جميع الأجهزة
  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // الطريقة الحديثة
      navigator.clipboard
        .writeText(orderNumber)
        .then(() => toast.success(t("purchaseSuccess.copyNumberSuccess")))
        .catch(() => toast.error("Clipboard not supported"));
    } else {
      // الطريقة القديمة (fallback)
      const tempInput = document.createElement("input");
      tempInput.value = orderNumber;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      toast.success(t("purchaseSuccess.copyNumberSuccess"));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-[var(--color-bg)] rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-[var(--color-text)] w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[var(--color-text)] mb-2">
            {t("purchaseSuccess.orderConfirmed")}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-center mb-2">
            {t("purchaseSuccess.orderPlaced")}
          </p>
          <p className="text-[var(--color-text)] text-center text-sm mb-6 flex items-center justify-center">
            {t("purchaseSuccess.thanks")}
            <HandHeart className={isRTL ? "mr-1" : "ml-1"} size={18} />
          </p>

          {/* 🧾 بطاقة تفاصيل الطلب */}
          <div className="border border-[var(--color-bg-gray)] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("purchaseSuccess.orderNumber")}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)] flex items-center">
                {orderNumber}
                <button
                  onClick={handleCopy}
                  className={`text-[var(--color-text-secondary)] ${
                    isRTL ? "pr-2" : "pl-2"
                  } hover:text-gray-500 transition-colors`}
                  title={t("purchaseSuccess.copyNumber")}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("purchaseSuccess.paymentMethod")}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {t("purchaseSuccess.cashOnDelivery")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("purchaseSuccess.estimatedDelivery")}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {deliveryDays
                  ? `${deliveryDays} ${t("purchaseSuccess.days")}`
                  : t("purchaseSuccess.deliveryTime")}
              </span>
            </div>
          </div>

          {/* 🚚 الأزرار */}
          <div className="space-y-4">
            <Link
              to={"/"}
              className="w-full bg-[var(--color-bg-gray)] hover:bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {t("purchaseSuccess.continueShopping")}
              <ArrowRight className={isRTL ? "mr-2" : "ml-2"} size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;

/*

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t("purchaseSuccess.orderNumber")}</span>
              <span className="text-sm font-semibold text-emerald-400">
                {orderNumber}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    toast.success(t("purchaseSuccess.copyNumberSuccess"));
                  }}
                  className={`text-gray-400 ${isRTL ? "pr-2" : "pl-2"} hover:text-white transition-colors`}
                  title={t("purchaseSuccess.copyNumber")}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t("purchaseSuccess.paymentMethod")}</span>
              <span className="text-sm font-semibold text-emerald-400">{t("purchaseSuccess.cashOnDelivery")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t("purchaseSuccess.estimatedDelivery")}</span>
              <span className="text-sm font-semibold text-emerald-400">
                {deliveryDays? `${deliveryDays} ${t("purchaseSuccess.days")}`: t("purchaseSuccess.deliveryTime")}
              </span>
            </div>
          </div>

*/