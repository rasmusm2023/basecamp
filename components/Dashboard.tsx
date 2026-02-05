"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpaces } from "../contexts/SpacesContext";
import SpaceLoadingAnimation from "./SpaceLoadingAnimation";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCard from "./BookmarkCard";
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
import type { Bookmark } from "../lib/types";

export default function Dashboard() {
  const { user, userData } = useAuth();
  const {
    currentSpace,
    currentSpaceId,
    collections,
    foldersMap,
    activeCollectionId,
    activeFolderId,
    setActiveCollection,
    setActiveFolder,
    bookmarks,
    loadingBookmarks,
    createBookmark,
    deleteBookmark,
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
  const [showAddBookmarkForm, setShowAddBookmarkForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bookmarks by search (within current collection/folder context)
  const filteredBookmarks = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter((b) => {
      const name = (b.name ?? "").toLowerCase();
      const url = (b.url ?? "").toLowerCase();
      const desc = (b.description ?? "").toLowerCase();
      const tagsStr = (b.tags ?? []).join(" ").toLowerCase();
      return (
        name.includes(q) ||
        url.includes(q) ||
        desc.includes(q) ||
        tagsStr.includes(q)
      );
    });
  })();

  // Update content key when collection/folder changes to trigger animations
  useEffect(() => {
    setContentKey((prev) => prev + 1);
  }, [activeCollectionId, activeFolderId]);

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

  // Get active collection and folder data
  const activeCollection = collections.find((c) => c.id === activeCollectionId);
  const activeFolder = activeCollectionId
    ? foldersMap[activeCollectionId]?.find((f) => f.id === activeFolderId)
    : null;
  // Check if user is browsing a collection
  const isBrowsingCollection = activeCollectionId !== null;

  // Breadcrumb click handlers
  const handleSpaceClick = () => {
    setActiveCollection(null);
    setActiveFolder(null);
  };

  const handleCollectionClick = (collectionId: string) => {
    setActiveCollection(collectionId);
    setActiveFolder(null);
    // Collection will be expanded by Sidebar's useEffect when activeCollectionId changes
  };

  const handleFolderClick = (collectionId: string, folderId: string) => {
    setActiveCollection(collectionId);
    setActiveFolder(folderId);
    // Collection will be expanded by Sidebar's useEffect when activeCollectionId changes
  };

  return (
    <>
      {isLoadingSpace && (
        <SpaceLoadingAnimation
          onComplete={() => setIsLoadingSpace(false)}
          spaceName={currentSpace?.name || "space"}
        />
      )}
      {/* Left Sidebar - Fixed position, constrained within max-width container */}
      <div
        className="fixed z-10"
        style={{
          top: "36px",
          left: "max(36px, calc((100vw - 2560px) / 2 + 36px))",
        }}
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
              {!isBrowsingCollection ? (
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
                <div className="box-border flex flex-col gap-[24px] items-center px-[64px] py-0 relative shrink-0 w-full animate-fade-in-up">
                  {/* Single row: breadcrumbs, search, actions. Wraps to 2 levels when narrow */}
                  <div
                    className="flex flex-wrap items-center gap-4 w-full animate-fade-in-up"
                    style={{
                      animationDelay: "0.1s",
                      animationFillMode: "both",
                    }}
                  >
                    {/* Level 1 (or left when single row): Breadcrumbs + Search */}
                    <div className="flex flex-1 min-w-0 basis-full md:basis-auto md:min-w-[280px] gap-4 items-center h-[40px]">
                      <div
                        key={`breadcrumbs-${contentKey}`}
                        className="flex gap-[4px] items-center shrink-0 animate-fade-in-up"
                      >
                        <button
                          onClick={handleSpaceClick}
                          className="text-text-primary dark:text-white text-[16px] font-light font-sans opacity-50 transition-colors duration-300 hover:opacity-75 cursor-pointer whitespace-nowrap"
                        >
                          {currentSpace?.name || "Your space"}
                        </button>
                        {activeCollection && (
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
                                handleCollectionClick(activeCollection.id)
                              }
                              className={`text-[16px] font-light font-sans transition-colors duration-300 hover:opacity-75 cursor-pointer whitespace-nowrap ${
                                activeFolder
                                  ? "text-text-primary dark:text-white opacity-50"
                                  : "text-text-primary dark:text-white font-bold"
                              }`}
                            >
                              {activeCollection.name}
                            </button>
                          </>
                        )}
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
                              onClick={() =>
                                handleFolderClick(
                                  activeCollection!.id,
                                  activeFolder.id
                                )
                              }
                              className="text-text-primary dark:text-white text-[16px] font-bold font-sans transition-colors duration-300 hover:opacity-75 cursor-pointer whitespace-nowrap"
                            >
                              {activeFolder.name}
                            </button>
                          </>
                        )}
                      </div>
                      {/* Search Bar - same level as breadcrumbs (40px to match Add link button) */}
                      <div className="flex-1 min-w-[200px] h-[40px] min-w-0">
                        <div className="bg-[#161616] dark:bg-[#161616] flex h-[40px] items-center justify-between gap-2 relative rounded-[8px] border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] transition-all duration-500 ease-in-out overflow-hidden px-3">
                          <div className="flex gap-2 items-center flex-1 min-w-0">
                            <Search
                              size={16}
                              weight="regular"
                              className="text-text-secondary dark:text-text-light shrink-0 transition-colors duration-300"
                            />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search in this collection..."
                              className="flex-1 min-w-0 bg-transparent border-none outline-none text-text-primary dark:text-white text-[12px] font-medium font-sans placeholder:text-text-secondary dark:placeholder:text-text-light placeholder:opacity-50"
                            />
                          </div>
                          {searchQuery.trim() && (
                            <div
                              key={`searching-${contentKey}`}
                              className="bg-[#343434] dark:bg-[#343434] box-border flex gap-[8px] items-center justify-center overflow-hidden px-[8px] py-[4px] rounded-[8px] shrink-0 animate-fade-in-up"
                            >
                              <p className="text-white text-[12px] font-medium font-sans opacity-40">
                                Searching:
                              </p>
                              <p className="text-white text-[12px] font-medium font-sans truncate max-w-[120px]">
                                {activeFolder
                                  ? activeFolder.name
                                  : activeCollection
                                  ? activeCollection.name
                                  : currentSpace?.name || "Your space"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Level 2 (or right when single row): Add link, Edit, View toggle */}
                    <div className="flex gap-[16px] h-[40px] items-center shrink-0 basis-full md:basis-auto justify-end">
                      <button
                        onClick={() => setShowAddBookmarkForm(true)}
                        className="liquid-glass-border box-border flex gap-[8px] items-center justify-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
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
                      </button>
                      <div className="liquid-glass-border box-border flex gap-[8px] items-center justify-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="relative shrink-0 w-[16px] h-[16px]">
                          <Folder
                            size={16}
                            weight="regular"
                            className="text-text-light dark:text-text-light transition-colors duration-300"
                          />
                        </div>
                        <p className="text-text-light dark:text-text-light text-[12px] font-medium font-sans transition-colors duration-300">
                          {activeFolderId ? "Edit folder" : "Edit collection"}
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
                      {searchQuery.trim()
                        ? `${filteredBookmarks.length} of ${bookmarks.length} `
                        : ""}
                      {filteredBookmarks.length === 1 ? "link" : "links"}
                    </p>
                    {/* Bookmarks Display - wrapped for grouped appearance */}
                    <div className="rounded-[20px] bg-bg-primary dark:bg-bg-dark border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] p-6 w-full transition-colors duration-300">
                      {loadingBookmarks ? (
                        <div className="flex items-center justify-center h-[400px]">
                          <p className="text-text-secondary dark:text-text-light">
                            Loading bookmarks...
                          </p>
                        </div>
                      ) : filteredBookmarks.length === 0 ? (
                        /* No search results or empty state */
                        bookmarks.length > 0 && searchQuery.trim() ? (
                          <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <p className="text-text-secondary dark:text-text-light text-[14px] font-sans">
                              No links match &quot;{searchQuery.trim()}&quot;
                            </p>
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="text-text-primary dark:text-white text-[12px] font-medium font-sans underline hover:opacity-80 transition-opacity"
                            >
                              Clear search
                            </button>
                          </div>
                        ) : (
                          /* Empty State - no bookmarks */
                          <div className="gap-[24px] grid grid-cols-3 min-[2560px]:grid-cols-4 grid-rows-2 h-[680px] relative shrink-0 w-full">
                            <button
                              onClick={() => setShowAddBookmarkForm(true)}
                              className="border-2 border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] border-solid min-h-[380px] relative rounded-[8px] self-start shrink-0 w-full hover:border-[rgba(255,255,255,0.2)] transition-colors"
                            >
                              <div className="flex flex-col min-h-[380px] items-center justify-center overflow-hidden relative rounded-[inherit] w-full">
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
                            </button>
                          </div>
                        )
                      ) : viewMode === "grid" ? (
                        /* Grid View */
                        <div className="gap-[24px] grid grid-cols-3 min-[2560px]:grid-cols-4 relative shrink-0 w-full">
                          {filteredBookmarks.map((bookmark) => (
                            <BookmarkCard
                              key={bookmark.id}
                              bookmark={bookmark}
                              viewMode="grid"
                              onEdit={(b) => {
                                setEditingBookmark(b);
                                setShowAddBookmarkForm(true);
                              }}
                              onDelete={async () => {
                                if (!currentSpaceId || !activeCollectionId)
                                  return;
                                try {
                                  await deleteBookmark(
                                    currentSpaceId,
                                    activeCollectionId,
                                    activeFolderId ?? bookmark.folderId,
                                    bookmark.id
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error deleting bookmark:",
                                    error
                                  );
                                }
                              }}
                            />
                          ))}
                          {/* Add Link Card in Grid - same height as link cards */}
                          <button
                            onClick={() => setShowAddBookmarkForm(true)}
                            className="border-2 border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] border-solid min-h-[380px] relative rounded-[8px] shrink-0 w-full hover:border-[rgba(255,255,255,0.2)] transition-colors"
                          >
                            <div className="flex flex-col min-h-[380px] items-center justify-center overflow-hidden relative rounded-[inherit] w-full">
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
                          </button>
                        </div>
                      ) : (
                        /* List View */
                        <div className="flex flex-col gap-[16px] relative shrink-0 w-full">
                          {filteredBookmarks.map((bookmark) => (
                            <BookmarkCard
                              key={bookmark.id}
                              bookmark={bookmark}
                              viewMode="list"
                              onEdit={(b) => {
                                setEditingBookmark(b);
                                setShowAddBookmarkForm(true);
                              }}
                              onDelete={async () => {
                                if (!currentSpaceId || !activeCollectionId)
                                  return;
                                try {
                                  await deleteBookmark(
                                    currentSpaceId,
                                    activeCollectionId,
                                    activeFolderId ?? bookmark.folderId,
                                    bookmark.id
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error deleting bookmark:",
                                    error
                                  );
                                }
                              }}
                            />
                          ))}
                          {/* Add Link Card in List */}
                          <button
                            onClick={() => setShowAddBookmarkForm(true)}
                            className="border-2 border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] border-solid h-[100px] relative rounded-[8px] shrink-0 w-full hover:border-[rgba(255,255,255,0.2)] transition-colors"
                          >
                            <div className="flex flex-col h-[100px] items-center justify-center overflow-hidden relative rounded-[inherit] w-full">
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
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add / Edit Bookmark Form Modal */}
      {(showAddBookmarkForm || editingBookmark) &&
        currentSpaceId &&
        activeCollectionId && (
          <AddBookmarkForm
            spaceId={currentSpaceId}
            collectionId={activeCollectionId}
            folderId={activeFolderId || undefined}
            editingBookmark={editingBookmark ?? undefined}
            onClose={() => {
              setShowAddBookmarkForm(false);
              setEditingBookmark(null);
            }}
            onSuccess={() => {
              setShowAddBookmarkForm(false);
              setEditingBookmark(null);
            }}
          />
        )}
    </>
  );
}
