"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-[#0d0d0d] box-border flex flex-col gap-[160px] items-center px-[36px] py-[16px] min-h-screen w-full">
      {/* Hero Container */}
      <div className="flex flex-col gap-[24px] items-center relative w-full max-w-[1400px]">
        <h1 className="text-white text-center leading-none font-sans">
          <span className="font-medium text-[72px] md:text-[72px]">{`Manage all your links in one `}</span>
          <span className="text-gradient-basecamp italic text-[80px] md:text-[80px] font-serif">
            space
          </span>
          <span className="font-medium text-[72px] md:text-[72px]">.</span>
        </h1>

        <div className="bg-gradient-to-t from-[#0d0d0d] to-[#151515] border border-[rgba(194,194,194,0.25)] backdrop-blur-sm h-[600px] relative rounded-[36px] w-full flex items-center justify-center overflow-hidden">
          <p className="text-[#868686] text-[28px] font-medium text-center font-sans">
            Video of how the website works
          </p>
        </div>
      </div>
    </div>
  );
}
