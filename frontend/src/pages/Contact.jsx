import { Instagram, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] text-white items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center text-[var(--color-text)]"
        >
          {t("contact.title")}
        </motion.h1>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Instagram */}
          <a
            href="https://instagram.com/zoubir__trends"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-bg)] p-6 rounded-2xl shadow-lg flex flex-col items-center text-center cursor-pointer 
              hover:scale-105 hover:shadow-[var(--color-text)]
              transition transform duration-300 ease-in-out"
          >
            <div className="flex items-center gap-2">
              <Instagram className="w-8 h-8 text-[var(--color-text)]" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-[var(--color-text)]">
              {t("contact.instagram")}
            </h3>
            <p className="text-[var(--color-text-secondary)]">{!isRTL ? "@" : ""}zoubir__trends{isRTL ? "@" : ""}</p>
          </a>

          {/* Phone */}
          <a
            href="tel:0656768448"
            className="bg-[var(--color-bg)] p-6 rounded-2xl shadow-lg flex flex-col items-center text-center cursor-pointer 
              hover:scale-105 hover:shadow-[var(--color-text)]
              transition transform duration-300 ease-in-out"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-8 h-8 text-[var(--color-text)]" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-[var(--color-text)]">
              {t("contact.phone")}
            </h3>
            <p className="text-[var(--color-text-secondary)]">0656768448</p>
          </a>

          {/* Location */}
          <a
            href="https://www.google.com/maps?q=زقاق+بن+رمضان+بسكرة"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-bg)] p-6 rounded-2xl shadow-lg flex flex-col items-center text-center cursor-pointer 
              hover:scale-105 hover:shadow-[var(--color-text)]
              transition transform duration-300 ease-in-out"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-[var(--color-text)]" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-[var(--color-text)]">
              {t("contact.location")}
            </h3>
            <p className="text-[var(--color-text-secondary)]">زقاق بن رمضان بسكرة</p>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
