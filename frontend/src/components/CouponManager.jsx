import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader, EyeOff, Eye, Trash2, Copy } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // 🔥 استخدم axios المخصصة
import LoadingSpinner from "./LoadingSpinner";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const CouponManager = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ discountAmount: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  const openPopup = (id) => {
    setSelectedCouponId(id);
    setShowPopup(true);
  };

  const fetchCoupons = async () => {
    try {
      console.log("🔄 جلب الكوبونات...");
      const res = await axios.get("/coupons/all"); // 🔥 بدون /api لأن axios يضيفها تلقائياً
      
      // 🔥 معالجة البيانات القادمة من السيرفر
      const couponsData = Array.isArray(res.data) ? res.data : [];
      
      console.log("✅ الكوبونات المستلمة:", couponsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error("❌ خطأ في جلب الكوبونات:", err);
      toast.error(t("coupon.fetchError"));
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    
    if (!newCoupon.discountAmount || isNaN(newCoupon.discountAmount) || Number(newCoupon.discountAmount) <= 0) {
      toast.error(t("coupon.invalidAmount"));
      return;
    }

    try {
      setCreating(true);
      console.log("🔄 إنشاء كوبون جديد:", newCoupon);
      
      // 🔥 استخدم axios المخصصة بدون /api
      const res = await axios.post("/coupons/create", {
        discountAmount: Number(newCoupon.discountAmount)
      });
      
      console.log("✅ استجابة إنشاء الكوبون:", res.data);
      
      // 🔥 معالجة الاستجابة
      const newCouponData = res.data?.coupon || res.data;
      
      if (newCouponData) {
        setNewCoupon({ discountAmount: "" });
        toast.success(t("coupon.created"));
        setCoupons((prev) => [newCouponData, ...prev]);
      } else {
        toast.error(t("coupon.createError"));
      }
    } catch (err) {
      console.error("❌ خطأ في إنشاء الكوبون:", err);
      console.error("تفاصيل الخطأ:", err.response?.data);
      
      if (err.response?.status === 401) {
        toast.error(t("coupon.unauthorized"));
      } else if (err.response?.status === 403) {
        toast.error(t("coupon.forbidden"));
      } else if (err.response?.status === 405) {
        toast.error("خطأ في السيرفر: الطريقة غير مسموحة. تأكد من إعدادات الـ API");
      } else {
        toast.error(err.response?.data?.message || t("coupon.createError"));
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleCoupon = async (id) => {
    if (!id) return;
    
    try {
      console.log("🔄 تبديل حالة الكوبون:", id);
      await axios.patch(`/coupons/toggle/${id}`);
      
      const currentCoupon = coupons.find((c) => c._id === id);
      const isActive = currentCoupon?.isActive;
      
      toast.success(isActive ? t("coupon.toggleDisable") : t("coupon.toggleEnable"));

      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon._id === id ? { ...coupon, isActive: !coupon.isActive } : coupon
        )
      );
    } catch (error) {
      console.error("❌ خطأ في تبديل حالة الكوبون:", error);
      toast.error(t("coupon.toggleError"));
    }
  };

  const deleteCoupon = async (id) => {
    if (!id) return;
    
    try {
      console.log("🔄 حذف الكوبون:", id);
      await axios.delete(`/coupons/${id}`);
      
      toast.success(t("coupon.deleted"));
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      setShowPopup(false);
      setSelectedCouponId(null);
    } catch (err) {
      console.error("❌ خطأ في حذف الكوبون:", err);
      toast.error(t("coupon.deleteError"));
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <motion.div
      className='bg-[var(--color-bg)] shadow-lg rounded-lg p-6 mb-8 max-w-xl mx-auto'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className='text-2xl font-semibold mb-6 text-[var(--color-text)]'>
        {t("coupon.title")}
      </h2>

      <form onSubmit={createCoupon} className='space-y-4 mb-6'>
        <div>
          <input
            type="text"
            id='amount'
            placeholder={t("coupon.discountLabel")}
            value={newCoupon.discountAmount}
            onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: e.target.value })}
            className='mt-1 block w-full bg-[var(--color-bg-gray)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 border border-[var(--color-accent)] focus:ring-[var(--color-accent)]'
            min="1"
            step="1"
            required
          />
        </div>

        <button
          type='submit'
          disabled={creating || !newCoupon.discountAmount}
          className='w-full flex items-center justify-center py-2 px-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:bg-[var(--color-accent-hover)] rounded-md text-white font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-hover)] disabled:opacity-50'
        >
          {creating ? (
            <>
              <Loader className={`h-5 w-5 animate-spin ${isRTL ? "ml-1" : "mr-1"}`} /> {t("coupon.creating")}
            </>
          ) : (
            <>
              <PlusCircle className={`h-5 w-5 ${isRTL ? "ml-1" : "mr-1"}`} /> {t("coupon.createButton")}
            </>
          )}
        </button>
      </form>

      {isLoading ? (
        <LoadingSpinner />
      ) : !Array.isArray(coupons) || coupons.length === 0 ? (
        <div className='text-center text-[var(--color-text-secondary)] py-8'>
          {t("coupon.noCoupons")}
        </div>
      ) : (
        <ul className='space-y-3'>
          {coupons.map((coupon) => (
            <li
              key={coupon._id}
              className='flex justify-between items-center bg-[var(--color-bg-opacity)] px-4 py-3 rounded-md text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors'
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-lg text-[var(--color-text)]">{coupon.code}</p>
                  <button
                    onClick={() => {
                      const textToCopy = coupon.code;
                      navigator.clipboard.writeText(textToCopy)
                        .then(() => toast.success(t("coupon.copySuccess")))
                        .catch(() => toast.error(t("coupon.copyError")));
                    }}
                    className="text-gray-400 hover:text-[var(--color-accent)] transition-colors p-1 rounded"
                    title={t('coupon.copySuccess')}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <p className='text-sm text-[var(--color-text)] mb-1'>
                  {coupon.discountAmount} {!isRTL ? "DA" : "دج"}
                </p>
                <p className='text-xs text-gray-400'>
                  {t("coupon.createdAt", {
                    date: dayjs(coupon.createdAt).format(" HH:mm  YYYY,MMM DD"),
                  })}
                </p>
                <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs ${
                  coupon.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    coupon.isActive ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {coupon.isActive ? t("coupon.active") : t("coupon.inactive")}
                </div>
              </div>
              
              <div className='flex gap-2'>
                <button
                  onClick={() => toggleCoupon(coupon._id)}
                  className={`text-sm rounded-md px-3 py-2 font-medium text-white flex items-center transition-colors ${
                    coupon.isActive
                      ? "bg-red-500 hover:bg-red-600 focus:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-600"
                  }`}
                >
                  {coupon.isActive ? (
                    <>
                      <EyeOff className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      <span className="hidden sm:inline">{t("coupon.toggleDisable")}</span>
                    </>
                  ) : (
                    <>
                      <Eye className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      <span className="hidden sm:inline">{t("coupon.toggleEnable")}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => openPopup(coupon._id)}
                  className='text-sm rounded-md px-3 py-2 text-white font-medium flex items-center bg-red-600 hover:bg-red-700 focus:bg-red-700 transition-colors'
                >
                  <Trash2 className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                  <span className="hidden sm:inline">{t("coupon.delete")}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md border border-[var(--color-border)]'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className='text-xl font-bold mb-4 text-center text-[var(--color-text)]'>
                {t("coupon.confirmDeleteTitle")}
              </h3>
              <p className='text-gray-500 mb-6 text-center'>
                {t("coupon.confirmDeleteMessage")}
              </p>
              <div className='flex justify-center gap-4'>
                <button
                  onClick={() => deleteCoupon(selectedCouponId)}
                  className='bg-red-500 hover:bg-red-600 focus:bg-red-600 px-4 py-2 rounded text-white font-medium transition-colors'
                >
                  {t("coupon.confirmDeleteYes")}
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className='bg-gray-600 hover:bg-gray-500 focus:bg-gray-500 px-4 py-2 rounded text-white font-medium transition-colors'
                >
                  {t("coupon.confirmDeleteCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CouponManager;