import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import WilayaSelector from "../components/WilayaSelector";
import OrderSummaryOnly from "../components/OrderSummaryOnly";
import CartItem from "../components/CartItem";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "../lib/axios.js";
import { useTranslation } from "react-i18next";
import useSettingStore from "../stores/useSettingStore.js";

const ShippingInfoPage = () => {
  const { t } = useTranslation();

  const {
    cart,
    setDeliveryPrice,
    setShippingInfo,
    total,
    deliveryPrice,
    coupon,
    isCouponApplied,
    calculateTotals,
    removeFromCart
  } = useCartStore();

  const { deliverySettings, fetchMetaData } = useSettingStore();

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    const validateCartProducts = async () => {
      for (const item of cart) {
        try {
          await axios.get(`/products/${item._id}`);
        } catch {
          removeFromCart(item._id, item.selectedColor, item.selectedSize);
        }
      }
      calculateTotals();
    };

    if (cart.length > 0) validateCartProducts();
  }, [cart, removeFromCart, calculateTotals]);

  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    baladia: "",
    deliveryPlace: "office",
    note: "",
  });
  const [selectedWilaya, setSelectedWilaya] = useState("");

  const generateOrderNumber = () => {
    let num = "";
    const chars = "0123456789";
    for (let i = 0; i < 5; i++) {
      num += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return num;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const deliveryKey = form.deliveryPlace === "office" ? "officePrice" : "homePrice";
    const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
    const price = selectedDelivery ? selectedDelivery[deliveryKey] || 0 : 0;
    setDeliveryPrice(price);
  };

  useEffect(() => {
    if (selectedWilaya) {
      const deliveryKey = form.deliveryPlace === "office" ? "officePrice" : "homePrice";
      const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
      const price = selectedDelivery ? selectedDelivery[deliveryKey] || 0 : 0;
      setDeliveryPrice(price);
    }
  }, [selectedWilaya, form.deliveryPlace, setDeliveryPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      toast.error(t("shippingInfo.errors.invalidFullName"));
      return;
    }

    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(form.phoneNumber.trim())) {
      toast.error(t("shippingInfo.errors.invalidPhone"));
      return;
    }

    if (!selectedWilaya) {
      toast.error(t("shippingInfo.errors.selectWilaya"));
      return;
    }

    if (!form.baladia.trim() || form.baladia.trim().length < 3) {
      toast.error(t("shippingInfo.errors.invalidBaladia"));
      return;
    }

    setShippingInfo({ ...form, wilaya: selectedWilaya });

    const orderNumber = generateOrderNumber();
    const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
    const deliveryDays = selectedDelivery ? selectedDelivery.deliveryDays : null;

    const orderData = {
      orderNumber,
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      wilaya: selectedWilaya,
      baladia: form.baladia,
      deliveryPlace: form.deliveryPlace,
      deliveryPrice: deliveryPrice,
      note: form.note,
      products: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.priceAfterDiscount ?? item.priceBeforeDiscount,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      })),
      totalAmount: total + (deliveryPrice || 0),
      couponCode: isCouponApplied ? coupon.code : null,
    };

    try {
      // ✅ استخدام axios بدلاً من fetch
      const response = await axios.post("/orders", orderData);

      toast.success(t("shippingInfo.success.orderSent"));
      navigate("/purchase-success", { state: { orderNumber, deliveryDays } });
    } catch (error) {
      console.error("Order creation error:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("shippingInfo.errors.orderError"));
      }
    }
  };

  const shippingCost =
    selectedWilaya && deliverySettings[selectedWilaya]
      ? deliverySettings[selectedWilaya][form.deliveryPlace]
      : 0;

  return (
    <div className="py-10 px-4 md:px-8 max-w-screen-xl mx-auto">
      {cart.length === 0 ? (
        <EmptyCartUI t={t} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            className="w-full bg-[var(--color-bg)] p-6 rounded-2xl shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              {t("shippingInfo.title")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/** Full Name */}
              <InputField
                label={t("shippingInfo.fullName")}
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
              {/** Phone Number */}
              <InputField
                label={t("shippingInfo.phoneNumber")}
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
              {/** Wilaya Selector */}
              <WilayaSelector selectedWilaya={selectedWilaya} setSelectedWilaya={setSelectedWilaya} />
              {/** Baladia */}
              <InputField
                label={t("shippingInfo.baladia")}
                id="baladia"
                name="baladia"
                value={form.baladia}
                onChange={handleChange}
              />
              {/** Note */}
              <div>
                <label className="block mb-2 text-[var(--color-text-secondary)] font-medium">{t("shippingInfo.note")}</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
                />
              </div>
              {/** Delivery Place */}
              <DeliveryPlaceSelector form={form} handleChange={handleChange} t={t} />
              <button
                type="submit"
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 text-lg"
              >
                {t("shippingInfo.confirmOrder")}
              </button>
            </form>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="border-b pb-3">
              <h3 className="text-xl text-[var(--color-text)] font-semibold">{t("shippingInfo.detail")}</h3>
            </div>
            <OrderSummaryOnly shippingCost={shippingCost} />
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/** Input Field Component */
const InputField = ({ label, id, name, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
    />
  </div>
);

/** Delivery Place Radio Selector */
const DeliveryPlaceSelector = ({ form, handleChange, t }) => (
  <div>
    <span className="block mb-2 font-medium text-[var(--color-text-secondary)]">{t("shippingInfo.deliveryPlace")}</span>
    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)]">
        <input
          type="radio"
          name="deliveryPlace"
          value="office"
          checked={form.deliveryPlace === "office"}
          onChange={handleChange}
          className="w-5 h-5 accent-[var(--color-accent)] cursor-pointer"
        />
        {t("shippingInfo.office")}
      </label>
      <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)]">
        <input
          type="radio"
          name="deliveryPlace"
          value="home"
          checked={form.deliveryPlace === "home"}
          onChange={handleChange}
          className="w-5 h-5 accent-[var(--color-accent)] cursor-pointer"
        />
        {t("shippingInfo.home")}
      </label>
    </div>
  </div>
);

const EmptyCartUI = ({ t }) => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-5 py-20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShoppingCart className="h-24 w-24 text-[var(--color-text-muted)]" />
    <h3 className="text-2xl font-bold text-[var(--color-text)]">{t("shippingInfo.emptyCart.title")}</h3>
    <p className="text-[var(--color-text-secondary)] text-center max-w-xs">{t("shippingInfo.emptyCart.subtitle")}</p>
    <Link
      className="mt-4 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-white font-medium transition hover:bg-[var(--color-accent-hover)] shadow-md"
      to="/"
    >
      {t("shippingInfo.emptyCart.startShopping")}
    </Link>
  </motion.div>
);

export default ShippingInfoPage;