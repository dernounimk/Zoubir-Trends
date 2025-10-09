import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, ImagePlus, X, ArrowLeft, ArrowRight, Search, Save, Building2, Home, Hourglass } from "lucide-react";
import toast from "react-hot-toast";
import useSettingStore from "../stores/useSettingStore";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";

const wilayas = [
  "01 - أدرار",
  "02 - الشلف",
  "03 - الأغواط",
  "04 - أم البواقي",
  "05 - باتنة",
  "06 - بجاية",
  "07 - بسكرة",
  "08 - بشار",
  "09 - البليدة",
  "10 - البويرة",
  "11 - تمنراست",
  "12 - تبسة",
  "13 - تلمسان",
  "14 - تيارت",
  "15 - تيزي وزو",
  "16 - الجزائر",
  "17 - الجلفة",
  "18 - جيجل",
  "19 - سطيف",
  "20 - سعيدة",
  "21 - سكيكدة",
  "22 - سيدي بلعباس",
  "23 - عنابة",
  "24 - قالمة",
  "25 - قسنطينة",
  "26 - المدية",
  "27 - مستغانم",
  "28 - المسيلة",
  "29 - معسكر",
  "30 - ورقلة",
  "31 - وهران",
  "32 - البيض",
  "33 - إليزي",
  "34 - برج بوعريريج",
  "35 - بومرداس",
  "36 - الطارف",
  "37 - تندوف",
  "38 - تيسمسيلت",
  "39 - الوادي",
  "40 - خنشلة",
  "41 - سوق أهراس",
  "42 - تيبازة",
  "43 - ميلة",
  "44 - عين الدفلى",
  "45 - النعامة",
  "46 - عين تموشنت",
  "47 - غرداية",
  "48 - غليزان",
  "49 - تيميمون",
  "50 - برج باجي مختار",
  "51 - أولاد جلال",
  "52 - بني عباس",
  "53 - عين صالح",
  "54 - عين قزام",
  "55 - تقرت",
  "56 - جانت",
  "57 - المغير",
  "58 - المنيعة"
];

const SettingsManager = () => {

  const {
    categories,
    sizesLetters,
    sizesNumbers,
    colorsList,
    loadingMeta,
    fetchMetaData,
    createCategory,
    deleteCategory,
    createSize,
    deleteSize,
    createColor,
    deleteColor,
  } = useSettingStore();


  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [newSize, setNewSize] = useState({ type: "letters", value: "" });
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [isLoading, setIsLoading] = useState(true);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    fetchMetaData();
    setIsLoading(false)
  }, [fetchMetaData]);

  const [categoryImageUrl, setCategoryImageUrl] = useState(null);
  useEffect(() => {
    if (newCategory.image) {
      const url = URL.createObjectURL(newCategory.image);
      setCategoryImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCategoryImageUrl(null);
    }
  }, [newCategory.image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory((prev) => ({ ...prev, image: file }));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      toast.success('success_to_add_category');
      setNewCategory({ name: "", image: null });
    } catch (error) {
      toast.error(t("failed_to_add_category"));
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    try {
      await createSize({
        type: newSize.type,
        value: newSize.value
      });
      setNewSize({ type: newSize.type, value: "" });
      toast.success(t("success_to_add_size"));
    } catch (error) {
      toast.error(t("failed_to_add_size"));
    }
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    try {
      await createColor(newColor);
      setNewColor({ name: "", hex: "#000000" });
      toast.success(t("success_to_add_color"));
    } catch (error) {
      toast.error(t("failed_to_add_color"));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="bg-[var(--color-bg)] shadow-xl text-[var(--color-text-secondary)] rounded-lg p-8 max-w-5xl mx-auto space-y-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Categories */}
      <section>
        <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-8 border-b border-[var(--color-accent)] pb-2">
          {t("categories")}
        </h2>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="text"
            placeholder={t("category_name")}
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, name: e.target.value }))
            }
            className="flex-1 bg-[var(--color-bg-gray)] border border-[var(--color-accent)] rounded-md py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-hover)] transition"
            disabled={loadingMeta}
            required
          />

          <label
            htmlFor="category-image"
            className={`flex items-center gap-2 px-5 py-3 rounded-md cursor-pointer text-white select-none transition ${
              newCategory.image ? 'bg-[var(--color-accent-hover)]' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
            }`}
          >
            <ImagePlus className="w-6 h-6" />
            {newCategory.image ? t("image_selected") : t("upload_image")}
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loadingMeta}
              required
            />
          </label>

          {categoryImageUrl && (
            <img
              src={categoryImageUrl}
              alt={t("image_preview")}
              className="w-14 h-14 rounded-md object-cover border-2 border-[var(--color-accent)]"
            />
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-md px-5 py-3 text-white font-semibold transition disabled:opacity-50"
            disabled={loadingMeta || !newCategory.name || !newCategory.image}
          >
            <PlusCircle className="w-6 h-6" />
            {t("add")}
          </button>
        </form>

        <ul className="mt-8 space-y-4 max-h-72 overflow-auto">
          {categories.length === 0 && (
            <li className="text-sm text-center">{t("no_categories_found")}</li>
          )}
          {categories.map((cat) => (
            cat && (
              <li
                key={cat._id}
                className="flex items-center justify-between bg-[var(--color-bg-gray)] border border-[var(--color-accent)] p-4 rounded-lg shadow-inner"
              >
                <div className="flex items-center gap-5">
                  {cat.imageUrl && (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-14 h-14 rounded-md object-cover border border-gray-500"
                    />
                  )}
                  <span className="text-lg font-medium">{cat.name}</span>
                </div>
                <button
                  onClick={async () => {
                    await deleteCategory(cat._id);
                    toast.success(t("delete_category_done"));
                  }}
                  className="text-red-500 hover:text-red-600 transition disabled:opacity-50"
                  aria-label={t("delete_category")}
                  disabled={loadingMeta}
                >
                  <Trash2 className="w-7 h-7" />
                </button>
              </li>
            )
          ))}
        </ul>
      </section>

      {/* Sizes and Colors section */}
      <section>
        <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-8 border-b border-[var(--color-accent-hover)] pb-2">
          {t("sizes_and_colors")}
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Add size form */}
          <form onSubmit={handleAddSize} className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
            <select
              value={newSize.type}
              onChange={(e) =>
                setNewSize((prev) => ({ ...prev, type: e.target.value }))
              }
              className="bg-[var(--color-bg-gray)] border border-[var(--color-accent)] rounded-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-hover)] transition"
              disabled={loadingMeta}
            >
              <option value="letters">{t("letters")}</option>
              <option value="numbers">{t("numbers")}</option>
            </select>
            <input
              type="text"
              placeholder={t("size_value")}
              value={newSize.value}
              onChange={(e) =>
                setNewSize((prev) => ({ ...prev, value: e.target.value }))
              }
              className="bg-[var(--color-bg-gray)] border border-[var(--color-accent)] rounded-md py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)] transition"
              disabled={loadingMeta}
              required
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-md px-5 py-3 text-white font-semibold transition disabled:opacity-50"
              disabled={loadingMeta || !newSize.value}
            >
              <PlusCircle className="w-6 h-6" />
              {t("add_size")}
            </button>
          </form>

          {/* Add color form */}
          <form onSubmit={handleAddColor} className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("color_name")}
              value={newColor.name}
              onChange={(e) =>
                setNewColor((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-[var(--color-bg-gray)] border border-[var(--color-accent)] rounded-md py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-hover)] transition"
              disabled={loadingMeta}
              required
            />
            <input
              type="color"
              value={newColor.hex}
              onChange={(e) =>
                setNewColor((prev) => ({ ...prev, hex: e.target.value }))
              }
              className="w-12 h-12 rounded-full cursor-pointer border border-[var(--color-accent)] outline-none ring-1 ring-[var(--color-accent-hover)] transition"
              disabled={loadingMeta}
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-md px-5 py-3 text-white font-semibold transition disabled:opacity-50"
              disabled={loadingMeta || !newColor.name}
            >
              <PlusCircle className="w-6 h-6" />
              {t("add_color")}
            </button>
          </form>
        </div>

        {/* Lists display */}
        <div className="flex flex-col sm:flex-row gap-10">
          {/* Letter sizes */}
          <div className="flex-1 min-w-[160px] bg-[var(--color-bg-gray)] rounded-lg p-5 max-h-72 overflow-auto shadow-inner">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4 border-b border-[var(--color-accent-hover)] pb-1">
              {t("letters")}
            </h3>
            {sizesLetters.length === 0 ? (
              <p className="text-center">{t("no_letter_sizes")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizesLetters.map((size) => (
                  size && (
                    <div key={size._id} 
                      className="flex items-center gap-2 bg-[var(--color-bg)] rounded-full px-4 py-2 select-none shadow-xl"
                    >
                      <span>{size.name}</span>
                      <button
                      onClick={async () => {
                        await deleteSize(size._id);
                        toast.success(t("delete_size_done"));
                      }}
                        className="text-red-500 hover:text-red-400 transition disabled:opacity-50"
                        aria-label={t("delete_size")}
                        disabled={loadingMeta}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Number sizes */}
          <div className="flex-1 min-w-[160px] bg-[var(--color-bg-gray)] rounded-lg p-5 max-h-72 overflow-auto shadow-inner">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4 border-b border-[var(--color-accent-hover)] pb-1">
              {t("numbers")}
            </h3>
            {sizesNumbers.length === 0 ? (
              <p className="text-center">{t("no_number_sizes")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizesNumbers.map((size) => (
                  size && (
                    <div
                      key={size._id}
                      className="flex items-center gap-2 bg-[var(--color-bg)] rounded-full px-4 py-2 select-none shadow-xl"
                    >
                      <span>{size.name}</span>
                      <button
                        onClick={async () => {
                          await deleteSize(size._id);
                          toast.success(t("delete_size_done"));
                        }}
                        className="text-red-500 hover:text-red-400 transition disabled:opacity-50"
                        aria-label={t("delete_size")}
                        disabled={loadingMeta}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="flex-1 min-w-[180px] bg-[var(--color-bg-gray)] rounded-lg p-5 max-h-72 overflow-auto shadow-inner">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4 border-b border-[var(--color-accent-hover)] pb-1">
              {t("colors")}
            </h3>
            {colorsList.length === 0 ? (
              <p className="text-center">{t("no_colors")}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {colorsList.map((color) => (
                  color && (
                    <div
                      key={color._id}
                      className="flex items-center gap-3 bg-[var(--color-bg)] rounded-full px-4 py-2 select-none shadow-xl"
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-gray-500"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <button
                        onClick={async () => {
                          await deleteColor(color._id);
                          toast.success(t("delete_color_done"));
                        }}
                        className="text-red-500 hover:text-red-400 transition disabled:opacity-50"
                        aria-label={t("delete_color")}
                        disabled={loadingMeta}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <SomeComponent/>
    </motion.div>
  );
};

export default SettingsManager;

const DeliverySettingsPopup = ({ onClose, settings, handleChange, handleSubmit, DeliveryDaysSelector, t }) => {
  const [search, setSearch] = useState("");

  const filteredSettings = settings.filter(({ state }) =>
    state.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-bg)] p-6 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto relative shadow-xl border border-[var(--color-accent)]"
        >
          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition"
            aria-label="Close popup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* العنوان */}
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)] flex items-center gap-2">
            {t("deliverySettings.title")}
          </h2>

          {/* البحث */}
          <div className="flex items-center gap-2 mb-6 bg-[var(--color-bg-gray)] rounded-lg px-3 py-2 border border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent-hover)] transition">
            <Search className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder={t("searchState")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent flex-1 focus:outline-none text-[var(--color-text)] text-sm"
            />
          </div>

          {/* فورم */}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSettings.map(({ state, officePrice, homePrice, deliveryDays }, i) => (
                <div
                  key={state}
                  className="p-5 rounded-xl border border-[var(--color-accent)] bg-[var(--color-bg-gray)] shadow-md hover:shadow-lg transition flex flex-col gap-4"
                >
                  <h3 className="font-semibold text-lg text-[var(--color-text)] border-b border-[var(--color-accent)] pb-2">
                    {state}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {/* سعر المكتب */}
                    <label className="text-sm m-auto text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                      {t("deliverySettings.officePrice")}
                    </label>
                    <input
                      type="text"
                      value={officePrice}
                      onChange={(e) => handleChange(i, "officePrice", e.target.value)}
                      placeholder={t("deliverySettings.officePrice")}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-accent)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)]"
                    />

                    {/* سعر المنزل */}
                    <label className="text-sm m-auto text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Home className="w-4 h-4 text-[var(--color-accent)]" />
                      {t("deliverySettings.homePrice")}
                    </label>
                    <input
                      type="text"
                      value={homePrice}
                      onChange={(e) => handleChange(i, "homePrice", e.target.value)}
                      placeholder={t("deliverySettings.homePrice")}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-accent)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-hover)]"
                    />

                    {/* عدد الأيام */}
                    <label className="text-sm m-auto text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Hourglass className="w-4 h-4 text-[var(--color-accent)]" />
                      {t("deliverySettings.deliveryDays")}
                    </label>
                    <DeliveryDaysSelector
                      index={i}
                      selected={deliveryDays}
                      handleChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* زر الحفظ */}
            <button
              type="submit"
              className="mt-8 flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-6 py-3 shadow-md transition w-full sm:w-auto"
            >
              <Save className="w-5 h-5" />
              {t("deliverySettings.save")}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
};

// ==========================
// Component Example
// ==========================
const SomeComponent = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showPopup, setShowPopup] = useState(false);

  const {
    deliverySettings,
    updateDeliverySettings,
    orderCalculation,
    updateOrderCalculation,
    loadingMeta,
  } = useSettingStore();

  const [settings, setSettings] = useState(deliverySettings);

  useEffect(() => {
    setSettings(deliverySettings);
  }, [deliverySettings]);

  function handleChange(index, field, value) {
    setSettings((prev) => {
      const newSettings = [...prev];
      newSettings[index][field] = Number(value) || 0;
      return newSettings;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateDeliverySettings(settings);
      toast.success(t("settingsUpdated"));
    } catch (error) {
      toast.error(t("settingsUpdatedFailed"));
    }
  }

  function DeliveryDaysSelector({ index, selected, handleChange }) {
    const options = [1, 2, 3, 4, 5];
    const defaultDay = 3;
    const current = selected ? parseInt(selected) : defaultDay;

    function prev() {
      const prevIndex = (current - 2 + options.length) % options.length;
      handleChange(index, "deliveryDays", options[prevIndex].toString());
    }

    function next() {
      const nextIndex = current % options.length;
      handleChange(index, "deliveryDays", options[nextIndex].toString());
    }

    return (
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={prev}
          className="px-1 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="px-2 py-1 text-xs font-semibold bg-[var(--color-bg)] border border-[var(--color-accent)] rounded text-[var(--color-text-secondary)] w-8 text-center">
          {current}
        </span>
        <button
          type="button"
          onClick={next}
          className="px-1 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-8 border-b border-[var(--color-accent-hover)] pb-2">
        {t("other")}
      </h2>

      <div className="rounded-xl flex flex-wrap gap-5 justify-center">
        {[
          {
            titleKey: "orderSetting",
            content: (
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-full px-6 py-3 text-white shadow-md transition disabled:opacity-50 w-full max-w-xs"
              >
                {t("showSetting")}
              </button>
            ),
          },
          {
            title: t("calcRevenue"),
            content: (
              <div className="relative flex bg-[var(--color-bg-gray)] rounded-full p-2 w-full max-w-xs select-none overflow-hidden">
                <div
                  className={`absolute top-1 bottom-1 w-[48%] bg-[var(--color-accent)] rounded-full transition-transform duration-300 ease-in-out`}
                  style={{
                    right: isRTL ? "0.25rem" : "auto",
                    left: isRTL ? "auto" : "0.25rem",
                    transform:
                      orderCalculation === "confirmed"
                        ? "translateX(0%)"
                        : isRTL
                        ? "translateX(-100%)"
                        : "translateX(100%)",
                  }}
                ></div>

                <button
                  disabled={loadingMeta}
                  onClick={() => updateOrderCalculation("confirmed")}
                  className={`relative flex-1 z-10 px-4 py-2 rounded-full text-center ${
                    orderCalculation === "confirmed" ? "text-white" : ""
                  }`}
                >
                  {t("confirmedOrders")}
                </button>

                <button
                  disabled={loadingMeta}
                  onClick={() => updateOrderCalculation("all")}
                  className={`relative flex-1 z-10 px-4 py-2 rounded-full text-center ${
                    orderCalculation === "all" ? "text-white" : ""
                  }`}
                >
                  {t("allOrders")}
                </button>
              </div>
            ),
          },
        ].map((section, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-6 border border-[var(--color-accent)] rounded-2xl space-y-4 w-full sm:w-[48%]"
          >
            <p className="text-xl font-semibold">
              {section.titleKey ? t(section.titleKey) : section.title}
            </p>
            {section.content}
          </div>
        ))}
      </div>

      {showPopup && (
        <DeliverySettingsPopup
          onClose={() => setShowPopup(false)}
          settings={deliverySettings}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          DeliveryDaysSelector={DeliveryDaysSelector}
          t={t}
        />
      )}
    </section>
  );
};