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
          <p className="text-white text-[20px] lowercase font-sans">
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
          <p className="text-[#999999] text-[12px] font-medium font-sans">
            Log In
          </p>
        </Link>
        <Link
          href="/signup"
          className="border border-white px-[8px] py-[8px] rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-white text-[12px] font-medium font-sans">
            Sign Up
          </p>
        </Link>
      </div>
    </header>
  );
}
