import { Minus, Plus, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import useSettingStore from "../stores/useSettingStore";
import { useTranslation } from "react-i18next";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();
  const { colorsList, sizesLetters, sizesNumbers } = useSettingStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const isSelectedSizeValid = sizesNumbers.some(size => size.name === item.selectedSize) 
  || sizesLetters.some(size => size.name === item.selectedSize);

  const selectedColorObj = colorsList.find(c => c._id === item.selectedColor) || null;

  return (
    <div className={`relative rounded-lg text-[var(--color-text-secondary)] p-4 shadow-sm bg-[var(--color-bg)] md:p-6 ${isRTL ? 'text-right' : 'text-left'}`}
         dir={isRTL ? 'rtl' : 'ltr'}>

      {/* زر الحذف */}
      <button
        className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-red-500 hover:text-red-600 focus:text-red-600 z-10`}
        onClick={() =>
          removeFromCart(item._id, item.selectedColor, item.selectedSize)
        }
        aria-label={t("cart.deleteItem")}
        title={t("cart.deleteItem")}
      >
        <Trash size={20} />
      </button>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">

        {/* صورة المنتج - محسنة للشاشات الصغيرة */}
        <div className="shrink-0 self-center md:self-auto">
          <Link to={`/product/${item._id}`} className="block">
            <img
              className="h-24 w-24 md:h-32 md:w-32 rounded-lg object-cover cursor-pointer hover:opacity-90 focus:opacity-90"
              src={Array.isArray(item.images) ? item.images[0] : item.image}
              alt={item.name}
            />
          </Link>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* عنوان المنتج */}
          <Link
            to={`/product/${item._id}`}
            className="block text-lg font-bold hover:text-[var(--color-text)] hover:underline focus:text-[var(--color-text)] focus:underline truncate"
            title={item.name}
          >
            {item.name}
          </Link>

          {/* اللون والحجم */}
          <div className="flex items-center gap-3 flex-wrap">
            {isSelectedSizeValid && (
              <span className="text-sm font-semibold bg-[var(--color-text)] text-white px-2 py-1 rounded-md min-w-[40px] text-center">
                {item.selectedSize}
              </span>
            )}
                      
            {selectedColorObj && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: selectedColorObj.hex }}
                />
                <span className="text-sm">{selectedColorObj.name}</span>
              </div>
            )}
          </div>

          {/* التحكم في الكمية والسعر - للشاشات الصغيرة */}
          <div className="flex items-center justify-between pt-2 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-bg-gray)] rounded-lg px-3 py-2">
                <button
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.selectedColor,
                      item.selectedSize,
                      item.quantity > 1 ? item.quantity - 1 : 1
                    )
                  }
                  aria-label={t("cart.decreaseQuantity")}
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[20px] text-center font-medium">{item.quantity}</span>
                <button
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.selectedColor,
                      item.selectedSize,
                      item.quantity + 1
                    )
                  }
                  aria-label={t("cart.increaseQuantity")}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* السعر للشاشات الصغيرة */}
            <div className="text-end">
              <p className="text-lg font-bold text-[var(--color-text)]">
                {((item.priceAfterDiscount ?? item.priceBeforeDiscount) * item.quantity).toLocaleString()} DA
              </p>
              {item.priceBeforeDiscount && item.priceBeforeDiscount > (item.priceAfterDiscount ?? Infinity) && (
                <p className="text-xs line-through text-gray-400">
                  {(item.priceBeforeDiscount * item.quantity).toLocaleString()} DA
                </p>
              )}
            </div>
          </div>

          {/* التحكم في الكمية والسعر - للشاشات المتوسطة والكبيرة */}
          <div className="hidden md:flex md:items-center md:justify-between md:pt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-[var(--color-bg-gray)] rounded-lg px-4 py-2">
                <button
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.selectedColor,
                      item.selectedSize,
                      item.quantity > 1 ? item.quantity - 1 : 1
                    )
                  }
                  aria-label={t("cart.decreaseQuantity")}
                >
                  <Minus size={20} />
                </button>
                <span className="min-w-[25px] text-center font-medium text-lg">{item.quantity}</span>
                <button
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.selectedColor,
                      item.selectedSize,
                      item.quantity + 1
                    )
                  }
                  aria-label={t("cart.increaseQuantity")}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* السعر للشاشات الكبيرة */}
            <div className="text-end">
              <p className="text-xl font-bold text-[var(--color-text)]">
                {((item.priceAfterDiscount ?? item.priceBeforeDiscount) * item.quantity).toLocaleString()} DA
              </p>
              {item.priceBeforeDiscount && item.priceBeforeDiscount > (item.priceAfterDiscount ?? Infinity) && (
                <p className="text-sm line-through text-gray-400">
                  {(item.priceBeforeDiscount * item.quantity).toLocaleString()} DA
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {t("cart.unitPrice")}: {(item.priceAfterDiscount ?? item.priceBeforeDiscount).toLocaleString()} DA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;