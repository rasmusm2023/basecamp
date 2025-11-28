"use client";

import Link from "next/link";
import DarkModeToggle from "./icons/DarkModeToggle";
import LogoIcon from "./icons/LogoIcon";

export default function Header() {
  return (
    <header className="flex items-center justify-between relative w-full max-w-[1400px]">
      <div className="relative shrink-0 w-[24px] h-[24px] cursor-pointer">
        <DarkModeToggle />
      </div>

      <Link href="/" className="flex gap-[8px] items-center justify-center">
        <div className="flex gap-[8px] items-center">
          <div className="relative shrink-0 w-[20px] h-[20px] mix-blend-luminosity">
            <LogoIcon />
          </div>
          <p className="text-[#1a1a1a] dark:text-white text-[20px] lowercase font-sans transition-colors duration-300">
            <span className="font-bold">Basecamp.</span>
            <span className="font-light">space</span>
          </p>
        </div>
      </Link>

      <div className="flex gap-[8px] items-center">
        <Link
          href="/login"
          className="px-[8px] py-[8px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-[#666666] dark:text-[#999999] text-[14px] font-medium font-sans transition-colors duration-300">
            Log In
          </p>
        </Link>
        <Link
          href="/signup"
          className="border border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)] backdrop-blur-sm px-[8px] py-[8px] rounded-[8px] cursor-pointer hover:opacity-80 transition-all duration-300"
        >
          <p className="text-[#1a1a1a] dark:text-white text-[14px] font-medium font-sans transition-colors duration-300">
            Sign Up
          </p>
        </Link>
      </div>
    </header>
  );
}
