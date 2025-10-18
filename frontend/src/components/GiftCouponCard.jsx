import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const GiftCouponCard = () => {
  const { t } = useTranslation();
  const [userInputCode, setUserInputCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    coupon,
    isCouponApplied,
    applyCoupon,
    getMyCoupon,
    removeCoupon,
  } = useCartStore();

  useEffect(() => {
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    if (coupon) {
      setUserInputCode(coupon.code || "");
    }
  }, [coupon, isCouponApplied]);

  const handleApplyCoupon = async () => {
    // التحقق من أن الإدخال غير فارغ
    if (!userInputCode.trim()) {
      toast.error(t("giftCoupon.notValidCode"));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await applyCoupon(userInputCode.trim());
      
      if (result.success) {
        toast.success(t("giftCoupon.appliedSuccess"));
      }
      // إذا فشل، سيتم عرض toast.error من داخل applyCoupon
    } catch (error) {
      toast.error(t("giftCoupon.applyError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setUserInputCode("");
    toast.success(t("giftCoupon.removedSuccess"));
  };

  return (
    <motion.div
      className='space-y-4 rounded-lg border border-[var(--color-bg)] bg-[var(--color-bg)] p-4 shadow-sm sm:p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className='space-y-4'>
        <div>
          <label htmlFor='voucher' className='mb-2 block text-sm font-medium text-[var(--color-text-secondary)]'>
            {t("giftCoupon.label")}
          </label>
          <input
            type='text'
            id='voucher'
            name='code'
            className='block w-full rounded-lg border border-gray-400 bg-[var(--color-bg-gray)] p-2.5 text-sm text-[var(--color-text-secondary)] placeholder-gray-400 focus:border-[var(--color-text)] focus:ring-[var(--color-text)]'
            placeholder={t("giftCoupon.placeholder")}
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
            disabled={isCouponApplied || isLoading}
          />
        </div>

        {!isCouponApplied ? (
          <motion.button
            type='button'
            className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:ring-[var(--color-accent-hover)]'
            }`}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            onClick={handleApplyCoupon}
            disabled={isLoading}
          >
            {isLoading ? t("giftCoupon.applying") : t("giftCoupon.apply")}
          </motion.button>
        ) : (
          <motion.button
            type='button'
            className='flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveCoupon}
          >
            {t("giftCoupon.remove")}
          </motion.button>
        )}
      </div>

      {coupon && isCouponApplied && (
        <div className='mt-4'>
          <h3 className='text-lg font-medium text-[var(--color-text-secondary)]'>
            {t("giftCoupon.applied")}
          </h3>
          <p className='mt-2 text-sm text-[var(--color-text)]'>
            {coupon.code} - {t("giftCoupon.discount", { amount: coupon.discountAmount })}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCouponCard;