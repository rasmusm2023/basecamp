"use client";

import Link from "next/link";
import Header from "./Header";

export default function LandingPage() {
  return (
    <div className="bg-[#0d0d0d] box-border flex flex-col gap-[160px] items-center px-[36px] py-[16px] min-h-screen w-full">
      <div className="w-full max-w-[1400px]">
        <Header />
      </div>

      {/* Hero Container */}
      <div className="flex flex-col gap-[24px] items-center relative w-full max-w-[1400px]">
        <h1 className="text-white text-center leading-none font-sans">
          <span className="font-medium text-[64px] md:text-[64px]">{`Manage all your links in one `}</span>
          <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[72px] md:text-[72px] font-serif">
            space
          </span>
          <span className="font-medium text-[64px] md:text-[64px]">.</span>
        </h1>

        <div className="bg-gradient-to-t from-[#0d0d0d] to-[#151515] border-2 border-[rgba(255,255,255,0.1)] h-[600px] relative rounded-[36px] w-full flex items-center justify-center overflow-hidden">
          <p className="text-[#868686] text-[24px] font-medium text-center font-sans">
            Video of how the website works
          </p>
        </div>
      </div>
    </div>
  );
}
