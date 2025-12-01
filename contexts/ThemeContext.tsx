"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    // Remove dark class first to ensure clean state
    root.classList.remove("dark");
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      // Explicitly ensure dark class is removed for light mode
      root.classList.remove("dark");
    }
    // Force reflow for Firefox to ensure class changes are applied
    void root.offsetHeight;
  };

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme preference with error handling
    let savedTheme: Theme | null = null;
    try {
      savedTheme = localStorage.getItem("preferredTheme") as Theme | null;
    } catch (err) {
      console.warn("Failed to read theme preference:", err);
    }
    
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark mode
      setThemeState("dark");
      applyTheme("dark");
    }

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "preferredTheme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === "light" || newTheme === "dark") {
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem("preferredTheme", newTheme);
    } catch (err) {
      console.warn("Failed to save theme preference:", err);
    }
  };

  // Always provide the context, but only apply theme changes after mount
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

