import { ShoppingCart, LogOut, Lock, Menu, Search, XCircle, KeyRound, Globe, Moon, Sun, Home, Phone, Heart } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../stores/useCartStore";
import { useState, useEffect } from "react";
import { useNavbar } from "../context/NavbarContext";
import logo from "../../public/logo.png";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const languages = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" }
];

const Navbar = () => {
  const { admin, logout, checkingAuth } = useAdminAuthStore();
  const isAdmin = admin?.role === "admin";
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { isNavbarOpen: isMenuOpen, setIsNavbarOpen: setIsMenuOpen, searchInputRef } = useNavbar();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setIsLangMenuOpen(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await axios.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const delay = setTimeout(fetchProducts, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const clearSearch = () => setSearchTerm("");

  const handleResultClick = (id) => {
    setSearchTerm("");
    setSearchResults([]);
    setIsMenuOpen(false);
    navigate(`/product/${id}`);
  };

  const renderSearchResults = () =>
    searchResults.length > 0 && (
      <div className="absolute top-full mt-1 w-full bg-[var(--color-bg)] rounded-md shadow-lg overflow-hidden z-50 border border-[var(--color-bg-gray)]">
        {searchResults.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white border-b border-[var(--color-bg-gray)] transition cursor-pointer"
            onClick={() => handleResultClick(item.id)}
          >
            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
            <div className="flex justify-between flex-1">
              <span>{item.name}</span>
              <span className="text-sm">{item.price} DA</span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
      <header className="fixed top-0 left-0 w-full backdrop-blur-md shadow-lg
       z-50 border- bg-[var(--color-bg-opacity)] border-[var(--color-accent)] text-[var(--color-text)]"
      >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">

        {/* زر القائمة الجانبية */}
        <div className="flex items-center">
          <button        
          className="p-2 rounded-md text-[var(--color-text)] hover:text-[var(--color-accent)] z-50"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <Menu size={28} />
          </button>
        </div>

        {/* الشعار */}
        <div>
          <Link
            to="/"
            className="text-2xl font-extrabold select-none text-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
             <img
                src={logo}
                alt="Zoubir"
                className="h-14 w-36 rounded-lg object-cover"
              />
          </Link>
        </div>

        {/* أيقونة السلة + الأدمن */}
        <div className="flex items-center gap-4">  
          <Link
            to="/cart"
            className="relative text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            <ShoppingCart size={28} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          {!checkingAuth && isAdmin && (
            <div className="relative">
              <button
                onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] px-3 py-2 rounded-md transition-colors duration-200"

                aria-expanded={isAdminMenuOpen}
              >
                <Lock size={18} />
                <span className="hidden sm:inline">{t("navbar.dashboard")}</span>
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAdminMenuOpen && (
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-full w-48 bg-[var(--color-bg)] rounded-md shadow-lg z-50 mt-1 overflow-hidden`}>
                  <Link
                    to="/dash"
                    className="block px-4 py-2 hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] transition rounded-md text-[var(--color-text)] font-semibold"
                    onClick={() => setIsAdminMenuOpen(false)}
                  >
                    <KeyRound size={16} className={`inline ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("navbar.admin")}
                  </Link>
                  <button
                    onClick={() => {
                      try {
                        logout();
                        toast.success(t("logout.success"));
                        setIsAdminMenuOpen(false);
                      } catch (error) {
                        t("logout.error")
                      }
                    }}
                    className={`w-full ${isRTL ? "text-right" : "text-left"} px-4 py-2 hover:bg-red-600 hover:text-[var(--color-on-accent)] transition rounded-md text-[var(--color-text)] font-semibold`}
                  >
                    <LogOut size={16} className={`inline ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* القائمة الجانبية */}
      {isMenuOpen && (
        <nav className="absolute top-full left-0 w-full bg-[var(--color-bg)] border-t border-b border-[var(--color-accent)] border-[var(--color-accent-hover)] px-4 py-4 space-y-4 z-40 shadow-lg">
{/* روابط التنقل */}
<div className="flex flex-row justify-center gap-4 w-full">
  {[
    { path: "/", label: t("navbar.home"), icon: <Home size={22} /> },
    { path: "/contact", label: t("navbar.contact"), icon: <Phone size={22} /> },
    { path: "/favorites", label: t("navbar.favorites"), icon: <Heart size={22} /> }
  ].map((item) => (
<NavLink
  key={item.path}
  to={item.path}
  onClick={() => setIsMenuOpen(false)}
  className={({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 
     text-[var(--color-text-secondary)] text-sm text-center
     rounded-lg px-3 py-2 transition
     ${isActive ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-bg-gray)]"}`
  }
>
  <span  className={({ isActive }) =>
    `${isActive ? "text-white" : ""}`
}>{item.icon}</span>
  <span className="">{item.label}</span>
</NavLink>

  ))}
</div>

          {/* البحث */}
          <div className="relative max-w-md mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="flex relative">
            <input
              ref={searchInputRef}
              type="text"
              className={`flex-grow px-3 py-2 ${isRTL ? "rounded-r-md" : "rounded-l-md"} bg-[var(--color-bg-gray)] text-[var(--color-text)] focus:outline-none`}
              placeholder={t("navbar.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={`absolute ${isRTL ? "left-12" : "right-12" } top-1/2 -translate-y-1/2 text-white hover:text-red-500`}
                  aria-label="Clear search"
                >
                  <XCircle size={20} />
                </button>
              )}
              <button
                className={`px-3 bg-[var(--color-accent)] cursor-auto ${isRTL ? "rounded-l-md" : "rounded-r-md"} text-white`}
                aria-label="Submit search"
              >
                <Search size={20} />
              </button>
            </form>
            {renderSearchResults()}
          </div>

          {/* اختيار اللغة داخل القائمة */}
          <div className="relative w-full gap-3 flex justify-center">
            <button
              onClick={() => setIsLangMenuOpen(prev => !prev)}
              className="flex items-center justify-center gap-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-3 py-3 rounded-full transition-colors duration-200 font-semibold w-32"
            >
              <Globe size={18} />
              {languages.find(l => l.code === i18n.language)?.label || t("navbar.language")}
              {isLangMenuOpen && (
                <div className="absolute top-full mt-1 bg-[var(--color-bg)] rounded-md shadow-lg z-50 overflow-hidden w-32">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setIsLangMenuOpen(false);
                        setTimeout(() => {
                          changeLanguage(lang.code);
                        }, 100);
                      }}
                      className={`block w-full px-4 py-2 hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] text-center ${
                        i18n.language === lang.code ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]" : "text-[var(--color-text)]"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </button>
<div className="relative flex bg-[var(--color-bg-gray)] rounded-full w-36 select-none overflow-hidden cursor-pointer" onClick={() => setIsDarkMode(prev =>!prev)}>
  <div
    className="absolute top-1 bottom-1 w-[47%] bg-[var(--color-accent)] rounded-full transition-transform duration-300 ease-in-out"
    style={{
      right: isRTL? "0.25rem": "auto",
      left: isRTL? "auto": "0.25rem",
      transform: !isDarkMode? (isRTL? "translateX(-100%)": "translateX(100%)"): "translateX(0%)",
    }}
  ></div>

  <div className={`relative flex-1 z-10 flex justify-center items-center text-white`}>
    <Sun size={25} />
  </div>

  <div className={`relative flex-1 z-10 flex justify-center items-center ${!isDarkMode? "text-[var(--color-text-secondary)]" : "text-[var(--color-[var(--color-accent)]"}`}>
    <Moon size={23} />
  </div>
</div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
