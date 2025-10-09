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
  
      if (cart.length > 0) {
        validateCartProducts();
      }
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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
  
    const deliveryKey = form.deliveryPlace === "office"? "officePrice": "homePrice";
    const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
    const price = selectedDelivery? selectedDelivery[deliveryKey] || 0: 0;
    setDeliveryPrice(price);
  };

  useEffect(() => {
    if (selectedWilaya) {
      const deliveryKey = form.deliveryPlace === "office"? "officePrice": "homePrice";
      const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
      const price = selectedDelivery? selectedDelivery[deliveryKey] || 0: 0;
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

    let orderNumber = generateOrderNumber();
    const selectedDelivery = deliverySettings.find(d => d.state === selectedWilaya);
    const deliveryDays = selectedDelivery? selectedDelivery.deliveryDays: null;

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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || t("shippingInfo.errors.orderFailed"));
        return;
      }

      const data = await response.json();
      toast.success(t("shippingInfo.success.orderSent"));
      navigate("/purchase-success", { state: { orderNumber, deliveryDays } });
    } catch (error) {
      console.error(error);
      toast.error(t("shippingInfo.errors.orderError"));
    }
  };

  const shippingCost =
    selectedWilaya && deliverySettings[selectedWilaya]
      ? deliverySettings[selectedWilaya][form.deliveryPlace]
      : 0;

  return (
    <div className="py-8 md:py-12 px-4 md:px-6 max-w-screen-xl mx-auto">
      {cart.length === 0 ? (
        <EmptyCartUI t={t} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)] border-b pb-2">
              {t("shippingInfo.title")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  {t("shippingInfo.fullName")}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  {t("shippingInfo.phoneNumber")}
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                />
              </div>
              <WilayaSelector
                selectedWilaya={selectedWilaya}
                setSelectedWilaya={setSelectedWilaya}
              />
              <div>
                <label htmlFor="baldia" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  {t("shippingInfo.baladia")}
                </label>
                <input
                  type="text"
                  id="baldia"
                  name="baladia"
                  value={form.baladia}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block mb-1 text-[var(--color-text-secondary)]">{t("shippingInfo.note")}</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <span className="block mb-2 font-medium text-[var(--color-text-secondary)]">{t("shippingInfo.deliveryPlace")}</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center cursor-pointer gap-2 text-[var(--color-text-secondary)]">
                    <input
                      type="radio"
                      name="deliveryPlace"
                      value="office"
                      checked={form.deliveryPlace === "office"}
                      onChange={handleChange}
                      className="w-6 h-6 accent-[var(--color-accent)] cursor-pointer"
                    />
                    {t("shippingInfo.office")}
                  </label>
                  <label className="flex items-center gap-2 text-[var(--color-text-secondary)] cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryPlace"
                      value="home"
                      checked={form.deliveryPlace === "home"}
                      onChange={handleChange}
                      className="w-6 h-6 accent-[var(--color-accent)] cursor-pointer"
                    />
                    {t("shippingInfo.home")}
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white w-full text-center font-medium py-2.5 px-4 rounded-lg shadow-md transition duration-200"
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

const EmptyCartUI = ({ t }) => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShoppingCart className="h-24 w-24 text-[var(--color-text-secondary)]" />
    <h3 className="text-2xl font-semibold ">{t("shippingInfo.emptyCart.title")}</h3>
    <p className="text-[var(--color-text-secondary)]">{t("shippingInfo.emptyCart.subtitle")}</p>
    <Link
      className="mt-4 rounded-md bg-[var(--color-accent)] px-6 py-2 text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      to="/"
    >
      {t("shippingInfo.emptyCart.startShopping")}
    </Link>
  </motion.div>
);

export default ShippingInfoPage;
