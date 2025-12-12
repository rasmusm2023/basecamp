"use client";

import { Bookmark } from "../lib/types";
import { Link as LinkIcon, Trash, PencilSimple } from "./icons";

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
  const handleClick = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-[#161616] dark:bg-[#161616] border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[12px] hover:border-[rgba(255,255,255,0.2)] transition-colors group">
        {/* Image */}
        <div className="relative shrink-0 w-[120px] h-[80px] rounded-[8px] overflow-hidden">
          {bookmark.image ? (
            <img
              src={bookmark.image}
              alt={bookmark.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, hide it and show placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-[#282828] dark:bg-[#282828] flex items-center justify-center ${
              bookmark.image ? "hidden" : ""
            }`}
          >
            <LinkIcon
              size={32}
              weight="regular"
              className="text-text-secondary dark:text-text-light opacity-50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={handleClick}
            className="text-text-primary dark:text-white text-[16px] font-semibold font-sans mb-1 cursor-pointer hover:opacity-80 transition-opacity line-clamp-1"
          >
            {bookmark.name}
          </h3>
          {bookmark.description && (
            <p className="text-text-secondary dark:text-text-light text-[14px] line-clamp-2 mb-2">
              {bookmark.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary dark:text-text-light text-[12px] hover:opacity-80 transition-opacity truncate max-w-[300px]"
            >
              {bookmark.url}
            </a>
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-white text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
                {bookmark.tags.length > 3 && (
                  <span className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-white text-[10px]">
                    +{bookmark.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(bookmark)}
              className="p-2 bg-[#343434] dark:bg-[#343434] rounded-[8px] hover:opacity-80 transition-opacity"
              title="Edit bookmark"
            >
              <PencilSimple
                size={16}
                weight="regular"
                className="text-text-light dark:text-text-light"
              />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(bookmark)}
              className="p-2 bg-[#343434] dark:bg-[#343434] rounded-[8px] hover:opacity-80 transition-opacity"
              title="Delete bookmark"
            >
              <Trash
                size={16}
                weight="regular"
                className="text-text-light dark:text-text-light"
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative border-2 border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-[16px] overflow-hidden hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer">
      {/* Image */}
      <div
        onClick={handleClick}
        className="relative w-full h-[200px] overflow-hidden bg-[#282828] dark:bg-[#282828]"
      >
        {bookmark.image ? (
          <img
            src={bookmark.image}
            alt={bookmark.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // If image fails to load, hide it and show placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center ${
            bookmark.image ? "hidden" : ""
          }`}
        >
          <LinkIcon
            size={48}
            weight="regular"
            className="text-text-secondary dark:text-text-light opacity-50"
          />
        </div>
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-[8px] hover:bg-black/70 transition-colors"
              title="Edit bookmark"
            >
              <PencilSimple size={16} weight="regular" className="text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark);
              }}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-[8px] hover:bg-black/70 transition-colors"
              title="Delete bookmark"
            >
              <Trash size={16} weight="regular" className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gradient-to-t from-bg-dark dark:from-bg-dark to-[#151515] dark:to-[#151515]">
        <h3
          onClick={handleClick}
          className="text-text-primary dark:text-white text-[16px] font-semibold font-sans mb-2 line-clamp-1 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {bookmark.name}
        </h3>
        {bookmark.description && (
          <p className="text-text-secondary dark:text-text-light text-[12px] line-clamp-2 mb-3">
            {bookmark.description}
          </p>
        )}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-white text-[10px]"
              >
                {tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="px-2 py-1 bg-[#343434] dark:bg-[#343434] rounded-[4px] text-white text-[10px]">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-text-secondary dark:text-text-light text-[10px] hover:opacity-80 transition-opacity truncate block"
        >
          {bookmark.url}
        </a>
      </div>
    </div>
  );
}
