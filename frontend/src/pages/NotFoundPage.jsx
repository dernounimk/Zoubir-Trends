import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Home, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useNavbar } from "../context/NavbarContext";

const NotFoundPage = () => {
  const { t } = useTranslation();
  const { openNavbarAndFocusSearch } = useNavbar(); 

    return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative"
      >
        <div className="text-9xl font-bold text-[var(--color-text)] drop-shadow-lg">
          404
        </div>
        <div className="absolute -inset-4 border-4 border-[var(--color-text)] rounded-full animate-pulse"></div>
      </motion.div>

      {/* العنوان الرئيسي */}
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text-secondary)]"
      >
        {t("notFound.title")}
      </motion.h1>

      {/* الرسالة التوضيحية */}
      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-xl text-[var(--color-text)] mb-8 max-w-2xl"
      >
        {t("notFound.message")}
      </motion.p>

      {/* الأزرار الإجرائية */}
<motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg font-medium transition-colors"
        >
          <Home size={20} />
          {t("notFound.homeButton")}
        </Link>
        
        <button
          onClick={openNavbarAndFocusSearch} // تغيير من Link إلى button واستدعاء الدالة
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-bg)] text-[var(--color-text-secondary)] rounded-lg font-medium transition-colors"
        >
          <Search size={20} />
          {t("notFound.searchButton")}
        </button>
      </motion.div>

      {/* رسوم متحركة إضافية */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="mt-8 opacity-60"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 12 11 11.75 11 15H13C13 12.75 16 12.5 16 10C16 7.79 14.21 6 12 6Z"
            fill="var(--color-text)"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;