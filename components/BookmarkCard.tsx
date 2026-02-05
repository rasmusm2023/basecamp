"use client";

import { useState } from "react";
import { Bookmark } from "../lib/types";
import { Link as LinkIcon, Trash, PencilSimple } from "./icons";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: "grid" | "list";
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({
  bookmark,
  viewMode,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const [hovered, setHovered] = useState(false);
  const handleClick = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const openInBackground = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
    window.focus();
  };

  const preventMiddleClickScroll = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const imageBlock = (listStyle: boolean) => (
    <div
      className={cn(
        "relative overflow-hidden bg-[#282828] dark:bg-[#282828] flex items-center justify-center cursor-pointer",
        listStyle
          ? "shrink-0 w-[120px] h-[80px] rounded-[8px]"
          : "w-full h-[280px]"
      )}
      onClick={handleClick}
      onAuxClick={openInBackground}
      onMouseDown={preventMiddleClickScroll}
    >
      {bookmark.image ? (
        <img
          src={bookmark.image}
          alt={bookmark.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center",
          bookmark.image && "hidden"
        )}
      >
        <LinkIcon
          size={listStyle ? 32 : 48}
          weight="regular"
          className="text-text-secondary dark:text-text-light opacity-50"
        />
      </div>
    </div>
  );

  const actionButtons = (onImageOverlay: boolean) => (
    <div
      className={cn(
        "flex gap-2 transition-opacity",
        onImageOverlay
          ? "absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          : "shrink-0 opacity-0 group-hover:opacity-100"
      )}
    >
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(bookmark);
          }}
          className={cn(
            "p-2 rounded-[8px] hover:opacity-80 transition-opacity",
            onImageOverlay
              ? "bg-black/50 backdrop-blur-sm hover:bg-black/70"
              : "bg-[#343434] dark:bg-[#343434]"
          )}
          title="Edit bookmark"
        >
          <PencilSimple
            size={16}
            weight="regular"
            className={
              onImageOverlay
                ? "text-white"
                : "text-text-light dark:text-text-light"
            }
          />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(bookmark);
          }}
          className={cn(
            "p-2 rounded-[8px] hover:opacity-80 transition-opacity",
            onImageOverlay
              ? "bg-black/50 backdrop-blur-sm hover:bg-black/70"
              : "bg-[#343434] dark:bg-[#343434]"
          )}
          title="Delete bookmark"
        >
          <Trash
            size={16}
            weight="regular"
            className={
              onImageOverlay
                ? "text-white"
                : "text-text-light dark:text-text-light"
            }
          />
        </button>
      )}
    </div>
  );

  const tagsBlock = (
    <div className="flex gap-2 flex-wrap">
      {bookmark.tags?.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-[#b3b3b3] dark:text-[#b3b3b3] text-[10px] font-sans font-bold uppercase"
        >
          {tag}
        </span>
      ))}
      {bookmark.tags && bookmark.tags.length > 3 && (
        <span className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-[#b3b3b3] dark:text-[#b3b3b3] text-[10px] font-sans font-bold uppercase">
          +{bookmark.tags.length - 3}
        </span>
      )}
    </div>
  );

  const urlLink = (smallText: boolean) => (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "text-[#686868] dark:text-[#555555] hover:opacity-80 transition-opacity truncate block",
        smallText ? "text-[10px]" : "text-[12px] max-w-[300px]"
      )}
    >
      {bookmark.url}
    </a>
  );

  // List view: fixed height, all text always visible (no grow/shrink on hover)
  if (viewMode === "list") {
    return (
      <Card
        className="relative flex flex-row items-center gap-4 p-4 rounded-[8px] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-colors group bg-[#0f0f0f] dark:bg-[#0f0f0f] overflow-hidden"
        onAuxClick={openInBackground}
        onMouseDown={preventMiddleClickScroll}
      >
        {imageBlock(true)}
        <div className="relative flex-1 min-w-0 self-stretch min-h-[100px]">
          <div className="h-full min-h-[100px] overflow-hidden rounded-[8px] bg-[#151515] flex flex-col px-3 py-2">
            <CardTitle
              onClick={handleClick}
              onAuxClick={openInBackground}
              onMouseDown={preventMiddleClickScroll}
              className="text-[16px] cursor-pointer hover:opacity-80 transition-opacity line-clamp-1 shrink-0 p-0"
            >
              {bookmark.name}
            </CardTitle>
            <div className="mb-1 shrink-0">{urlLink(false)}</div>
            {bookmark.description && (
              <CardDescription className="text-[14px] line-clamp-2 text-[#686868] dark:text-[#555555] shrink-0 mb-1">
                {bookmark.description}
              </CardDescription>
            )}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="shrink-0 pt-1">{tagsBlock}</div>
            )}
          </div>
        </div>
        {actionButtons(false)}
      </Card>
    );
  }

  // Grid view: minimal — one dark box at bottom, height changes on hover only
  return (
    <Card
      className="group relative rounded-[8px] overflow-hidden border-2 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer p-0 bg-[#161616] dark:bg-[#161616] h-[380px] flex flex-col"
      onAuxClick={openInBackground}
      onMouseDown={preventMiddleClickScroll}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full h-[280px] shrink-0">
        {imageBlock(false)}
        <CardAction className="top-2 right-2 p-0 opacity-0 group-hover:opacity-100">
          {actionButtons(true)}
        </CardAction>
      </div>
      {/* Same dark colour as the info box so there’s no visible “lighter” strip */}
      <div className="flex-1 min-h-0" aria-hidden />
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[8px] bg-[#151515] flex flex-col p-4"
        style={{
          height: hovered ? 200 : 120,
          transition: "height 0.25s ease-out",
        }}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col pr-0 pt-4 pb-12">
          <div className="min-h-[1.5em] shrink-0 flex items-center">
            <CardTitle
              onClick={handleClick}
              onAuxClick={openInBackground}
              onMouseDown={preventMiddleClickScroll}
              className="text-[16px] font-semibold line-clamp-1 hover:opacity-80 transition-opacity cursor-pointer leading-normal"
            >
              {bookmark.name}
            </CardTitle>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
            {hovered && (
              <>
                <div className="mb-2 shrink-0">{urlLink(true)}</div>
                {bookmark.description && (
                  <CardDescription className="text-[12px] line-clamp-2 text-[#686868] dark:text-[#555555] shrink-0">
                    {bookmark.description}
                  </CardDescription>
                )}
              </>
            )}
          </div>
        </div>
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-2 bg-[#151515] rounded-b-[8px]">
            {tagsBlock}
          </div>
        )}
      </div>
    </Card>
  );
}
