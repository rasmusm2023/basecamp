"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, userData, updateUserTheme } = useAuth();
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

  // Update theme when user data changes (e.g., on sign in)
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      // Initial load: Priority: Firebase user data > localStorage > default
      let savedTheme: Theme | null = null;
      
      // First, check if user is logged in and has a theme preference in Firebase
      if (user && userData?.preferredTheme) {
        savedTheme = userData.preferredTheme;
      } else {
        // Fallback to localStorage
        try {
          savedTheme = localStorage.getItem("preferredTheme") as Theme | null;
        } catch (err) {
          console.warn("Failed to read theme preference:", err);
        }
      }
      
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Default to dark mode
        setThemeState("dark");
        applyTheme("dark");
      }
    } else if (user && userData?.preferredTheme) {
      // User signed in: apply their Firebase theme preference
      const firebaseTheme = userData.preferredTheme;
      if (firebaseTheme !== theme) {
        setThemeState(firebaseTheme);
        applyTheme(firebaseTheme);
        // Also update localStorage to keep them in sync
        try {
          localStorage.setItem("preferredTheme", firebaseTheme);
        } catch (err) {
          console.warn("Failed to save theme preference to localStorage:", err);
        }
      }
    }
  }, [user, userData, mounted, theme]);

  useEffect(() => {
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

  const setTheme = async (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem("preferredTheme", newTheme);
    } catch (err) {
      console.warn("Failed to save theme preference to localStorage:", err);
    }
    
    // If user is logged in, also save to Firebase
    if (user && updateUserTheme) {
      try {
        await updateUserTheme(newTheme);
      } catch (err) {
        console.warn("Failed to save theme preference to Firebase:", err);
      }
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

