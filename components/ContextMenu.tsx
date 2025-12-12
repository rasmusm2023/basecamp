"use client";

import { useEffect, useRef } from "react";
import { Folder, PencilSimple, Settings, Trash, CaretRight } from "./icons";

export type ContextMenuItemType = "space" | "collection" | "folder";

interface ContextMenuItem {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    weight?: string;
    className?: string;
  }>;
  onClick: () => void;
  isDestructive?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  items,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off-screen
  const [adjustedX, adjustedY] = (() => {
    if (!menuRef.current) return [x, y];
    const rect = menuRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newX = x;
    let newY = y;

    if (x + rect.width > windowWidth) {
      newX = windowWidth - rect.width - 8;
    }
    if (y + rect.height > windowHeight) {
      newY = windowHeight - rect.height - 8;
    }

    return [newX, newY];
  })();

  return (
    <div
      ref={menuRef}
      className="bg-[#343434] border border-[#434343] border-solid relative rounded-[8px] z-50"
      style={{
        position: "fixed",
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        minWidth: "140px",
      }}
    >
      <div className="box-border content-stretch flex gap-[8px] items-start justify-center overflow-clip p-[8px] relative rounded-[inherit]">
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          {items.map((item, index) => {
            // Check if we need a divider before this item
            // Divider before "Rename" (index 1), before "Delete" (last destructive item)
            const needsDividerBefore =
              index > 0 &&
              (index === 1 || // Before "Rename" (second item)
                (item.isDestructive && !items[index - 1].isDestructive)); // Before first destructive item

            return (
              <div key={index} className="w-full">
                {needsDividerBefore && (
                  <div className="h-px bg-[rgba(255,255,255,0.15)] mb-[8px] mt-[8px]" />
                )}
                <button
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className="content-stretch flex items-center justify-between relative shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity p-0 bg-transparent border-none"
                >
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                    <div className="relative shrink-0 size-[16px]">
                      <item.icon
                        size={16}
                        weight="regular"
                        className={`${
                          item.isDestructive ? "text-[#ff7373]" : "text-white"
                        } transition-colors duration-300`}
                      />
                    </div>
                    <p
                      className={`font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-center text-nowrap whitespace-pre ${
                        item.isDestructive ? "text-[#ff7373]" : "text-white"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                  <div className="relative shrink-0 size-[16px]">
                    <CaretRight
                      size={16}
                      weight="regular"
                      className={`${
                        item.isDestructive ? "text-[#ff7373]" : "text-white"
                      } transition-colors duration-300 opacity-50`}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
