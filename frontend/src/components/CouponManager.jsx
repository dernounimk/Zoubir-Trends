import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader, EyeOff, Eye, Trash2, Copy } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
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
      const res = await axios.get("/api/coupons/all");
      
      // 🔥 إصلاح: معالجة البيانات القادمة من السيرفر
      const couponsData = Array.isArray(res.data) ? res.data : [];
      
      console.log("✅ الكوبونات المستلمة:", couponsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error("❌ خطأ في جلب الكوبونات:", err);
      toast.error(t("coupon.fetchError"));
      // 🔥 تعيين مصفوفة فارغة في حالة الخطأ
      setCoupons([]);
    } finally {
      setIsLoading(false); // 🔥 إصلاح: setIsLoading بدلاً من setLoading
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
      const res = await axios.post("/api/coupons/create", newCoupon);
      
      // 🔥 إصلاح: معالجة الاستجابة
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
      toast.error(err.response?.data?.message || t("coupon.createError"));
    } finally {
      setCreating(false);
    }
  };

  const toggleCoupon = async (id) => {
    if (!id) return;
    
    try {
      await axios.patch(`/api/coupons/toggle/${id}`);
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
      await axios.delete(`/api/coupons/${id}`);
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
            type='number'
            id='amount'
            placeholder={t("coupon.discountLabel")}
            value={newCoupon.discountAmount}
            onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: e.target.value })}
            className='mt-1 block w-full bg-[var(--color-bg-gray)] rounded-md py-2 px-3 text-[var(--color-text-secondary)] focus:ring-2 border border-[var(--color-accent)] focus:ring-[var(--color-accent)]'
            min="1"
            step="1"
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
        <div className='text-center text-[var(--color-text-secondary)]'>{t("coupon.noCoupons")}</div>
      ) : (
        <ul className='space-y-3'>
          {coupons.map((coupon) => (
            <li
              key={coupon._id}
              className='flex justify-between items-center bg-[var(--color-bg-opacity)] px-4 py-2 rounded-md text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{coupon.code}</p>
                  <button
                    onClick={() => {
                      const textToCopy = coupon.code;

                      // ✅ الطريقة الحديثة (Clipboard API)
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard
                          .writeText(textToCopy)
                          .then(() => toast.success(t("coupon.copySuccess")))
                          .catch(() => {
                            // 🟡 الطريقة الاحتياطية fallback
                            const tempInput = document.createElement("input");
                            tempInput.value = textToCopy;
                            document.body.appendChild(tempInput);
                            tempInput.select();
                            document.execCommand("copy");
                            document.body.removeChild(tempInput);
                            toast.success(t("coupon.copySuccess"));
                          });
                      } else {
                        // 🟡 الطريقة القديمة fallback
                        const tempInput = document.createElement("input");
                        tempInput.value = textToCopy;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand("copy");
                        document.body.removeChild(tempInput);
                        toast.success(t("coupon.copySuccess"));
                      }
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:text-gray-500 transition-colors"
                    title={t('coupon.copySuccess')}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <p className='text-sm text-[var(--color-text)]'>{coupon.discountAmount} {!isRTL ? "DA" : "دج"}</p>
                <p className='text-xs text-gray-400'>
                  {t("coupon.createdAt", {
                    date: dayjs(coupon.createdAt).format(" HH:mm  YYYY,MMM DD"),
                  })}
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => toggleCoupon(coupon._id)}
                  className={`text-sm rounded-md px-3 py-1 font-medium text-white flex items-center ${
                    coupon.isActive
                      ? "bg-red-500 hover:bg-red-600 focus:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-600"
                  }`}
                >
                  {coupon.isActive ? (
                    <>
                      <EyeOff className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {t("coupon.toggleDisable")}
                    </>
                  ) : (
                    <>
                      <Eye className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {t("coupon.toggleEnable")}
                    </>
                  )}
                </button>

                <button
                  onClick={() => openPopup(coupon._id)}
                  className='text-sm rounded-md px-3 py-1 text-white font-medium flex items-center bg-red-600 focus:bg-red-700 hover:bg-red-700 focus:bg-red-700'
                >
                  <Trash2 className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                  {t("coupon.delete")}
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
              className='bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className='text-xl font-bold mb-4 text-center'>
                {t("coupon.confirmDeleteTitle")}
              </h3>
              <p className='text-gray-500 mb-6 text-center'>
                {t("coupon.confirmDeleteMessage")}
              </p>
              <div className='flex justify-center gap-4'>
                <button
                  onClick={() => deleteCoupon(selectedCouponId)}
                  className='bg-red-500 hover:bg-red-600 focus:bg-red-600 px-4 py-2 rounded text-white'
                >
                  {t("coupon.confirmDeleteYes")}
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className='bg-gray-600 hover:bg-gray-500 focus:bg-gray-500 px-4 py-2 rounded text-white'
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