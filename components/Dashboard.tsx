"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpaces } from "../contexts/SpacesContext";
import SpaceLoadingAnimation from "./SpaceLoadingAnimation";
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
  const {
    currentSpace,
    currentSpaceId,
    folders,
    subFoldersMap,
    activeFolderId,
    activeSubFolderId,
    setActiveFolder,
    setActiveSubFolder,
  } = useSpaces();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right" | null
  >(null);
  const [contentKey, setContentKey] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSpace, setIsLoadingSpace] = useState(false);
  const [previousSpaceId, setPreviousSpaceId] = useState<string | null>(null);

  // Update content key when folder/subfolder changes to trigger animations
  useEffect(() => {
    setContentKey((prev) => prev + 1);
  }, [activeFolderId, activeSubFolderId]);

  // Trigger loading animation when space changes (not on initial load)
  useEffect(() => {
    if (
      currentSpaceId &&
      previousSpaceId !== null &&
      currentSpaceId !== previousSpaceId
    ) {
      // Only show loading animation when switching between spaces, not on initial load
      setIsLoadingSpace(true);
      setPreviousSpaceId(currentSpaceId);
    } else if (currentSpaceId && previousSpaceId === null) {
      // On initial load, just set the previousSpaceId without showing loading
      setPreviousSpaceId(currentSpaceId);
    }
  }, [currentSpaceId, previousSpaceId]);

  // Get user display name and email
  const displayName = userData?.displayName || user?.displayName || "User";
  const email = userData?.email || user?.email || "";

  // Get active folder and subfolder data
  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const activeSubFolder = activeFolderId
    ? subFoldersMap[activeFolderId]?.find((sf) => sf.id === activeSubFolderId)
    : null;
  // Check if user is browsing a folder
  const isBrowsingFolder = activeFolderId !== null;

  // Breadcrumb click handlers
  const handleSpaceClick = () => {
    setActiveFolder(null);
    setActiveSubFolder(null);
  };

  const handleFolderClick = (folderId: string) => {
    setActiveFolder(folderId);
    setActiveSubFolder(null);
    // Folder will be expanded by Sidebar's useEffect when activeFolderId changes
  };

  const handleSubFolderClick = (folderId: string, subFolderId: string) => {
    setActiveFolder(folderId);
    setActiveSubFolder(subFolderId);
    // Folder will be expanded by Sidebar's useEffect when activeFolderId changes
  };

  return (
    <>
      {isLoadingSpace && (
        <SpaceLoadingAnimation
          onComplete={() => setIsLoadingSpace(false)}
          spaceName={currentSpace?.name || "space"}
        />
      )}
      {/* Left Sidebar - Fixed position, always centered in viewport */}
      <div
        className="fixed z-10"
        style={{ top: "50vh", transform: "translateY(-50%)", left: "36px" }}
      >
        <Sidebar />
      </div>
      {!isLoadingSpace && (
        <div className="bg-bg-primary dark:bg-bg-dark box-border flex flex-col gap-[36px] items-end px-[36px] pb-[16px] min-h-screen w-full transition-colors duration-300 animate-fade-in-up">
          {/* Main Content Area */}
          <div className="flex gap-[36px] items-start relative w-full">
            {/* Spacer for sidebar to prevent content overlap */}
            <div
              className="w-[280px] shrink-0"
              style={{ marginRight: "36px" }}
            />

            {/* Main Content */}
            <div className="flex flex-col gap-[8px] items-center relative shrink-0 flex-1">
              {!isBrowsingFolder ? (
                /* Large Search Box - When no folder is active */
                <div className="flex flex-col items-center justify-start relative shrink-0 flex-1 w-full px-[64px]">
                  <div
                    className="w-full max-w-[720px] transition-all duration-500 ease-in-out flex flex-col gap-[24px] items-center mx-auto relative"
                    style={{ marginTop: "calc(400px - 36px - 64px)" }}
                  >
                    {/* Blurred yellow dot with tail effect */}
                    <div
                      className="absolute -z-10 animate-move-dot"
                      style={{
                        width: "200px",
                        height: "100px",
                        top: "0",
                      }}
                    >
                      {/* Tail */}
                      <div
                        className="absolute rounded-full blur-[40px] opacity-60"
                        style={{
                          background:
                            "linear-gradient(to right, transparent 0%, #FFFF99 50%, #FFFF99 100%)",
                          width: "150px",
                          height: "40px",
                          left: "0",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                      {/* Dot */}
                      <div
                        className="absolute rounded-full blur-[20px] opacity-90"
                        style={{
                          background:
                            "radial-gradient(circle, #FFFF99 0%, transparent 70%)",
                          width: "30px",
                          height: "30px",
                          right: "0",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </div>
                    {/* Blurred blue dot with tail effect (opposite direction) */}
                    <div
                      className="absolute -z-10 animate-move-dot-reverse"
                      style={{
                        width: "200px",
                        height: "100px",
                        top: "0",
                      }}
                    >
                      {/* Tail */}
                      <div
                        className="absolute rounded-full blur-[40px] opacity-60"
                        style={{
                          background:
                            "linear-gradient(to left, transparent 0%, #99CCFF 50%, #99CCFF 100%)",
                          width: "150px",
                          height: "40px",
                          right: "0",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                      {/* Dot */}
                      <div
                        className="absolute rounded-full blur-[20px] opacity-90"
                        style={{
                          background:
                            "radial-gradient(circle, #99CCFF 0%, transparent 70%)",
                          width: "30px",
                          height: "30px",
                          left: "0",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </div>
                    <p className="text-text-primary dark:text-white text-[32px] font-normal font-sans transition-colors duration-300 relative z-0">
                      What are you looking for?
                    </p>
                    <div
                      className={`w-full bg-[#161616] dark:bg-[#161616] border border-solid rounded-[16px] overflow-hidden transition-all duration-500 ease-in-out relative z-0 ${
                        isSearchFocused
                          ? "border-[rgba(255,255,255,0.3)] dark:border-[rgba(255,255,255,0.3)]"
                          : "border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)]"
                      }`}
                    >
                      <div className="bg-gradient-to-t from-input-bg-start dark:from-[rgba(13,13,13,0.2)] to-input-bg-end dark:to-[rgba(21,21,21,0.2)] box-border flex items-center justify-between gap-[16px] overflow-hidden px-[24px] py-[20px] relative rounded-[16px] transition-all duration-500 ease-in-out">
                        <div className="flex items-center gap-[16px] relative shrink-0 flex-1">
                          <div className="relative shrink-0 w-[24px] h-[24px] transition-all duration-500 ease-in-out">
                            <Search
                              size={24}
                              weight="regular"
                              className="text-text-secondary dark:text-text-light transition-colors duration-300"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Search for your links..."
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="flex-1 bg-transparent border-none outline-none text-text-primary dark:text-white text-[18px] font-medium font-sans placeholder:text-text-secondary dark:placeholder:text-text-light placeholder:opacity-50 transition-all duration-300 ease-in-out"
                          />
                        </div>
                        <div className="bg-[#343434] dark:bg-[#343434] box-border flex gap-[8px] items-center justify-center overflow-hidden px-[8px] py-[4px] relative rounded-[8px] shrink-0 transition-all duration-500 ease-in-out">
                          <p className="text-white text-[12px] font-medium font-sans opacity-40">
                            Searching:
                          </p>
                          <p className="text-white text-[12px] font-medium font-sans">
                            {currentSpace?.name || "Your space"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Layout - When folder is active */
                <div className="box-border flex flex-col gap-[48px] items-center px-[64px] py-0 relative shrink-0 w-full animate-fade-in-up">
                  {/* Breadcrumb Navigation */}
                  <div className="flex gap-[16px] items-center relative shrink-0 w-full">
                    <div
                      key={`breadcrumbs-${contentKey}`}
                      className="flex gap-[4px] items-center relative shrink-0 animate-fade-in-up"
                    >
                      {/* Space */}
                      <button
                        onClick={handleSpaceClick}
                        className="text-text-primary dark:text-white text-[16px] font-light font-sans opacity-50 transition-colors duration-300 hover:opacity-75 cursor-pointer"
                      >
                        {currentSpace?.name || "Your space"}
                      </button>

                      {/* Show folder if active folder exists */}
                      {activeFolder && (
                        <>
                          <div className="relative shrink-0 w-[24px] h-[24px]">
                            <ChevronRight
                              size={24}
                              weight="regular"
                              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
                            />
                          </div>
                          <button
                            onClick={() => handleFolderClick(activeFolder.id)}
                            className={`text-[16px] font-light font-sans transition-colors duration-300 hover:opacity-75 cursor-pointer ${
                              activeSubFolder
                                ? "text-text-primary dark:text-white opacity-50"
                                : "text-text-primary dark:text-white font-bold"
                            }`}
                          >
                            {activeFolder.name}
                          </button>
                        </>
                      )}

                      {/* Show subfolder if active subfolder exists */}
                      {activeSubFolder && (
                        <>
                          <div className="relative shrink-0 w-[24px] h-[24px]">
                            <ChevronRight
                              size={24}
                              weight="regular"
                              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleSubFolderClick(
                                activeFolder!.id,
                                activeSubFolder.id
                              )
                            }
                            className="text-text-primary dark:text-white text-[16px] font-bold font-sans transition-colors duration-300 hover:opacity-75 cursor-pointer"
                          >
                            {activeSubFolder.name}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div
                    className="flex h-[40px] items-center justify-between relative shrink-0 w-full animate-fade-in-up"
                    style={{
                      animationDelay: "0.1s",
                      animationFillMode: "both",
                    }}
                  >
                    {/* Search Bar */}
                    <div className="bg-[#161616] dark:bg-[#161616] flex h-full items-start justify-between relative shrink-0 flex-1 max-w-[728px] transition-all duration-500 ease-in-out">
                      <div className="basis-0 border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] border-solid grow h-full min-h-px min-w-px relative rounded-[8px] shrink-0 overflow-visible transition-all duration-500 ease-in-out">
                        <div className="bg-gradient-to-t from-input-bg-start dark:from-[rgba(13,13,13,0.2)] to-input-bg-end dark:to-[rgba(21,21,21,0.2)] box-border flex items-center justify-between overflow-visible px-[16px] py-0 relative rounded-[8px] size-full transition-all duration-500 ease-in-out">
                          <div className="flex gap-[8px] items-center relative shrink-0 transition-all duration-500 ease-in-out">
                            <div className="relative shrink-0 w-[16px] h-[16px] transition-all duration-500 ease-in-out">
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
                          <div
                            key={`searching-${contentKey}`}
                            className="bg-[#343434] dark:bg-[#343434] box-border flex gap-[8px] items-center justify-center overflow-hidden px-[8px] py-[4px] relative rounded-[8px] shrink-0 animate-fade-in-up"
                          >
                            <p className="text-white text-[12px] font-medium font-sans opacity-40">
                              Searching:
                            </p>
                            <p className="text-white text-[12px] font-medium font-sans">
                              {activeSubFolder
                                ? activeSubFolder.name
                                : activeFolder
                                ? activeFolder.name
                                : currentSpace?.name || "Your space"}
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
                                isTransitioning &&
                                transitionDirection === "left"
                                  ? "animate-slide-in-from-left"
                                  : isTransitioning &&
                                    transitionDirection === "right"
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
                  <div
                    key={`content-${contentKey}`}
                    className="flex flex-col gap-[16px] items-start relative shrink-0 w-full animate-fade-in-up"
                    style={{
                      animationDelay: "0.2s",
                      animationFillMode: "both",
                    }}
                  >
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
