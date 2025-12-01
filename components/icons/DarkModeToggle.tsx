"use client";

import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "phosphor-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full h-full flex items-center justify-center transition-opacity hover:opacity-80"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        // Sun icon for dark mode (clicking switches to light)
        <Sun
          size={24}
          weight="regular"
          className="w-full h-full text-white dark:text-white"
        />
      ) : (
        // Moon icon for light mode (clicking switches to dark)
        <Moon
          size={24}
          weight="regular"
          className="w-full h-full text-[#1a1a1a]"
        />
      )}
    </button>
  );
}

