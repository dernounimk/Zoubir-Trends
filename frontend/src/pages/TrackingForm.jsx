import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Truck, Loader, Package, Clock, MapPin, ClipboardList, Copy, Phone, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const pad = (num) => (num < 10 ? `0${num}` : num);

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
        setTimeLeft((prev) => (prev - 1000 > 0 ? prev - 1000 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }, [timeLeft]);

    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="font-mono text-[var(--color-accent)] font-bold"
      >
        {formatDuration(timeLeft)}
      </motion.div>
    );
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userOrders") || "[]");
    setUserOrders(stored);
  }, []);

  const toggleOrdersList = () => setShowOrdersList((prev) => !prev);

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
    <div className="min-h-screen py-12 px-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Orders List Button */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button 
            onClick={toggleOrdersList}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 flex items-center justify-center rounded-xl text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-lg transition-all duration-200"
          >
            <ClipboardList className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
            {t("followOreder.list")}
          </motion.button>

          <AnimatePresence>
            {showOrdersList && (
              <div
                className="absolute top-14 left-0 right-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 z-20 shadow-2xl space-y-3 max-h-64 overflow-y-auto"
              >
                {userOrders.length === 0 ? (
                  <p className="text-[var(--color-text-secondary)] text-center py-4">
                    {t("followOreder.dontHave")}
                  </p>
                ) : (
                  userOrders.map((order, index) => {
                    const date = new Date(order.timestamp);
                    const formattedDate = date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    
                    return (
                      <div
                        key={order.orderNumber}
                        className="flex justify-between items-center bg-[var(--color-bg-gray)] px-4 py-3 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] transition-all duration-300 group"
                      >
                        <div>
                          <div className="font-semibold text-[var(--color-text)] group-hover:text-white transition-colors">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)] group-hover:text-white/80 transition-colors">
                            {formattedDate}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const textToCopy = order.orderNumber;

                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard
                                .writeText(textToCopy)
                                .then(() => toast.success(t("followOreder.phoneSuccess")))
                                .catch(() => {
                                  const tempInput = document.createElement("input");
                                  tempInput.value = textToCopy;
                                  document.body.appendChild(tempInput);
                                  tempInput.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(tempInput);
                                  toast.success(t("followOreder.phoneSuccess"));
                                });
                            } else {
                              const tempInput = document.createElement("input");
                              tempInput.value = textToCopy;
                              document.body.appendChild(tempInput);
                              tempInput.select();
                              document.execCommand("copy");
                              document.body.removeChild(tempInput);
                              toast.success(t("followOreder.phoneSuccess"));
                            }
                          }}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] group-hover:text-white transition-colors p-1 rounded"
                          title={t("followOreder.phone")}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Tracking Form */}
        <motion.div
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              {t("followOreder.title")}
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-4 pl-12 bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200"
                  value={orderNumber}
                  name="orderID"
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 px-6 rounded-xl text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {t("followOreder.following")}
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  {t("followOreder.startFollow")}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Popup */}
        <AnimatePresence>
          {showPopup && result && (
            <Popup onClose={() => setShowPopup(false)}>
              <motion.div
                className="space-y-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl max-w-md w-full text-[var(--color-text-secondary)] p-6"
                dir={isRTL ? "rtl" : "ltr"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[var(--color-accent)]" />
                    {t("followOreder.orderDetails")}
                  </h3>
                </div>

                {/* Order Details */}
                <div className="space-y-4">
                  <InfoRow 
                    icon={<User className="text-[var(--color-accent)]" size={20} />}
                    label={t("followOreder.number")}
                    value={result.orderNumber}
                    highlight
                  />

                  <InfoRow 
                    icon={<Package className="text-[var(--color-accent)]" size={20} />}
                    label={t("followOreder.status")}
                    value={result.status ? t("followOreder.confirmed") : t("followOreder.notConfirmed")}
                    status={result.status}
                  />

                  {result.estimatedDelivery && result.status ? (
                    <InfoRow 
                      icon={<Clock className="text-[var(--color-accent)]" size={20} />}
                      label={t("followOreder.estimatedDelivery")}
                      value={<CountdownTimer milliseconds={result.estimatedDelivery} />}
                    />
                  ) : (
                    <InfoRow 
                      icon={<Clock className="text-[var(--color-accent)]" size={20} />}
                      label={t("followOreder.estimatedDelivery")}
                      value={t("followOreder.wait")}
                    />
                  )}

                  <InfoRow 
                    icon={<MapPin className="text-[var(--color-accent)]" size={20} />}
                    label={t("followOreder.deliveryAddress")}
                    value={result.deliveryAddress}
                  />

                  {result.deliveryPhone && result.status ? (
                    <InfoRow 
                      icon={<Phone className="text-[var(--color-accent)]" size={20} />}
                      label={t("followOreder.phoneGuy")}
                      value={
                        <div className="flex items-center gap-2">
                          {result.deliveryPhone}
                          <CopyButton 
                            text={result.deliveryPhone}
                            successMessage={t("followOreder.phoneSuccess")}
                          />
                        </div>
                      }
                    />
                  ) : (
                    <InfoRow 
                      icon={<Phone className="text-[var(--color-accent)]" size={20} />}
                      label={t("followOreder.phoneGuy")}
                      value={t("followOreder.NoPhone")}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!result.deliveryPhone ? (
                    <>
                      <motion.button
                        onClick={() => setShowPopup(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 px-4 bg-[var(--color-bg-gray)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl font-semibold transition-colors text-sm hover:bg-[var(--color-bg)]"
                      >
                        {t("followOreder.close")}
                      </motion.button>
                      {!result.isAskForPhone ? (
                        <motion.button
                          onClick={() => handleAskForNumber(orderNumber)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 px-4 bg-[var(--color-accent)] text-white rounded-xl font-semibold hover:bg-[var(--color-accent-hover)] transition-all duration-200 text-sm"
                        >
                          {t("followOreder.askForNumber")}
                        </motion.button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-3 px-4 bg-[var(--color-bg-gray)] text-[var(--color-text-secondary)] rounded-xl font-semibold cursor-not-allowed text-sm"
                        >
                          {t("followOreder.requestSent")}
                        </button>
                      )}
                    </>
                  ) : (
                    <motion.button
                      onClick={() => setShowPopup(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-[var(--color-accent)] text-white rounded-xl font-semibold hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
                    >
                      {t("followOreder.close")}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Component for Info Rows
const InfoRow = ({ icon, label, value, status, highlight = false }) => (
  <motion.div 
    className="flex items-center gap-3 p-3 bg-[var(--color-bg-gray)] rounded-lg border border-[var(--color-border)]"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    {icon}
    <div className="flex items-center justify-between flex-1">
      <span className={`text-sm font-medium ${highlight ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${
        status ? 'text-[var(--color-success)]' : 
        status === false ? 'text-[var(--color-warning)]' : 
        highlight ? 'text-[var(--color-accent)]' : 
        'text-[var(--color-text)]'
      }`}>
        {value}
      </span>
    </div>
  </motion.div>
);

// Component for Copy Button
const CopyButton = ({ text, successMessage }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => toast.success(successMessage))
          .catch(() => {
            const tempInput = document.createElement("input");
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            toast.success(successMessage);
          });
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        toast.success(successMessage);
      }
    }}
    className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors p-1 rounded"
    title="نسخ"
  >
    <Copy className="h-4 w-4" />
  </motion.button>
);

// Enhanced Popup Component
const Popup = ({ children, onClose }) => {
  return createPortal(
    <motion.div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {children}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -top-3 -right-3 bg-[var(--color-bg)] rounded-full p-1 shadow-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-gray)] transition-colors"
        >
          <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </motion.button>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default TrackingForm;