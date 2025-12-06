"use client";

import { Check as PhosphorCheck } from "phosphor-react";
import { useEffect, useState } from "react";

export default function Check() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Checkmark only - dark in light mode, light in dark mode */}
      <PhosphorCheck
        size={16}
        weight="fill"
        color={isDark ? "#f2f2f2" : "#0d0d0d"}
      />
    </div>
  );
}
