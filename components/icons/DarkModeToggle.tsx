"use client";

import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "phosphor-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTheme = theme === "dark" ? "light" : "dark";
    
    // Force immediate DOM update before React state update
    // Use requestAnimationFrame for Firefox compatibility
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const root = document.documentElement;
        if (newTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        // Force reflow for Firefox
        void root.offsetHeight;
      });
      
      // Also update localStorage immediately with error handling
      try {
        localStorage.setItem("preferredTheme", newTheme);
      } catch (err) {
        console.warn("Failed to save theme preference:", err);
      }
    }
    
    // Then update React state
    setTheme(newTheme);
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

