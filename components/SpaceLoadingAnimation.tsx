"use client";

import { useEffect, useState } from "react";

interface SpaceLoadingAnimationProps {
  onComplete: () => void;
  spaceName?: string;
}

export default function SpaceLoadingAnimation({
  onComplete,
  spaceName = "space",
}: SpaceLoadingAnimationProps) {
  const [percentage, setPercentage] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 100;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newPercentage = Math.min(currentStep, 100);
      setPercentage(newPercentage);

      if (newPercentage >= 100) {
        clearInterval(timer);
        // Start fade out
        setIsFadingOut(true);
        // Call onComplete after fade out animation completes
        setTimeout(() => {
          onComplete();
        }, 300); // Match fade out duration
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-bg-primary dark:bg-bg-dark z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* LED Lights Animation */}
      <div className="relative w-full max-w-[800px] h-[4px] mb-[32px] overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
        <div
          className="absolute top-0 left-0 h-full bg-[#FFFF31] dark:bg-[#FFFF31] transition-all duration-75 ease-linear"
          style={{
            width: `${percentage}%`,
            boxShadow: `0 0 20px #FFFF31, 0 0 40px #FFFF31`,
          }}
        />
        {/* LED dots */}
        {Array.from({ length: 20 }).map((_, i) => {
          const position = (i / 19) * 100;
          const isActive = position <= percentage;
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full transition-all duration-75 ${
                isActive
                  ? "bg-[#FFFF31] dark:bg-[#FFFF31] shadow-[0_0_10px_#FFFF31]"
                  : "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.2)]"
              }`}
              style={{
                left: `calc(${position}% - 4px)`,
              }}
            />
          );
        })}
      </div>

      {/* Loading Text */}
      <p className="text-text-primary dark:text-white text-[24px] font-medium font-sans mb-[16px]">
        Loading {spaceName}
      </p>

      {/* Percentage Counter */}
      <p className="text-[#FFFF31] dark:text-[#FFFF31] text-[48px] font-bold font-sans">
        {percentage}%
      </p>
    </div>
  );
}

