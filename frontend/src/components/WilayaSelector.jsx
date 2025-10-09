import { useTranslation } from "react-i18next";
import useSettingStore from '../stores/useSettingStore';

const WilayaSelector = ({ selectedWilaya, setSelectedWilaya }) => {
  const { t } = useTranslation();
  const deliverySettings = useSettingStore(state => state.deliverySettings);

  return (
    <div>
      <label htmlFor="wilaya" className="block text-sm font-medium text-[var(--color-text-secondary)]">
        {t("wilayaSelector.wilaya")}
      </label>

      <select
        id="wilaya"
        value={selectedWilaya}
        onChange={(e) => setSelectedWilaya(e.target.value)}
        className="mt-1 block w-full bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md
        shadow-sm py-2 px-3 text-[var(--color-text-secondary)] focus:outline-none 
        focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
      >
        <option value="">{t("wilayaSelector.selectWilaya")}</option>
        {deliverySettings.map(({ state }) => (
        <option key={state} value={state}>
          {state}
        </option>
        ))}
      </select>
    </div>
  );
};

export default WilayaSelector;
