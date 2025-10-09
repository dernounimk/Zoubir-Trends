import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader, Eye, EyeOff } from "lucide-react";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { login, loading } = useAdminAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, navigate);
      toast.success(t("login.success"));
    } catch (error) {
      toast.error(t("login.error"));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text)]">
          {t("adminLogin.title")}
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-[var(--color-bg)] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                {t("adminLogin.emailLabel")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full py-2 pl-10 pr-3 bg-[var(--color-bg-gray)] border border-[var(--color-bg-gray)] rounded-md shadow-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm"
                  placeholder={t("adminLogin.emailPlaceholder")} 
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                {t("adminLogin.passwordLabel")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full py-2 pl-10 pr-12 bg-[var(--color-bg-gray)] text-[var(--color-text-secondary)] border border-[var(--color-bg-gray)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm"
                  placeholder={t("adminLogin.passwordPlaceholder")} 
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer" onClick={toggleShowPassword}>
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-bg-gray)] transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 animate-spin`} aria-hidden="true" />
                  {t("adminLogin.loading")}
                </>
              ) : (
                <>
                  <LogIn className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} aria-hidden="true" />
                  {t("adminLogin.loginButton")}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
