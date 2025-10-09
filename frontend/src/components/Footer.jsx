import { Phone, MapPin, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../../public/logo.png";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <footer className="bg-[var(--color-bg)] py-12 px-4 sm:px-8 mt-16 border-t border-[var(--color-accent)]">
      <div className="max-w-7xl mx-auto">
        {/* الصف العلوي */}
        <div 
          className={`flex flex-col md:flex-row justify-between items-start gap-8 md:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* العمود الأول - الشعار والوصف */}
          <div className={`w-full md:w-auto flex-1 max-w-xs`}>
            <div className="flex flex-col items-start space-y-4">
              <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-2">
                <img
                  src={logo}
                  alt="Zoubir"
                  className="h-14 w-36 rounded-lg object-cover"
                />
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-[280px]">
                {t("footer.description")}
              </p>
            </div>
          </div>

          {/* العمود الثاني - معلومات مهمة */}
          <div className="w-full md:w-auto flex-1 max-w-[200px]">
            <div className="flex flex-col items-start space-y-4">
              <h3 className="font-semibold text-[var(--color-text)] text-lg mb-2">
                {t("footer.importantInfo")}
              </h3>
              <nav className="flex flex-col items-start gap-2">
                <Link to="/faq" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                  {t("footer.faq")}
                </Link>
                <Link to="/privacy-policy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                  {t("footer.privacy")}
                </Link>
                <Link to="/terms-of-use" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                  {t("footer.terms")}
                </Link>
              </nav>
            </div>
          </div>

          {/* العمود الثالث - معلومات الاتصال */}
          <div className="w-full md:w-auto flex-1 max-w-[240px]">
            <div className="flex flex-col items-start space-y-4">
              <h3 className="font-semibold text-[var(--color-text)] text-lg mb-2">
                {t("footer.contactUs")}
              </h3>
              <div className="flex flex-col items-start gap-3">
                <p className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-[var(--color-text)]" />
                  <span className="font-medium text-[var(--color-text-secondary)]">0656768448</span>
                </p>
                <p className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 flex-shrink-0 text-[var(--color-text)]" />
                  <span className="font-medium text-[var(--color-text-secondary)]">zoubir__trends</span>
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-[var(--color-text)]" />
                  <span className="font-medium text-[var(--color-text-secondary)]">زقاق بن رمضان بسكرة</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div 
          className="mt-12 pt-6 border-t border-gray-700 text-sm font-medium text-gray-300 select-none text-center"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <span className="text-[var(--color-text-secondary)]">{t("footer.developedBy")}{" "}</span>
          <a
            href="https://dernounimk.github.io/dernounimk/?fbclid=PAZXh0bgNhZW0CMTEAAaYAtgOvGSfrmkYy6zwnQ04AYi9IsOFzgIgv0DZKSb0OA9YKs2gn2LFqAos_aem_19_J4xpzauznMgZ1MBIxgw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text)] hover:underline"
          >
            Dernouni MK
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;