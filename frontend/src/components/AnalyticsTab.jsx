import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { createPortal } from "react-dom";
import { 
  Package, 
  ShoppingCart, 
  Star,
  CheckCircle,
  Clock,
  Ticket,
  Zap,
  ZapOff,
  TrendingUp,
  TicketPercent,
  List,
  X
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import LoadingSpinner from "./LoadingSpinner";
import { useTranslation } from "react-i18next";

export const AnalyticsTab = () => {
  const { t, i18n } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState({
    products: { total: 0, featured: 0, regular: 0 },
    orders: { total: 0, confirmed: 0, pending: 0 },
    coupons: { total: 0, active: 0, inactive: 0 },
    revenue: { 
      withDelivery: 0, 
      withoutDelivery: 0,
      totalDiscounts: 0,
      netWithDelivery: 0,
      netWithoutDelivery: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailyOrdersData, setDailyOrdersData] = useState([]);
  const [revenueMode, setRevenueMode] = useState("withoutDelivery");
  const [showRevenuePopup, setShowRevenuePopup] = useState(false);
  const [selectedRange, setSelectedRange] = useState(30);
  const [selectedDate, setSelectedDate] = useState("");

  const formatNumber = (value) => value.toLocaleString("en-US");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
        setDailyOrdersData(response.data.dailySalesData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  // ✅ إنشاء بيانات آخر N أيام دائمًا
  const generateLastDaysData = (daysCount = 30) => {
    const today = new Date();
    const daysArray = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const isoDate = date.toISOString().split("T")[0];
      const existing = dailyOrdersData.find(
        (d) => new Date(d.date).toISOString().split("T")[0] === isoDate
      );

      daysArray.push(
        existing || {
          date: isoDate,
          orders: 0,
          netRevenueWithoutDelivery: 0,
          netRevenueWithDelivery: 0,
        }
      );
    }

    return daysArray;
  };
// ✅ عرض آخر 7 أيام فقط في المنحنى بغض النظر عن الفلاتر
const filteredData = (() => {
  // إذا كانت البيانات أقل من 7 أيام، نستخدمها كما هي
  if (dailyOrdersData.length <= 7) return generateLastDaysData(7);

  // ترتيب حسب التاريخ تصاعديًا
  const sorted = [...dailyOrdersData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // أخذ آخر 7 أيام فقط
  const lastSeven = sorted.slice(-7);

  // توليد بيانات الأيام الناقصة إذا لم تكن متوفرة
  return generateLastDaysData(7).map((day) => {
    const existing = lastSeven.find(
      (d) => new Date(d.date).toISOString().split("T")[0] === day.date
    );
    return (
      existing || {
        date: day.date,
        orders: 0,
        netRevenueWithoutDelivery: 0,
        netRevenueWithDelivery: 0,
      }
    );
  });
})();


  return (
    <motion.div
      className="max-w-7xl mx-auto px-6 py-8 bg-[var(--color-bg)] rounded-2xl shadow-md border border-[var(--color-border)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnalyticsCard title={t("analytics.totalProducts")} value={analyticsData.products.total} icon={Package} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.featuredProducts")} value={analyticsData.products.featured} icon={Star} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.regularProducts")} value={analyticsData.products.regular} icon={Package} formatNumber={formatNumber}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnalyticsCard title={t("analytics.totalOrders")} value={analyticsData.orders.total} icon={ShoppingCart} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.confirmedOrders")} value={analyticsData.orders.confirmed} icon={CheckCircle} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.pendingOrders")} value={analyticsData.orders.pending} icon={Clock} formatNumber={formatNumber}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnalyticsCard title={t("analytics.totalCoupons")} value={analyticsData.coupons.total} icon={Ticket} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.activeCoupons")} value={analyticsData.coupons.active} icon={Zap} formatNumber={formatNumber}/>
        <AnalyticsCard title={t("analytics.inactiveCoupons")} value={analyticsData.coupons.inactive} icon={ZapOff} formatNumber={formatNumber}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <AnalyticsCard
          title={t("analytics.totalDiscounts")}
          value={analyticsData.revenue.totalDiscounts}
          icon={TicketPercent}
          unit={t("analytics.revenueUnit")}
          formatNumber={formatNumber}
        />
        <RevenueCard 
          revenueMode={revenueMode}
          setRevenueMode={setRevenueMode}
          analyticsData={analyticsData}
          t={t}
          formatNumber={formatNumber}
          onShowPopup={() => setShowRevenuePopup(true)}
        />
      </div>

      {/* Chart */}
{/* Chart */}
{/* Chart */}
<div
  className="bg-[var(--color-bg-gray)] rounded-xl p-4 sm:p-6 border border-[var(--color-border)] shadow-inner overflow-x-auto"
>
  <div dir="ltr" className="min-w-[600px] sm:min-w-full">
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={filteredData}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="date"
          stroke="var(--color-text-secondary)"
          tick={{
            fontSize: window.innerWidth < 640 ? 10 : 15, // ✅ تصغير في الشاشات الصغيرة
          }}
          tickFormatter={(value, index) => {
            const date = new Date(value);
            const isArabic = i18n.language === "ar";
            const monthName = date.toLocaleDateString(
              isArabic ? "ar-EG" : "en-US",
              { month: "short" }
            );
            const day = date.toLocaleDateString("en-US", { day: "numeric" });
            return `${day} ${monthName}`;
          }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          tick={{
            fontSize: window.innerWidth < 640 ? 10 : 12, // ✅ نفس الشيء
          }}
          width={50}
          tickFormatter={(value, index) => (index === 0 ? "" : formatNumber(value))}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.8)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: window.innerWidth < 640 ? "0.75rem" : "0.9rem", // ✅ حجم أصغر على الموبايل
          }}
          formatter={(value) => formatNumber(value)}
        />
        <Legend
          wrapperStyle={{
            fontSize: window.innerWidth < 640 ? "0.7rem" : "0.9rem", // ✅ تصغير الليجند
            paddingTop: "10px",
          }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#faa72a"
          name={t("analytics.ordersLabel")}
          strokeWidth={2}
          dot={window.innerWidth > 640} // ✅ بدون نقاط في الهاتف
        />
        <Line
          type="monotone"
          dataKey={
            revenueMode === "withDelivery"
              ? "netRevenueWithDelivery"
              : "netRevenueWithoutDelivery"
          }
          stroke="#ffb341"
          name={t("analytics.revenueLabel")}
          strokeWidth={2}
          dot={window.innerWidth > 640}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>



      {/* Popup: سجل الأرباح */}
      {showRevenuePopup &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
            <div
              className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] rounded-lg shadow-lg w-[90%] max-w-3xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-bg-gray)] flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--color-text)]">
                  {t("analytics.revenueHistory")}
                </h3>
                <button
                  onClick={() => setShowRevenuePopup(false)}
                  className="hover:text-gray-500"
                  aria-label="close"
                >
                  <X size={25} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Selectors */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={selectedRange}
                    onChange={(e) => {
                      setSelectedRange(Number(e.target.value));
                      setSelectedDate("");
                    }}
                    className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-md px-3 py-1 text-sm focus:outline-none"
                  >
                    <option value={7}>{t("analytics.last7Days")}</option>
                    <option value={14}>{t("analytics.last14Days")}</option>
                    <option value={30}>{t("analytics.last30Days")}</option>
                  </select>

                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-md px-3 py-1 text-sm focus:outline-none"
                  >
                    <option value="">{t("analytics.allDates")}</option>
                    {dailyOrdersData.map((entry, idx) => {
                      const date = new Date(entry.date);
                      const formattedDate = date.toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      );
                      const value = date.toISOString().split("T")[0];
                      return (
                        <option key={idx} value={value}>
                          {formattedDate}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-y-auto max-h-[400px] border border-[var(--color-border)] rounded-xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[var(--color-bg-gray)] sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-left text-[var(--color-text)] font-semibold">{t("analytics.date")}</th>
                        <th className="py-2 px-3 text-left text-[var(--color-text)] font-semibold">{t("analytics.numberOfOrders")}</th>
                        <th className="py-2 px-3 text-left text-[var(--color-text)] font-semibold">{t("analytics.revenueLabel")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateLastDaysData(selectedRange)
                        .filter((entry) => {
                          if (!selectedDate) return true;
                          const day = new Date(entry.date).toISOString().split("T")[0];
                          return day === selectedDate;
                        })
                        .map((entry, idx) => {
                          const date = new Date(entry.date);
                          const formattedDate = date.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                          const revenueValue =
                            revenueMode === "withDelivery"
                              ? entry.netRevenueWithDelivery
                              : entry.netRevenueWithoutDelivery;
                          return (
                            <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-gray)] transition">
                              <td className="py-2 px-3 text-[var(--color-text-secondary)]">{formattedDate}</td>
                              <td className="py-2 px-3 text-[var(--color-text-secondary)]">{formatNumber(entry.orders)}</td>
                              <td className="py-2 px-3 text-[var(--color-text-secondary)]">
                                {formatNumber(revenueValue)} {t("analytics.revenueUnit")}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </motion.div>
  );
};

/* بطاقة عامة */
const AnalyticsCard = ({ title, value, icon: Icon, unit, formatNumber }) => (
  <div
    className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-2xl p-4 shadow-md transition-all"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[var(--color-text)] text-sm font-semibold">{title}</p>
        <h3 className="text-[var(--color-text-secondary)] text-xl font-bold">
          {formatNumber(value)} {unit && <span>{unit}</span>}
        </h3>
      </div>
      <div className="bg-[var(--color-bg)] p-3 rounded-xl flex items-center justify-center shadow-inner">
        <Icon className="w-7 h-7 text-[var(--color-accent)]" />
      </div>
    </div>
  </div>
);
/* بطاقة الإيرادات */
const RevenueCard = ({ revenueMode, setRevenueMode, analyticsData, t, formatNumber, onShowPopup }) => (
  <div
    className="bg-[var(--color-bg-gray)] border border-[var(--color-border)] rounded-xl p-5 shadow-md"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* العنوان */}
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-[var(--color-text)] text-sm font-semibold mb-1">
          {revenueMode === "withDelivery"
            ? t("analytics.netRevenueWithDelivery")
            : t("analytics.netRevenueWithoutDelivery")}
        </p>
        <h3 className="text-[var(--color-text-secondary)] text-2xl font-bold">
          {revenueMode === "withDelivery"
            ? formatNumber(analyticsData.revenue.netWithDelivery)
            : formatNumber(analyticsData.revenue.netWithoutDelivery)}{" "}
          {t("analytics.revenueUnit")}
        </h3>
      </div>
      <TrendingUp className="w-10 h-10 text-[var(--color-accent)] opacity-70" />
    </div>

    {/* أزرار التحكم */}
    <div className="flex justify-between items-center flex-wrap gap-3 pt-3">
      {/* أزرار التبديل */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
        <button
          onClick={() => setRevenueMode("withoutDelivery")}
          className={`px-4 py-2 text-sm font-medium transition ${
            revenueMode === "withoutDelivery"
              ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
              : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          }`}
        >
          {t("analytics.withoutDelivery")}
        </button>
        <button
          onClick={() => setRevenueMode("withDelivery")}
          className={`px-4 py-2 text-sm font-medium transition ${
            revenueMode === "withDelivery"
              ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]"
              : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          }`}
        >
          {t("analytics.withDelivery")}
        </button>
      </div>

      {/* زر عرض السجل */}
      <button
        onClick={onShowPopup}
        className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] transition"
      >
        <List className="w-4 h-4" />
        {t("analytics.revenueHistory")}
      </button>
    </div>
  </div>
);

export default AnalyticsTab;
