import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    setRotate((prev) => prev + 360); // تدوير عند الضغط
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-2 z-[9999] p-2 rounded-lg
            shadow-lg transition-colors duration-300
            bg-[var(--color-accent-transparent)] text-white
            hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_15px_var(--color-accent)]"
          aria-label="Scroll to top"
        >
          <motion.div
            animate={{ rotate }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ArrowUp size={20} />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
