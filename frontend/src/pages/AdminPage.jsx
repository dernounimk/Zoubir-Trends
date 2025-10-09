import { BarChart, PlusCircle, ShoppingBasket, ClipboardList, TicketPercent, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import { useProductStore } from "../stores/useProductStore";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";
import OrdersList from "../components/OrderList";
import CouponManager from "../components/CouponManager";
import LoadingSpinner from "../components/LoadingSpinner";
import SettingsManager from "../components/SettingsManager";

const tabs = [
  { id: "analytics", labelKey: "adminPage.tabs.analytics", icon: BarChart },
  { id: "create", labelKey: "adminPage.tabs.create", icon: PlusCircle },
  { id: "products", labelKey: "adminPage.tabs.products", icon: ShoppingBasket },
  { id: "orders", labelKey: "adminPage.tabs.orders", icon: ClipboardList },
  { id: "coupons", labelKey: "adminPage.tabs.coupons", icon: TicketPercent },
  { id: "settings", labelKey: "adminPage.tabs.settings", icon:  Settings},
];

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState("analytics");
  const { fetchAllProducts } = useProductStore();
  const { admin, checkAuth, checkingAuth } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!checkingAuth && !admin) {
      navigate("/admin/login");
    }
  }, [admin, checkingAuth]);


useEffect(() => {
  if (!checkingAuth &&!admin) {
    // ممكن تعطي وقت بسيط للتأكد قبل التنقل لو حبيت
    navigate("/admin/login");
  }
}, [admin, checkingAuth]);


  useEffect(() => {
    if (!checkingAuth && admin?.role === "admin") {
      fetchAllProducts();
    }
  }, [fetchAllProducts, admin, checkingAuth]);

  if (checkingAuth) return <LoadingSpinner />;
  if (!admin) return null; // أو صفحة فارغة تحجز العرض قبل التنقل

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-[var(--color-text)] text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t("adminPage.title")}
        </motion.h1>

        <div className="flex flex-nowrap gap-3 mb-8 overflow-x-auto sm:overflow-x-visible sm:justify-center scrollbar-x-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-opacity)] text-[var(--color-text-secondary)]"
              }`}
            >
              <tab.icon className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "orders" && <OrdersList />}
        {activeTab === "coupons" && <CouponManager />}
        {activeTab === "settings" && <SettingsManager />}
      </div>
    </div>
  );
};

export default AdminPage;
