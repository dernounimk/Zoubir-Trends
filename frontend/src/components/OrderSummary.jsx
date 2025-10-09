import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const OrderSummary = () => {
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === 'ar';
	const { subtotal, total, coupon, isCouponApplied } = useCartStore();
	const navigate = useNavigate();

	const finalTotal = total;

	const handleGoToShipping = () => {
		navigate("/shipping-info");
	};

	return (
		<motion.div
			className='space-y-4 rounded-lg bg-[var(--color-bg)] p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-[var(--color-text)]'>{t("orderSummary.title")}</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-[var(--color-text-secondary)]'>{t("orderSummary.originalPrice")}</dt>
						<dd className='text-base font-medium text-[var(--color-text-secondary)]'>{subtotal} DA</dd>
					</dl>

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-[var(--color-text-secondary)]'>
								{t("orderSummary.coupon")} ({coupon.code})
							</dt>
							<dd className='text-base font-medium text-[var(--color-text)]'>{!isRTL ? "-" : ""}{coupon.discountAmount}{isRTL ? "-" : ""} DA</dd>
						</dl>
					)}

					<dl className='flex items-center justify-between gap-4 border-t border-[var(--color-bg-gray)] pt-2'>
						<dt className='text-base font-bold text-[var(--color-text-secondary)]'>{t("orderSummary.total")}</dt>
						<dd className='text-base font-bold text-[var(--color-text)]'>{finalTotal} DA</dd>
					</dl>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleGoToShipping}
				>
					{t("orderSummary.confirmOrder")}
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-[var(--color-text-secondary)]'>{t("orderSummary.or")}</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] hover:underline'
					>
						{t("orderSummary.continueShopping")}
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummary;
