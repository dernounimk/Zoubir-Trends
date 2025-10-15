import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useOrderStore } from "../stores/userOrderStore.js";
import { createPortal } from "react-dom";
import { Trash, Copy, CheckCheck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSettingStore from '../stores/useSettingStore.js';
import dayjs from "dayjs";
import LoadingSpinner from "./LoadingSpinner.jsx";

const OrderList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { orders, fetchOrders, deleteOrder, toggleOrderConfirmation, updateDeliveryPhone } = useOrderStore();
  const { colorsList } = useSettingStore();
  const [isLoading, setIsLoading] = useState(true);

  const headers = [
    t("orders.headers.num"),
    t("orders.headers.customer"),
    t("orders.headers.phone"),
    t("orders.headers.wilaya"),
    t("orders.headers.status"),
  ];

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTypeIndex, setSearchTypeIndex] = useState(0);
  const searchTypes = ['orderNumber', 'fullName', 'phoneNumber'];
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stateFilter, setStateFilter] = useState('all');
  const [clientAskforPhone, setClientAskforPhone] = useState(false);
  const [hasLongPressed, setHasLongPressed] = useState(false);
  
  // 🔥 إصلاح: فلترة وترتيب الطلبات مع معالجة القيم غير المعرفة
  const filteredSortedOrders = useMemo(() => {
    let result = Array.isArray(orders) ? [...orders] : [];

    // فلترة حسب الحالة
    if (statusFilter !== 'all') {
      const isConfirmed = statusFilter === 'confirmed';
      result = result.filter(order => order?.isConfirmed === isConfirmed);
    }

    // فلترة حسب الولاية
    if (stateFilter !== 'all') {
      result = result.filter(order => order?.wilaya === stateFilter);
    }

    // فلترة بحث حسب الحقل
    if (searchQuery) {
      const field = searchTypes[searchTypeIndex];
      result = result.filter(order =>
        (order?.[field] ?? '').toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (clientAskforPhone) {
      result = result.filter(order => order?.isAskForPhone);
    }

    // ترتيب حسب التاريخ
    result.sort((a, b) => {
      const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, statusFilter, sortOrder, searchQuery, searchTypeIndex, stateFilter, clientAskforPhone]);

  useEffect(() => {
    if (selectedOrder?.deliveryPhone) {
      setDeliveryPhone(selectedOrder.deliveryPhone);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (selectedOrders.length === 0) {
      setIsSelectionMode(false);
      setSelectAll(false);
    } else {
      setSelectAll(selectedOrders.length === orders.length && orders.length > 0);
    }
  }, [selectedOrders, orders]);

  const handleSave = async (orderId) => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const updatedOrder = await updateDeliveryPhone(orderId, deliveryPhone.trim());
      toast.success(t("orders.numberSaved"));
      setSelectedOrder((prev) => ({...prev, deliveryPhone: updatedOrder.deliveryPhone }));
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const navigate = useNavigate();

  const hasMixedStatus = selectedOrders.length > 0 && 
    orders.some(o => selectedOrders.includes(o?._id) && o?.isConfirmed) &&
    orders.some(o => selectedOrders.includes(o?._id) && !o?.isConfirmed);

  const allConfirmed = selectedOrders.length > 0 && 
    selectedOrders.every(id => orders.find(o => o?._id === id)?.isConfirmed);

  const toggleConfirmation = async () => {
    if (selectedOrders.length === 0 || hasMixedStatus) return;
    try {
      await toggleOrderConfirmation(selectedOrders);
      toast.success(
        allConfirmed
          ? t("orders.unconfirmSuccess", { count: selectedOrders.length })
          : t("orders.confirmSuccess", { count: selectedOrders.length })
      );
    } catch (error) {
      toast.error(t("orders.toggleError"));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchOrders();
      } catch (error) {
        console.error("❌ خطأ في جلب الطلبات:", error);
        toast.error(t("orders.loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchOrders, t]);

  // دالة لتحويل ID اللون إلى كائن لون كامل
  const getFullColorData = (colorId) => {
    if (!colorId) return null;
    return colorsList.find(c => c._id === colorId) || 
    { _id: colorId, name: colorId, hex: '#cccccc' };
  };

  const handleDelete = async () => {
    try {
      if (selectedOrderId) {
        await deleteOrder(selectedOrderId);
        toast.success(t("orders.deleteSingle"));
      } else if (selectedOrders.length > 0) {
        await Promise.all(selectedOrders.map((id) => deleteOrder(id)));
        toast.success(t("orders.deleteSuccess", { count: selectedOrders.length }));
        setSelectedOrders([]);
        setSelectAll(false);
      }
    } catch (error) {
      toast.error(t("orders.deleteError"));
    } finally {
      setShowPopup(false);
      setSelectedOrderId(null);
    }
  };

  function highlightText(text = '', query, highlight) {
    if (!highlight || !query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-400 text-black rounded px-0.5">{part}</span>
      ) : (
        part
      )
    );
  }

  const searchFields = [
    { key: 'orderNumber', label: t("orders.orderNumber") },
    { key: 'fullName', label: t("orders.fullName") },
    { key: 'phoneNumber', label: t("orders.phoneNumber") }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="bg-[var(--color-bg-gray)] text-[var(--color-text-secondary)] shadow-xl rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg mb-1 text-s">
        {/* زر تحديد الكل */}
        <div className="flex-none">
          <label className={`inline-flex gap-1 items-center cursor-pointer text-[var(--color-text-secondary)] shadow-xl select-none ${selectAll? "bg-[var(--color-accent-hover)]": "bg-[var(--color-bg)]"} rounded-md px-3 py-2 transition`}>
            <input
              type="checkbox"
              className="peer w-5 h-5 appearance-none rounded cursor-pointer checked:bg-[var(--color-accent-hover)] focus:outline-none transition-colors"
              checked={selectAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectAll(checked);
                setSelectedOrders(checked? filteredSortedOrders.map(o => o._id): []);
                setIsSelectionMode(checked);
              }}
            />
            <span className="absolute w-5 h-5 flex items-center justify-center pointer-events-none">
              <CheckCheck className={`${selectAll? 'text-white': ''}`} />
            </span>
            <span className={`${selectAll? 'text-white': ''}`}>{t("orders.selectAll")}</span>
          </label>
        </div>

        {/* فلترة الحالة */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-none rounded px-3 py-2.5 shadow-xl bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)]"
        >
          <option value="all">{t("orders.all")}</option>
          <option value="confirmed">{t("orders.confirmed")}</option>
          <option value="unconfirmed">{t("orders.pending")}</option>
        </select>

        {/* فلترة الولاية */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="flex-none shadow-xl rounded px-3 py-2.5 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)]"
            >
          <option value="all">كل الولايات</option>
          <option value="01 - أدرار">01 - أدرار</option>
          <option value="02 - الشلف">02 - الشلف</option>
          <option value="03 - الأغواط">03 - الأغواط</option>
          <option value="04 - أم البواقي">04 - أم البواقي</option>
          <option value="05 - باتنة">05 - باتنة</option>
          <option value="06 - بجاية">06 - بجاية</option>
          <option value="07 - بسكرة">07 - بسكرة</option>
          <option value="08 - بشار">08 - بشار</option>
          <option value="09 - البليدة">09 - البليدة</option>
          <option value="10 - البويرة">10 - البويرة</option>
          <option value="11 - تمنراست">11 - تمنراست</option>
          <option value="12 - تبسة">12 - تبسة</option>
          <option value="13 - تلمسان">13 - تلمسان</option>
          <option value="14 - تيارت">14 - تيارت</option>
          <option value="15 - تيزي وزو">15 - تيزي وزو</option>
          <option value="16 - الجزائر">16 - الجزائر</option>
          <option value="17 - الجلفة">17 - الجلفة</option>
          <option value="18 - جيجل">18 - جيجل</option>
          <option value="19 - سطيف">19 - سطيف</option>
          <option value="20 - سعيدة">20 - سعيدة</option>
          <option value="21 - سكيكدة">21 - سكيكدة</option>
          <option value="22 - سيدي بلعباس">22 - سيدي بلعباس</option>
          <option value="23 - عنابة">23 - عنابة</option>
          <option value="24 - قالمة">24 - قالمة</option>
          <option value="25 - قسنطينة">25 - قسنطينة</option>
          <option value="26 - المدية">26 - المدية</option>
          <option value="27 - مستغانم">27 - مستغانم</option>
          <option value="28 - المسيلة">28 - المسيلة</option>
          <option value="29 - معسكر">29 - معسكر</option>
          <option value="30 - ورقلة">30 - ورقلة</option>
          <option value="31 - وهران">31 - وهران</option>
          <option value="32 - البيض">32 - البيض</option>
          <option value="33 - إليزي">33 - إليزي</option>
          <option value="34 - برج بوعريريج">34 - برج بوعريريج</option>
          <option value="35 - بومرداس">35 - بومرداس</option>
          <option value="36 - الطارف">36 - الطارف</option>
          <option value="37 - تندوف">37 - تندوف</option>
          <option value="38 - تيسمسيلت">38 - تيسمسيلت</option>
          <option value="39 - الوادي">39 - الوادي</option>
          <option value="40 - خنشلة">40 - خنشلة</option>
          <option value="41 - سوق أهراس">41 - سوق أهراس</option>
          <option value="42 - تيبازة">42 - تيبازة</option>
          <option value="43 - ميلة">43 - ميلة</option>
          <option value="44 - عين الدفلى">44 - عين الدفلى</option>
          <option value="45 - النعامة">45 - النعامة</option>
          <option value="46 - عين تموشنت">46 - عين تموشنت</option>
          <option value="47 - غرداية">47 - غرداية</option>
          <option value="48 - غليزان">48 - غليزان</option>
          <option value="49 - تيميمون">49 - تيميمون</option>
          <option value="50 - برج باجي مختار">50 - برج باجي مختار</option>
          <option value="51 - أولاد جلال">51 - أولاد جلال</option>
          <option value="52 - بني عباس">52 - بني عباس</option>
          <option value="53 - عين صالح">53 - عين صالح</option>
          <option value="54 - عين قزام">54 - عين قزام</option>
          <option value="55 - تقرت">55 - تقرت</option>
          <option value="56 - جانت">56 - جانت</option>
          <option value="57 - المغير">57 - المغير</option>
          <option value="58 - المنيعة">58 - المنيعة</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc'? 'asc': 'desc')}
          className={`flex-none w-20 rounded-md shadow-xl transition ${!isRTL ? "text-sm py-2.5" : "py-2"} ${
            sortOrder !== 'desc'? "bg-[var(--color-accent-hover)]": "bg-[var(--color-bg)]"
          }`}
        >
        {t("orders.lastFirst")}
        </button>
        
        <button
          onClick={() => setClientAskforPhone(prev =>!prev)}
          className={`cursor-pointer select-none shadow-xl rounded-md px-2 py-2 transition ${
            clientAskforPhone? "bg-[var(--color-accent-hover)]": "bg-[var(--color-bg)]"
          }`}
        >
          {/* ممكن تضيف أيقونة هنا */}
          <span>{t("orders.requireNumber")}</span>
        </button>

      <div className="flex overflow-hidden rounded-lg shadow-xl bg-[var(--color-bg-gray)] border-2 border-[var(--color-accent-hover)]">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder={`${t("orders.searchBy")} ${searchFields[searchTypeIndex].label}`}
    className="flex-grow min-w-[200px] bg-[var(--color-bg)] placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-0"
    style={{ border: 'none' }}
  />
  <button
    onClick={() => setSearchTypeIndex((prev) => (prev + 1) % searchFields.length)}
    className="w-30 bg-[var(--color-accent-hover)] text-white px-4 py-2 transition whitespace-nowrap rounded-none"
    style={{ border: 'none' }}
    title={t("orders.changeSearch")}
  >
    {searchFields[searchTypeIndex].label}
  </button>
</div>

      </div>

        {selectedOrders.length > 0 && (
          <motion.div 
            className="bg-[var(--color-bg-opacity)] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
          >
                <p className="text-sm whitespace-nowrap">
                  {t("orders.selected", { count: selectedOrders.length })}
                </p>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <motion.button
                    onClick={toggleConfirmation}
                    className={`px-3 py-1.5 rounded text-sm flex items-center text-white gap-1 ${
                      hasMixedStatus
                        ? "bg-gray-500 cursor-not-allowed"
                        : allConfirmed
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                    disabled={hasMixedStatus}
                    whileHover={{ scale: hasMixedStatus ? 1 : 1.05 }}
                    whileTap={{ scale: hasMixedStatus ? 1 : 0.95 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden xs:inline">
                      {allConfirmed
                        ? t("orders.unconfirmSelected")
                        : t("orders.confirmSelected")
                      }
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowPopup(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="hidden xs:inline">{t("orders.deleteSelected")}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setSelectedOrders([]);
                      setSelectAll(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="hidden xs:inline">{t("orders.cancelSelection")}</span>
                  </motion.button>
                </div>
              </motion.div>
          )}

            <div className="w-full overflow-x-auto rounded-b-xl scrollbar-x-hide mt-1">
        <table className="min-w-full table-auto divide-y select-none divide-[var(--color-bg-gray)] text-xs">
          <thead className="bg-[var(--color-bg)] text-center">
            <tr>
              {headers.map((title, i) => (
                <th
                  key={i}
                  className="px-4 text-center py-3 font-semibold whitespace-nowrap"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-gray)] divide-y divide-[var(--color-bg)]">
            {Array.isArray(filteredSortedOrders) && filteredSortedOrders.map((order) => (
              <tr              
                key={order?._id}
                onClick={() => {
                  if (!isSelectionMode && order) {
                    setSelectedOrder(order);
                  }
                }}
                onMouseDown={() => {
                  if (pressTimer || !order) return;
                  if (!isSelectionMode) {
                    const timer = setTimeout(() => {
                      setIsSelectionMode(true);
                      setPressTimer(null);
                    }, 600);
                    setPressTimer(timer);
                  }
                }}
                onMouseUp={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                  if (isSelectionMode && order) {
                    if (selectedOrders.includes(order._id)) {
                      setSelectedOrders(prev => prev.filter(id => id !== order._id));
                    } else {
                      setSelectedOrders(prev => [...prev, order._id]);
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                className={`transition text-center duration-200 ${
                  order?.isAskForPhone && !order?.deliveryPhone && !selectedOrders.includes(order?._id) ? 'bg-yellow-900/40' : ''
                } ${selectedOrders.includes(order?._id) ? 'bg-green-900/40' : 'hover:bg-[var(--color-bg-opacity)]'}`}>

                <td className="break-words px-2 py-2">
                  {searchTypeIndex === 0 ? highlightText(order?.orderNumber, searchQuery, true) : order?.orderNumber}
                </td>

                <td className="break-words px-2 py-2">
                  {searchTypeIndex === 1 ? highlightText(order?.fullName, searchQuery, true) : order?.fullName}
                </td>

                <td className="break-words px-2 py-2">
                  {searchTypeIndex === 2 ? highlightText(order?.phoneNumber, searchQuery, true) : order?.phoneNumber}
                </td>

                <td className="break-words px-2 py-2">{order?.wilaya}</td>
                <td className="break-words px-2 py-2">
                  <motion.div
                    className={`inline-flex items-center gap-1 p-1 rounded-full font-semibold ${
                      order?.isConfirmed
                        ? "bg-green-900 text-green-400 border border-green-500/50"
                        : "bg-yellow-900 text-yellow-400 border border-yellow-500/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {order?.isConfirmed ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>{t("orders.confirmed")}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>{t("orders.pending")}</span>
                      </>
                    )}
                  </motion.div>
                </td>
              </tr>
            ))}
            {(!Array.isArray(orders) || orders.length === 0) && (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  {t("orders.noOrders")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {createPortal(
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <motion.div
                className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3 className="text-xl font-bold mb-4 text-center border-b pb-2 border-[var(--color-bg-gray)]">
                  {t("orders.detailsTitle")}
                </h3>
                
<div className="grid sm:grid-cols-2 gap-4 text-sm leading-relaxed break-words">
  {[{
    label: t("orders.fields.orderNumber"),
    value: selectedOrder.orderNumber
  },{
    label: t("orders.fields.customer"),
    value: selectedOrder.fullName
  },{
    label: t("orders.fields.phone"),
    value: (
<>
  {selectedOrder.phoneNumber}
  <button
    onClick={() => {
      const textToCopy = selectedOrder.phoneNumber;

      // ✅ الطريقة الحديثة (Clipboard API)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => toast.success(t("orders.copyPhone")))
          .catch(() => {
            // 🟡 الطريقة الاحتياطية fallback في حال فشل النسخ الحديث
            const tempInput = document.createElement("input");
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            toast.success(t("orders.copyPhone"));
          });
      } else {
        // 🟡 الطريقة القديمة fallback في حال لم يكن Clipboard API مدعومًا
        const tempInput = document.createElement("input");
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        toast.success(t("orders.copyPhone"));
      }
    }}
    className={`${isRTL ? "pr-2" : "pl-2"} transition-colors hover:text-[var(--color-accent)]`}
    title={t("orders.copyPhone")}
  >
    <Copy className="h-4 w-4" />
  </button>
</>
    )
  },
  {
    label: t("orders.fields.wilaya"),
    value: selectedOrder.wilaya
  },
    {
    label: t("orders.fields.baladia"),
    value: selectedOrder.baladia
  },
    {
    label: t("orders.fields.deliveryPlace"),
    value: selectedOrder.deliveryPlace === "home" ? t("orders.deliveryOptions.home") : t("orders.deliveryOptions.office")
  },
  {
    label: t("orders.fields.deliveryPrice"),
    value: selectedOrder.deliveryPrice + " " + t("analytics.revenueUnit")
  },
  {
    label: t("orders.fields.total"),
    value: selectedOrder.totalAmount + " " + t("analytics.revenueUnit")
  },
{
  label: t("orders.fields.date"),
  value: dayjs(selectedOrder.createdAt).format(" HH:mm  YYYY,MMM DD")
},
{
  label: t("orders.fields.confirmedAt"),
  value: selectedOrder.isConfirmed && selectedOrder.confirmedAt ? dayjs(selectedOrder.confirmedAt).format(" HH:mm  YYYY,MMM DD") : t("orders.pending")
},
  {
    label: t("orders.fields.deliveryPhone"),
    value:  <div className="flex gap-1 mt-1">
      <input
        type="text"
        value={deliveryPhone}
        onChange={(e) => setDeliveryPhone(e.target.value)}
        className="p-1 m-1 rounded bg-[var(--color-bg-gray)] rounded-md shadow-sm w-24 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
      />
      <button
        disabled={loading}
        onClick={() => handleSave(selectedOrder._id)}
        className="px-3 bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)] text-white text-sm"
      >
        {t("orders.fields.save")}
      </button>
  </div>
  },
  {
    label: t("orders.fields.status"),
    value: 
    (selectedOrder.isConfirmed? t("orders.confirmed"): t("orders.pending")) +
    (selectedOrder.isAskForPhone? t("orders.askForNumber"): "")
  },
  {
    label: t("orders.fields.coupon"),
    value: selectedOrder.coupon? `${selectedOrder.coupon.code} ${t("giftCoupon.discount", { amount: selectedOrder.coupon.discountAmount })}`: t("لا يوجد")
  },
  {
    label: t("orders.fields.note"),
    value: selectedOrder.note || t("orders.fields.noNote")
  },
  ].map((item, idx) => (
    <p key={idx} className="border-b border-[var(--color-bg-gray)] py-2 flex flex-col">
      <span className="text-[var(--color-text)] font-semibold text-m mt-1 truncate text-right max-w-full">{item.label}</span>
      <span className="truncate text-right max-w-full">{item.value}</span>
    </p>
  ))}
</div>
      <div className="mt-6">
                  <strong className="block mb-4 text-[var(--color-text)] text-lg">
                    {t("orders.fields.products")}
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.isArray(selectedOrder.products) && selectedOrder.products.map((item, idx) => {
                      const colorObj = getFullColorData(item?.selectedColor);
                      
                      return (
                        <div
                          key={idx}
                          className="flex gap-4 items-center bg-[var(--color-bg-gray)] p-4 rounded-lg border border-[var(--color-accent)] cursor-pointer hover:text-white hover:bg-[var(--color-accent)] transition"
                          onClick={() => {
                            if (item?.product?._id) {
                              navigate(`/product/${item.product._id}`);
                            } else {
                              toast.error(t("orders.fields.noImage"));
                            }
                          }}
                        >
                          {/* عرض صورة المنتج */}
                          {item?.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-500"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center text-xs border border-gray-500">
                              {t("orders.fields.noImage")}
                            </div>
                          )}

                          <div className="flex flex-col flex-1">
                            <p className="font-semibold text-base leading-tight">
                              {item?.product?.name || t("orders.fields.product")}{" "}
                              <span className="font-normal">× {item?.quantity || 1}</span>
                            </p>

                            <p className="text-sm font-bold mt-1">
                              {(item?.price || 0).toLocaleString()} {t("analytics.revenueUnit")}
                            </p>

                            {/* عرض الحجم واللون */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {item?.selectedSize && (
                                <span className="text-xs font-semibold bg-gray-700 text-white px-3 py-1 rounded-full">
                                  {item.selectedSize}
                                </span>
                              )}
                              {colorObj && (
                                <div className="flex items-center gap-1">
                                  <span
                                    className="inline-block w-5 h-5 rounded-full border border-gray-300"
                                    style={{ backgroundColor: colorObj.hex }}
                                    title={colorObj.name}
                                  />
                                  <span className="text-xs">
                                    {colorObj.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 🔥 رسالة إذا لم توجد منتجات */}
                  {(!Array.isArray(selectedOrder.products) || selectedOrder.products.length === 0) && (
                    <p className="text-center text-gray-500 py-4">
                      {t("orders.noProducts")}
                    </p>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
                  >
                    {t("orders.fields.close")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* نافذة تأكيد الحذف */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--color-bg)] p-6 rounded-xl text-[var(--color-text-secondary)] w-[90%] max-w-md shadow-2xl border border-[var(--color-bg-gray)]"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4 text-center">
                {t("orders.confirmDelete")}
              </h3>
              <p className="mb-6 text-center">
                {selectedOrderId
                  ? t("orders.confirmSingle")
                  : t("orders.confirmMultiple", { count: selectedOrders.length })}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700 px-5 py-2 rounded font-semibold transition"
                >
                  {t("orders.confirmYes")}
                </button>
                <button
                  onClick={() => { setShowPopup(false); setSelectedOrderId(null); }}
                  className="bg-gray-700 text-white hover:bg-gray-600 px-5 py-2 rounded font-semibold transition"
                >
                  {t("orders.confirmCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderList;