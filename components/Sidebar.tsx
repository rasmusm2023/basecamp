"use client";

import { useState, useRef, useEffect } from "react";
import { useSpaces } from "../contexts/SpacesContext";
import { Folder, SubFolder } from "../lib/types";
import {
  Book,
  CaretRight,
  CaretDown,
  PencilSimple,
  Plus,
  ArrowsInSimple,
  Hide,
} from "./icons";
import { useAuth } from "../contexts/AuthContext";

interface EditableItemProps {
  name: string;
  onUpdate: (newName: string) => Promise<void>;
  className?: string;
  textSize?: string;
}

function EditableItem({
  name,
  onUpdate,
  className = "",
  textSize = "text-[20px]",
}: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSubmit();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isEditing, editValue]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(name);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!editValue.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (editValue.trim() === name) {
      setIsEditing(false);
      setError(null);
      return;
    }

    try {
      await onUpdate(editValue.trim());
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update name");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(name);
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center gap-[8px] ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${textSize} font-medium font-sans bg-transparent border-none outline-none transition-colors duration-300 flex-1 ${
            className || "text-text-primary dark:text-white"
          }`}
          style={{ minWidth: "100px" }}
        />
        <PencilSimple
          size={16}
          weight="regular"
          className="text-text-primary dark:text-white opacity-50 transition-colors duration-300 shrink-0"
        />
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`flex items-center gap-[8px] cursor-pointer ${className}`}
    >
      <span
        className={`${textSize} font-medium font-sans transition-colors duration-300 ${
          className || "text-text-primary dark:text-white"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

interface FolderItemProps {
  folder: Folder;
  spaceId: string;
  subFolders: SubFolder[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateFolder: (newName: string) => Promise<void>;
  onUpdateSubFolder: (subFolderId: string, newName: string) => Promise<void>;
}

function FolderItem({
  folder,
  spaceId,
  subFolders,
  isExpanded,
  onToggle,
  onUpdateFolder,
  onUpdateSubFolder,
}: FolderItemProps) {
  const { updateSubFolder } = useSpaces();

  return (
    <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex gap-[4px] items-end relative shrink-0">
        <button
          onClick={onToggle}
          className="relative shrink-0 w-[24px] h-[24px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          {isExpanded ? (
            <CaretDown
              size={16}
              weight="regular"
              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
            />
          ) : (
            <CaretRight
              size={16}
              weight="regular"
              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
            />
          )}
        </button>
        <div className="relative shrink-0 w-[24px] h-[24px]">
          <Book
            size={24}
            weight="regular"
            className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
          />
        </div>
        <EditableItem
          name={folder.name}
          onUpdate={onUpdateFolder}
          textSize="text-[20px]"
        />
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full pl-[28px]">
          {subFolders.map((subFolder) => (
            <div
              key={subFolder.id}
              className="flex items-center justify-between relative shrink-0 w-full"
            >
              <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-[235px]">
                <EditableItem
                  name={`— ${subFolder.name}`}
                  onUpdate={(newName) => {
                    // Remove the "— " prefix if present
                    const cleanName = newName.replace(/^—\s*/, "");
                    onUpdateSubFolder(subFolder.id, cleanName);
                  }}
                  textSize="text-[14px]"
                  className="text-accent-primary"
                />
              </div>
              <div className="absolute left-[235px] top-[-3px] w-[24px] h-[19px] flex items-center justify-center">
                <div className="bg-accent-primary rounded-full size-[8px]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, userData } = useAuth();
  const {
    spaces,
    currentSpaceId,
    setCurrentSpaceId,
    loading,
    updateSpace,
    updateFolder,
    updateSubFolder,
    folders,
    subFoldersMap,
  } = useSpaces();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Auto-expand the first folder that has subfolders
  useEffect(() => {
    if (folders.length > 0 && Object.keys(subFoldersMap).length > 0) {
      const firstFolderWithSubfolders = folders.find(
        (folder) => subFoldersMap[folder.id]?.length > 0
      );
      if (firstFolderWithSubfolders) {
        setExpandedFolders((prev) => new Set(prev).add(firstFolderWithSubfolders.id));
      }
    }
  }, [folders, subFoldersMap]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
    // Subfolders are already loaded via real-time listeners, no need to fetch
  };

  const handleUpdateSpace = async (newName: string) => {
    if (!currentSpaceId) return;
    await updateSpace(currentSpaceId, newName);
  };

  const handleUpdateFolder = async (folderId: string, newName: string) => {
    if (!currentSpaceId) return;
    await updateFolder(currentSpaceId, folderId, newName);
  };

  const handleUpdateSubFolder = async (
    folderId: string,
    subFolderId: string,
    newName: string
  ) => {
    if (!currentSpaceId) return;
    await updateSubFolder(currentSpaceId, folderId, subFolderId, newName);
  };

  // Get user display name and email
  const displayName = userData?.displayName || user?.displayName || "User";
  const email = userData?.email || user?.email || "";

  if (loading) {
    return (
      <div className="bg-[#161616] border-[#3b3b3b] border-[0px_1px_1px] border-solid overflow-hidden relative rounded-[16px] w-[280px] shrink-0 h-[973px]">
        <p className="text-text-primary dark:text-white p-[16px]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border-[#3b3b3b] border-[0px_1px_1px] border-solid overflow-hidden relative rounded-[16px] w-[280px] shrink-0 h-[973px]">
      {/* Space Header Tabs */}
      <div className="absolute bg-[#282828] flex gap-[8px] items-center left-[-1px] rounded-tl-[16px] rounded-tr-[16px] top-0 w-[280px]">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`box-border flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
              space.id === currentSpaceId
                ? "bg-[#f2f2f2] dark:bg-[#f2f2f2]"
                : ""
            }`}
            onClick={() => setCurrentSpaceId(space.id)}
          >
            <p
              className={`text-[12px] font-semibold font-sans transition-colors duration-300 ${
                space.id === currentSpaceId
                  ? "text-[#0d0d0d] dark:text-[#0d0d0d]"
                  : "text-text-primary dark:text-white opacity-50"
              }`}
            >
              {space.name}
            </p>
          </div>
        ))}
        <div className="box-border flex gap-[4px] items-center justify-center px-[16px] py-[8px] relative rounded-[16px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="relative shrink-0 w-[16px] h-[16px]">
            <Plus
              size={16}
              weight="regular"
              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
            />
          </div>
          <p className="text-text-primary dark:text-white text-[12px] font-semibold font-sans opacity-50 transition-colors duration-300">
            Create new space
          </p>
        </div>
      </div>

      {/* Collapse Folders Button */}
      <div className="absolute bg-[#282828] box-border flex gap-[8px] items-center justify-center left-[15px] overflow-hidden p-[8px] rounded-[16px] top-[94px] w-[120px] cursor-pointer hover:opacity-80 transition-opacity">
        <div className="relative shrink-0 w-[16px] h-[16px]">
          <ArrowsInSimple
            size={16}
            weight="regular"
            className="text-text-primary dark:text-white transition-colors duration-300"
          />
        </div>
        <p className="text-text-primary dark:text-white text-[10px] font-medium font-sans transition-colors duration-300">
          Collapse folders
        </p>
      </div>

      {/* Hide Sidebar Button */}
      <div className="absolute bg-[#282828] box-border flex gap-[8px] items-center justify-center left-[143px] overflow-hidden p-[8px] rounded-[16px] top-[94px] w-[120px] cursor-pointer hover:opacity-80 transition-opacity">
        <div className="relative shrink-0 w-[16px] h-[16px]">
          <Hide
            size={16}
            weight="regular"
            className="text-text-primary dark:text-white transition-colors duration-300"
          />
        </div>
        <p className="text-text-primary dark:text-white text-[10px] font-medium font-sans transition-colors duration-300">
          Hide sidebar
        </p>
      </div>

      {/* Space Label */}
      <p className="absolute text-text-primary dark:text-white text-[10px] font-semibold font-sans opacity-50 left-[15px] top-[44px] transition-colors duration-300">
        Space
      </p>

      {/* Space Title */}
      {currentSpace && (
        <div className="absolute left-[15px] top-[54px]">
          <EditableItem
            name={currentSpace.name}
            onUpdate={handleUpdateSpace}
            textSize="text-[24px]"
          />
        </div>
      )}

      {/* Divider */}
      <div className="absolute h-px bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(255,255,255,0.15)] left-[15px] top-[138px] w-[248px]" />

      {/* Folder Navigation */}
      <div className="absolute flex flex-col gap-[8px] items-start left-[15px] top-[149px] w-[259px]">
        {folders.map((folder, index) => (
          <div
            key={folder.id}
            className="flex flex-col gap-[16px] items-start relative shrink-0 w-full"
          >
            <FolderItem
              folder={folder}
              spaceId={currentSpaceId || ""}
              subFolders={subFoldersMap[folder.id] || []}
              isExpanded={expandedFolders.has(folder.id)}
              onToggle={() => toggleFolder(folder.id)}
              onUpdateFolder={(newName) =>
                handleUpdateFolder(folder.id, newName)
              }
              onUpdateSubFolder={(subFolderId, newName) =>
                handleUpdateSubFolder(folder.id, subFolderId, newName)
              }
            />
            {index < folders.length - 1 && (
              <div className="h-px bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(255,255,255,0.15)] relative shrink-0 w-[248px]" />
            )}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="absolute bg-black liquid-glass-border box-border flex gap-[8px] items-start left-[15px] p-[16px] rounded-[16px] bottom-[15px] w-[248px]">
        <div className="relative rounded-[8px] shrink-0 size-[32px] bg-bg-dark dark:bg-white flex items-center justify-center overflow-hidden">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="absolute inset-0 object-cover pointer-events-none rounded-[8px] size-full"
            />
          ) : (
            <p className="text-text-light dark:text-[#0d0d0d] text-[12px] font-medium font-sans">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start justify-center leading-normal relative shrink-0 text-[#f2f2f2] text-nowrap">
          <p className="text-[#f2f2f2] text-[12px] font-medium font-sans">
            {displayName}
          </p>
          <p className="text-[#f2f2f2] text-[10px] font-light font-sans opacity-70">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}
