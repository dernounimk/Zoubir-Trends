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

      {/* زر الحذف - يتغير موقعه حسب اللغة */}
      <button
        className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} text-red-500 hover:text-red-600 focus:text-red-600`}
        onClick={() =>
          removeFromCart(item._id, item.selectedColor, item.selectedSize)
        }
        aria-label={t("cart.deleteItem")}
        title={t("cart.deleteItem")}
      >
        <Trash />
      </button>

      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">

        {/* صورة المنتج */}
        <div className="shrink-0 md:order-1">
          <Link to={`/product/${item._id}`}>
            <img
              className="h-20 md:h-32 rounded object-cover cursor-pointer hover:opacity-90 focus:opacity-90"
              src={Array.isArray(item.images) ? item.images[0] : item.image}
              alt={item.name}
            />
          </Link>
        </div>

        {/* التحكم في الكمية والسعر */}
        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-bg-gray)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
              onClick={() =>
                updateQuantity(
                  item._id,
                  item.selectedColor,
                  item.selectedSize,
                  item.quantity > 1 ? item.quantity - 1 : 1
                )
              }
              aria-label={t("cart.quantity")}
            >
              <Minus/>
            </button>
            <p>{item.quantity}</p>
            <button
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-bg-gray)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text)]"
              onClick={() =>
                updateQuantity(
                  item._id,
                  item.selectedColor,
                  item.selectedSize,
                  item.quantity + 1
                )
              }
              aria-label={t("cart.quantity")}
            >
              <Plus/>
            </button>
          </div>

          {/* السعر */}
          <div className="text-end md:order-4 md:w-32">
            <p className="text-xl font-bold text-[var(--color-text)]">
              {item.priceAfterDiscount ?? item.priceBeforeDiscount} DA
            </p>
            {item.priceBeforeDiscount && item.priceBeforeDiscount > (item.priceAfterDiscount ?? Infinity) && (
              <p className="text-sm line-through text-gray-400">
                {item.priceBeforeDiscount} DA
              </p>
            )}
          </div>
        </div>

        {/* معلومات المنتج */}
        <div className="w-full min-w-0 flex-1 space-y-2 md:order-2 md:max-w-md">
          <Link
            to={`/product/${item._id}`}
            className="text-lg font-bold hover:text-[var(--color-text)] hover:underline focus:text-[var(--color-text)] focus:underline"
          >
            {item.name}
          </Link>

          {/* اللون والحجم */}
          <div className="flex items-center gap-4 flex-wrap">
          {isSelectedSizeValid && (
            <span className="text-base font-semibold bg-[var(--color-text)] text-white px-3 py-1 rounded-lg">
              {item.selectedSize}
            </span>
          )}
                      
          {selectedColorObj && (
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: selectedColorObj.hex }}
              />
              <span className="text-base">{selectedColorObj.name}</span>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;