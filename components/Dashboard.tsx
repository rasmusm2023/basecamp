"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  Plus,
  Folder,
  GridView,
  ListView,
  ChevronRight,
  Hide,
  CollapseAll,
  ArrowsInSimple,
  Book,
} from "./icons";
import Sidebar from "./Sidebar";

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right" | null
  >(null);

  // Get user display name and email
  const displayName = userData?.displayName || user?.displayName || "User";
  const email = userData?.email || user?.email || "";

  return (
    <div className="bg-bg-primary dark:bg-bg-dark box-border flex flex-col gap-[36px] items-end px-[36px] pb-[16px] min-h-screen w-full transition-colors duration-300">
      {/* Main Content Area */}
      <div className="flex gap-[36px] items-start relative w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col gap-[8px] items-center relative shrink-0 flex-1">
          <div className="box-border flex flex-col gap-[48px] items-center px-[64px] py-0 relative shrink-0 w-full">
            {/* Breadcrumb Navigation */}
            <div className="flex gap-[16px] items-center relative shrink-0 w-full">
              <div className="flex gap-[4px] items-center relative shrink-0">
                <p className="text-text-primary dark:text-white text-[16px] font-light font-sans opacity-50 transition-colors duration-300">
                  Your space
                </p>
                <div className="relative shrink-0 w-[24px] h-[24px]">
                  <ChevronRight
                    size={24}
                    weight="regular"
                    className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
                  />
                </div>
                <p className="text-text-primary dark:text-white text-[16px] font-light font-sans opacity-50 transition-colors duration-300">
                  Unnamed folder
                </p>
                <div className="relative shrink-0 w-[24px] h-[24px]">
                  <ChevronRight
                    size={24}
                    weight="regular"
                    className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
                  />
                </div>
                <p className="text-text-primary dark:text-white text-[16px] font-bold font-sans transition-colors duration-300">
                  Unnamed sub-folder
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex h-[40px] items-center justify-between relative shrink-0 w-full">
              {/* Search Bar */}
              <div className="bg-[#161616] dark:bg-[#161616] flex h-full items-start justify-between relative shrink-0 flex-1 max-w-[728px]">
                <div className="basis-0 border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] border-solid grow h-full min-h-px min-w-px relative rounded-[8px] shrink-0 overflow-hidden">
                  <div className="bg-gradient-to-t from-input-bg-start dark:from-[rgba(13,13,13,0.2)] to-input-bg-end dark:to-[rgba(21,21,21,0.2)] box-border flex items-center justify-between overflow-hidden px-[16px] py-0 relative rounded-[8px] size-full">
                    <div className="flex gap-[8px] items-center relative shrink-0">
                      <div className="relative shrink-0 w-[16px] h-[16px]">
                        <Search
                          size={16}
                          weight="regular"
                          className="text-text-secondary dark:text-text-light transition-colors duration-300"
                        />
                      </div>
                      <p className="text-text-secondary dark:text-text-light text-[12px] font-medium font-sans opacity-50 transition-colors duration-300">
                        Search to find what you're looking for
                      </p>
                    </div>
                    <div className="bg-[#343434] dark:bg-[#343434] box-border flex gap-[8px] items-center justify-center overflow-hidden px-[8px] py-[4px] relative rounded-[8px] shrink-0">
                      <p className="text-white text-[12px] font-medium font-sans opacity-40">
                        Searching:
                      </p>
                      <p className="text-white text-[12px] font-medium font-sans">
                        Unnamed sub-folder
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-[16px] h-full items-center justify-end relative shrink-0">
                <div className="liquid-glass-border box-border flex gap-[8px] items-center justify-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative shrink-0 w-[16px] h-[16px]">
                    <Plus
                      size={16}
                      weight="regular"
                      className="text-text-light dark:text-text-light transition-colors duration-300"
                    />
                  </div>
                  <p className="text-text-light dark:text-text-light text-[12px] font-medium font-sans transition-colors duration-300">
                    Add link
                  </p>
                </div>
                <div className="liquid-glass-border box-border flex gap-[8px] items-center justify-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative shrink-0 w-[16px] h-[16px]">
                    <Folder
                      size={16}
                      weight="regular"
                      className="text-text-light dark:text-text-light transition-colors duration-300"
                    />
                  </div>
                  <p className="text-text-light dark:text-text-light text-[12px] font-medium font-sans transition-colors duration-300">
                    Edit folder
                  </p>
                </div>
                {/* View Toggle */}
                <div className="flex flex-col gap-[8px] h-full items-center relative shrink-0 w-[128px]">
                  <div className="basis-0 bg-gradient-to-t liquid-glass-border from-input-bg-start dark:from-[rgba(13,13,13,0.2)] grow min-h-px min-w-px relative rounded-[8px] shrink-0 to-input-bg-end dark:to-[rgba(21,21,21,0.2)] w-full">
                    <div className="flex items-center justify-end overflow-hidden relative rounded-[inherit] size-full">
                      {/* Sliding background */}
                      <div
                        className={`absolute bg-[#f2f2f2] dark:bg-[#f2f2f2] border-2 border-white dark:border-white rounded-[8px] h-[38px] ${
                          viewMode === "list" ? "w-[63px]" : "w-[64px]"
                        } ${
                          isTransitioning && transitionDirection === "left"
                            ? "animate-slide-in-from-left"
                            : isTransitioning && transitionDirection === "right"
                            ? "animate-slide-in-from-right"
                            : viewMode === "list"
                            ? "left-0"
                            : "right-0"
                        }`}
                        style={
                          !isTransitioning
                            ? {
                                transition: "all 0.3s ease-in-out",
                              }
                            : {}
                        }
                      />
                      <button
                        onClick={() => {
                          if (viewMode !== "list") {
                            setTransitionDirection("left");
                            setIsTransitioning(true);
                            setViewMode("list");
                            setTimeout(() => {
                              setIsTransitioning(false);
                              setTransitionDirection(null);
                            }, 300);
                          }
                        }}
                        className={`flex gap-[8px] h-[38px] items-center justify-center overflow-hidden relative rounded-[8px] shrink-0 w-[63px] transition-opacity duration-300 hover:opacity-80 z-10 ${
                          viewMode === "list" ? "" : "opacity-50"
                        }`}
                      >
                        <div className="relative shrink-0 w-[24px] h-[24px]">
                          <ListView
                            size={24}
                            weight="regular"
                            className={`transition-colors duration-300 ${
                              viewMode === "list"
                                ? "text-[#0d0d0d] dark:text-[#0d0d0d]"
                                : "text-text-light dark:text-text-light"
                            }`}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          if (viewMode !== "grid") {
                            setTransitionDirection("right");
                            setIsTransitioning(true);
                            setViewMode("grid");
                            setTimeout(() => {
                              setIsTransitioning(false);
                              setTransitionDirection(null);
                            }, 300);
                          }
                        }}
                        className={`h-full relative rounded-[8px] shrink-0 w-[64px] transition-opacity duration-300 hover:opacity-80 z-10 ${
                          viewMode === "grid" ? "" : "opacity-50"
                        }`}
                      >
                        <div className="flex gap-[8px] h-full items-center justify-center overflow-hidden relative rounded-[inherit] w-[64px]">
                          <div className="relative shrink-0 w-[24px] h-[24px]">
                            <GridView
                              size={24}
                              weight="regular"
                              className={`transition-colors duration-300 ${
                                viewMode === "grid"
                                  ? "text-[#0d0d0d] dark:text-[#0d0d0d]"
                                  : "text-text-light dark:text-text-light"
                              }`}
                            />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <p className="text-text-primary dark:text-white text-[12px] font-medium font-sans opacity-75 text-right w-full transition-colors duration-300">
                0 saved links
              </p>
              {/* Empty State Grid */}
              <div className="gap-[24px] grid grid-cols-4 grid-rows-2 h-[680px] relative shrink-0 w-full">
                {/* Add Link Card */}
                <div className="border-2 border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] border-solid h-[300px] relative rounded-[16px] self-start shrink-0 w-full">
                  <div className="flex flex-col h-[300px] items-center justify-center overflow-hidden relative rounded-[inherit] w-full">
                    <div className="basis-0 bg-gradient-to-r box-border flex from-bg-dark dark:from-bg-dark gap-[8px] grow items-center justify-center min-h-px min-w-px opacity-25 overflow-hidden p-[16px] relative shrink-0 to-[#151515] dark:to-[#151515] w-full">
                      <div className="flex gap-[8px] items-center justify-center relative shrink-0">
                        <div className="bg-[#282828] dark:bg-[#282828] border border-white dark:border-white relative rounded-[200px] shrink-0 size-[40px] flex items-center justify-center">
                          <div className="overflow-hidden relative rounded-[inherit] size-[40px] flex items-center justify-center">
                            <Plus
                              size={24}
                              weight="regular"
                              className="text-white transition-colors duration-300"
                            />
                          </div>
                        </div>
                        <p className="text-text-primary dark:text-white text-[16px] font-medium font-sans transition-colors duration-300">
                          Add link
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
