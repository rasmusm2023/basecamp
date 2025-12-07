"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DarkModeToggle, LogoIcon } from "./icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  UserCircle,
  RocketLaunch,
  Plus,
  Sparkle,
  Sun,
  Moon,
  SignOut,
  ChatTeardropText,
  StarFour,
} from "./icons";

export default function Header() {
  const { user, userData, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user display name
  const displayName = userData?.displayName || user?.displayName || "User";
  const firstName = displayName.split(" ")[0] || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <header className="grid grid-cols-3 items-center relative w-full">
      {/* Left Section */}
      <div className="flex gap-[16px] items-center relative shrink-0">
        {user ? (
          // Logged in state - left side (empty, theme toggle removed)
          <></>
        ) : (
          // Logged out state - left side
          <div className="relative shrink-0 w-[24px] h-[24px]">
            <DarkModeToggle />
          </div>
        )}
      </div>

      {/* Center: Logo - Absolutely centered */}
      <div className="flex gap-[8px] items-center justify-center relative">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex gap-[8px] items-center justify-center"
        >
          <div className="flex gap-[8px] items-center">
            <div className="relative shrink-0 w-[16px] h-[16px] mix-blend-luminosity">
              <LogoIcon />
            </div>
            <p className="text-text-primary text-[16px] lowercase font-sans transition-colors duration-300">
              <span className="font-bold">Basecamp.</span>
              <span className="font-light">space</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex gap-[8px] items-center justify-end relative shrink-0">
        {user ? (
          // Logged in state - right side
          <>
            {/* Upgrade Plan Button */}
            <button className="border border-[#ffac33] dark:border-[#ffac33] border-solid box-border flex gap-[8px] items-center justify-center p-[8px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity upgrade-plan-gradient">
              <div className="relative shrink-0 w-[16px] h-[16px]">
                <Sparkle
                  size={16}
                  weight="regular"
                  className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                />
              </div>
              <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                Upgrade
              </p>
            </button>

            {/* Profile Button with Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`box-border flex gap-[8px] items-center justify-center p-[8px] relative shrink-0 cursor-pointer rounded-[8px] transition-all duration-300 ${
                  showDropdown
                    ? "bg-bg-primary dark:bg-[rgba(255,255,255,0.1)]"
                    : "hover:bg-bg-primary dark:hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                <div className="relative shrink-0 w-[16px] h-[16px]">
                  <UserCircle
                    size={16}
                    weight="regular"
                    className="text-text-tertiary dark:text-text-tertiary transition-colors duration-300"
                  />
                </div>
                <p className="text-text-tertiary text-[12px] font-medium font-sans transition-colors duration-300">
                  {firstName}
                </p>
              </button>

              {/* Combined Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-[calc(100%+8px)] border border-white dark:border-white bg-white dark:bg-white box-border flex flex-col gap-[4px] items-start justify-center p-[8px] rounded-[8px] shrink-0 animate-slide-down z-50 min-w-[200px]">
                  {/* Spaces Section */}
                  <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[10px] font-medium font-sans uppercase opacity-60 px-[8px] py-[4px]">
                    SPACES
                  </p>
                  {/* My Spaces */}
                  <button className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <RocketLaunch
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      My spaces
                    </p>
                  </button>

                  {/* Share Space */}
                  <button className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <Plus
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      Share space
                    </p>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(0,0,0,0.05)] w-full my-[4px]" />

                  {/* Settings Section */}
                  <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[10px] font-medium font-sans uppercase opacity-60 px-[8px] py-[4px]">
                    SETTINGS
                  </p>
                  {/* Account Settings */}
                  <button className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <UserCircle
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      Account settings
                    </p>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleThemeToggle();
                    }}
                    className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      {theme === "dark" ? (
                        <Sun
                          size={16}
                          weight="regular"
                          className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                        />
                      ) : (
                        <Moon
                          size={16}
                          weight="regular"
                          className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                        />
                      )}
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </p>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(0,0,0,0.05)] w-full my-[4px]" />

                  {/* Community Section */}
                  <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[10px] font-medium font-sans uppercase opacity-60 px-[8px] py-[4px]">
                    COMMUNITY
                  </p>
                  {/* Feedback Board */}
                  <button className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <ChatTeardropText
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      Feedback board
                    </p>
                  </button>

                  {/* Templates */}
                  <button className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <StarFour
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      Templates
                    </p>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(0,0,0,0.05)] w-full my-[4px]" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="box-border flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="relative shrink-0 w-[16px] h-[16px]">
                      <SignOut
                        size={16}
                        weight="regular"
                        className="text-[#0d0d0d] dark:text-[#0d0d0d] transition-colors duration-300"
                      />
                    </div>
                    <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-medium font-sans transition-colors duration-300">
                      Logout
                    </p>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Logged out state - right side
          <>
            <Link
              href="/login"
              className="px-[16px] py-[8px] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <p className="text-text-tertiary text-[14px] font-semibold font-sans transition-colors duration-300">
                Log In
              </p>
            </Link>
            <Link
              href="/signup"
              className="border border-border-default backdrop-blur-sm px-[16px] py-[8px] rounded-[8px] cursor-pointer hover:opacity-80 transition-all duration-300"
            >
              <p className="text-text-primary text-[14px] font-semibold font-sans transition-colors duration-300">
                Sign Up
              </p>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
