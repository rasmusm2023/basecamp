"use client";

import Link from "next/link";
import Header from "./Header";

export default function Dashboard() {
  return (
    <div className="bg-white dark:bg-[#0d0d0d] box-border flex flex-col gap-[100px] items-center px-[36px] py-[16px] min-h-screen w-full transition-colors duration-300">
      <Header />

      <div className="flex flex-col gap-[64px] items-center max-w-[1400px] relative w-full">
        {/* Welcome Section */}
        <div className="flex flex-col gap-[24px] items-center relative">
          <h1 className="text-[#1a1a1a] dark:text-white text-center leading-none font-sans transition-colors duration-300">
            <span className="font-medium text-[40px]">{`Welcome to your `}</span>
            <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[44px] font-serif">
              basecamp
            </span>
            <span className="font-medium text-[40px]">.</span>
          </h1>
          <p className="text-[#666666] dark:text-[#999999] text-[16px] font-medium font-sans text-center transition-colors duration-300">
            Your bookmarks and links will appear here
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] border border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)] backdrop-blur-sm h-[400px] relative rounded-[24px] w-full flex items-center justify-center overflow-hidden">
          <p className="text-[#666666] dark:text-[#999999] text-[20px] font-medium text-center font-sans transition-colors duration-300">
            Dashboard content coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

