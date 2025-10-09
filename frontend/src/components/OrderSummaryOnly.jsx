import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useTranslation } from "react-i18next";

const OrderSummaryOnly = () => {
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === 'ar';
	const {
		subtotal,
		total,
		coupon,
		isCouponApplied,
		deliveryPrice,
		shippingInfo,
		setDeliveryPrice,
	} = useCartStore();

	const finalTotal = total + (deliveryPrice || 0);

	useEffect(() => {
		if (!shippingInfo) {
			setDeliveryPrice(0);
		}
	}, [shippingInfo, setDeliveryPrice]);

	return (
		<motion.div
			className='space-y-4 rounded-lg bg-[var(--color-bg)] p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-[var(--color-text)]'>
				{t("orderSummary.title")}
			</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-[var(--color-text-secondary)]'>
							{t("orderSummary.originalPrice")}
						</dt>
						<dd className='text-base font-medium text-[var(--color-text-secondary)]'>{subtotal} DA</dd>
					</dl>

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-[var(--color-text)]'>
								{t("orderSummary.coupon")} ({coupon.code})
							</dt>
							<dd className='text-base font-medium text-[var(--color-text)]'>
								{!isRTL ? "-" : ""}{coupon.discountAmount}{isRTL ? "-" : ""} DA
							</dd>
						</dl>
					)}

					{deliveryPrice !== null && deliveryPrice !== undefined && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-[var(--color-text-secondary)]'>
								{t("orderSummary.delivery")} {shippingInfo?.location}
							</dt>
							<dd className='text-base font-medium text-[var(--color-text-secondary)]'>
								{deliveryPrice} DA
							</dd>
						</dl>
					)}

					<dl className='flex items-center justify-between gap-4 border-t border-[var(--color-bg-gray)] pt-2'>
						<dt className='text-base font-bold text-[var(--color-text-secondary)]'>
							{t("orderSummary.total")}
						</dt>
						<dd className='text-base font-bold text-[var(--color-text)]'>
							{finalTotal} DA
						</dd>
					</dl>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummaryOnly;
