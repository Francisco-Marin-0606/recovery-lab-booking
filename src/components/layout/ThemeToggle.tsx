import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "floating" | "inline" | "ghost";
  className?: string;
}

export default function ThemeToggle({
  variant = "inline",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const base =
    "relative inline-flex items-center justify-center rounded-full transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-black/40";

  const styles = {
    floating:
      "w-11 h-11 bg-white/90 dark:bg-[#1C2230]/90 backdrop-blur-sm border border-gray-200 dark:border-[#2A3042] shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200",
    inline:
      "w-10 h-10 sm:w-11 sm:h-11 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300",
    ghost:
      "w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5",
  }[variant];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      aria-pressed={isDark}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`${base} ${styles} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Sun className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Moon className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
