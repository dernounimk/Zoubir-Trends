import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Truck, Loader, Package, Clock, MapPin , ClipboardList, Copy, Phone, User } from "lucide-react";

const TrackingForm = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [showOrdersList, setShowOrdersList] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';



const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // دالة تضيف صفر قدام الرقم المفرد
  const pad = (num) => (num < 10? `0${num}`: num);

  let parts = [];
  if (days > 0) parts.push(`${days} يوم`);
  if (hours > 0) parts.push(`${pad(hours)} ساعة`);
  if (minutes > 0) parts.push(`${pad(minutes)} دقيقة`);
  if (seconds > 0) parts.push(`${pad(seconds)} ثانية`);

  return parts.join("  ") || "وقت قليل";
};

  const handleAskForNumber = async (orderNumber) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل التحديث");
      setShowPopup(false);
      toast.success("followOreder.message");
    } catch (e) {
      toast.error(e.message);
    }
  };

const CountdownTimer = ({ milliseconds }) => {
  const [timeLeft, setTimeLeft] = useState(milliseconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev - 1000 > 0? prev - 1000: 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return <div>{formatDuration(timeLeft)}</div>;
};

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userOrders") || "[]");
    setUserOrders(stored);
  }, []);


  const toggleOrdersList = () => setShowOrdersList((prev) =>!prev);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!orderNumber.trim()) {
    toast.error(t("followOreder.enterOrderNumber"));
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("/api/orders/follow-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber }),
    });
    if (!response.ok) {
      const error = await response.json();
      toast.error(error.message || t("followOreder.error"));
      setResult(null);
    } else {
      const data = await response.json();
      setResult(data);
      setShowPopup(true);
    }
  } catch (error) {
    toast.error(t("followOreder.error"));
    setResult(null);
  }
  setLoading(false);
};

  return (
    <div>
        <div className="relative max-w-md mx-auto text-[var(--color-secondary)] rounded-lg mt-5">
        <div className="flex justify-center mb-3">
          <button onClick={toggleOrdersList} className="px-4 py-2 flex items-center rounded-md text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
            <ClipboardList className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
            {t("followOreder.list")}
          </button>
        </div>
            {showOrdersList && (
                <div className="absolute top-11 left-0 right-0 bg-[var(--color-bg)] m-auto max-h-64 w-64 overflow-y-auto rounded-md p-2 z-20 shadow-lg space-y-3">
                    {userOrders.length === 0? (
                    <p className="text-[var(--color-text-secondary)] text-center">{t("followOreder.dontHave")}</p>
                    ): (
                    userOrders.map((order) => {
                    const date = new Date(order.timestamp);
                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
return (
  <div
    key={order.orderNumber}
    className="flex justify-between items-center bg-[var(--color-bg-opacity)] px-4 py-2 rounded-md cursor-pointer text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-accent)] hover:bg-[var(--color-accent)] transition"
  >
    <div>
      <div className="font-semibold">{order.orderNumber}</div>
      <div className="text-xs">{formattedDate}</div>
    </div>

    <button
      onClick={(e) => {
        e.stopPropagation();

        const textToCopy = order.orderNumber;

        // ✅ طريقة النسخ التي تعمل في جميع الأجهزة
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(textToCopy)
            .then(() => toast.success(t("followOreder.phoneSuccess")))
            .catch(() => {
              // في حالة حدوث خطأ، استخدم الطريقة الاحتياطية
              const tempInput = document.createElement("input");
              tempInput.value = textToCopy;
              document.body.appendChild(tempInput);
              tempInput.select();
              document.execCommand("copy");
              document.body.removeChild(tempInput);
              toast.success(t("followOreder.phoneSuccess"));
            });
        } else {
          // الطريقة القديمة fallback
          const tempInput = document.createElement("input");
          tempInput.value = textToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
          toast.success(t("followOreder.phoneSuccess"));
        }
      }}
      className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
      title={t("followOreder.phone")}
    >
      <Copy className="h-5 w-5" />
    </button>
  </div>
);

                    })
                    )}
                </div>
            )}
        </div>
    <div className="max-w-md shadow-xl mx-auto mt-12 p-6 bg-[var(--color-bg)] text-[var(--color-text)] rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">{t("followOreder.title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
        <input
          type="text"
          className="flex-grow px-3 py-2 rounded-md w-full bg-[var(--color-bg-gray)] text-[var(--color-text)] focus:outline-none"
          placeholder={t("followOreder.enterOrderNumber")}
          value={orderNumber}
          name="orderID"
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        </div>
            <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 rounded-md text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-text)] disabled:opacity-50"
            disabled={loading}
            >
            {loading ? (
            <>
                <Loader className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 animate-spin`} />
                {t("followOreder.following")}
            </>
            ) : (
            <>
                <Truck className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
                {t("followOreder.startFollow")}
            </>
            )}
            </button>
      </form>

      {showPopup && result && (
        <Popup onClose={() => setShowPopup(false)}>
          <div className="space-y-6 bg-[var(--color-bg)] rounded-xl max-w-md w-full text-[var(--color-text-secondary)]" dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
              <User className="text-[var(--color-text)]" size={20} />
              <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                <span className="text-[var(--color-text)]">{t("followOreder.number")}</span>
                <b className="text-[var(--color-text-secondary)] capitalize">{result.orderNumber}</b>
              </span>
            </div>

            <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
              <Package className="text-[var(--color-text)]" size={20} />
              <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                <span className="text-[var(--color-text)]">{t("followOreder.status")}</span>
                <b className="text-[var(--color-text-secondary)] capitalize text-sm">{result.status ? "مؤكدة" : "غير مؤكدة"}</b>
              </span>
            </div>

            {result.estimatedDelivery && result.status? (
              <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
                <Clock className="text-[var(--color-text)]" size={20} />
                <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                  <span className="text-[var(--color-text)]">{t("followOreder.estimatedDelivery")}</span>
                  <CountdownTimer milliseconds={result.estimatedDelivery} />
                </span>
              </div>
            ): (
              <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
                <Clock className="text-[var(--color-text)]" size={20} />
                <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                  <span className="text-[var(--color-text)]">{t("followOreder.estimatedDelivery")}</span>
                  <b className="text-[var(--color-text-secondary)] capitalize text-sm">{t("followOreder.wait")}</b>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
              <MapPin className="text-[var(--color-text)]" size={20} />
              <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                <span className="text-[var(--color-text)]">{t("followOreder.deliveryAddress")}</span>
                <b className="text-[var(--color-text-secondary)]">{result.deliveryAddress}</b>
              </span>
            </div>

            {result.deliveryPhone && result.status? (
<div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
  <Phone className="text-[var(--color-text)]" size={20} />
  <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
    <span className="text-[var(--color-text)]">{t("followOreder.phoneGuy")}</span>
    <b className="text-[var(--color-text-secondary)] flex items-center gap-2">
      {result.deliveryPhone}
      <button
        onClick={() => {
          const textToCopy = result.deliveryPhone;

          // ✅ الطريقة الحديثة إن كانت مدعومة
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => toast.success(t("followOreder.phoneSuccess")))
              .catch(() => {
                // 🟡 الطريقة الاحتياطية fallback في حال حدوث خطأ
                const tempInput = document.createElement("input");
                tempInput.value = textToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
                toast.success(t("followOreder.phoneSuccess"));
              });
          } else {
            // 🟡 الطريقة القديمة fallback
            const tempInput = document.createElement("input");
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            toast.success(t("followOreder.phoneSuccess"));
          }
        }}
        className="text-[var(--color-text-secondary)] transition-colors rounded hover:text-white"
        title={t("followOreder.phone")}
      >
        <Copy className="h-4 w-4" />
      </button>
    </b>
  </span>
</div>
            ): (
              <div className="flex items-center gap-2 border-b border-[var(--color-bg-gray)] pb-4">
                <Phone className="text-[var(--color-text)]" size={20} />
                <span className="text-lg font-semibold flex items-center justify-between w-full text-xs">
                  <span className="text-[var(--color-text)]">{t("followOreder.phoneGuy")}</span>
                  <b className="text-[var(--color-text-secondary)]">{t("followOreder.NoPhone")}</b>
                </span>
              </div>
            )}

            {!result.deliveryPhone? (
              <div className="flex gap-5">
                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-2 py-2 px-5 bg-gray-500 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  {t("followOreder.close")}
                </button>
                {!result.isAskForPhone? (
                  <button
                    onClick={() => handleAskForNumber(orderNumber)}
                    className="mt-2 py-2 px-5 w-full bg-[var(--color-accent)] text-white rounded-lg font-semibold hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
                  >
                    {t("followOreder.askForNumber")}
                  </button>
                ): (
                  <button
                    disabled
                    className="mt-2 py-2 px-5 w-full bg-gray-500 rounded-lg font-semibold cursor-not-allowed text-sm"
                  >
                    {t("followOreder.requestSent")}
                  </button>
                )}
              </div>
            ): (
              <button
                onClick={() => setShowPopup(false)}
                className="mt-2 py-2 px-5 bg-[var(--color-gray-bg)] rounded-lg font-semibold transition-colors text-sm"
              >
                {t("followOreder.close")}
              </button>
            )}
                      </div>
                    </Popup>
                  )}
    </div>
    </div>
  );
};

export default TrackingForm;

const Popup = ({ children, onClose }) => {
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[var(--color-bg)] p-6 rounded-lg max-w-md w-full text-white"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
