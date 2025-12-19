"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSpaces } from "../contexts/SpacesContext";
import { Collection, Folder } from "../lib/types";
import {
  Book,
  CaretRight,
  CaretDown,
  PencilSimple,
  Plus,
  ArrowsInSimple,
  Hide,
  FolderPlus,
  Folder,
  TextT,
  Settings,
  Trash,
  DotsThree,
  Check,
  CodeSimple,
  Planet,
} from "./icons";
import { useAuth } from "../contexts/AuthContext";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";

interface EditableItemProps {
  name: string;
  onUpdate: (newName: string) => Promise<void>;
  className?: string;
  textSize?: string;
  isEditing?: boolean;
  onEditChange?: (editing: boolean) => void;
}

function EditableItem({
  name,
  onUpdate,
  className = "",
  textSize = "text-[20px]",
  isEditing: externalIsEditing,
  onEditChange,
}: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editing =
    externalIsEditing !== undefined ? externalIsEditing : isEditing;
  const setEditing = (value: boolean) => {
    if (externalIsEditing === undefined) {
      setIsEditing(value);
    }
    onEditChange?.(value);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSubmit();
      }
    };

    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [editing, editValue]);

  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleSubmit = async () => {
    if (!editValue.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (editValue.trim() === name) {
      setEditing(false);
      setError(null);
      return;
    }

    try {
      await onUpdate(editValue.trim());
      setEditing(false);
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
      setEditing(false);
      setEditValue(name);
      setError(null);
    }
  };

  if (editing) {
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
          className={`${textSize} font-semibold font-sans bg-transparent border-none outline-none transition-colors duration-300 flex-1 ${
            className || "text-text-primary dark:text-white"
          }`}
          style={{ minWidth: "100px" }}
        />
        <PencilSimple
          size={18}
          weight="regular"
          className="text-text-primary dark:text-white opacity-50 transition-colors duration-300 shrink-0"
        />
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }

  const textColorClass = className && className.includes("text-") 
    ? className 
    : "text-text-primary dark:text-white opacity-50";
  
  return (
    <div className="flex items-center gap-[8px]">
      <span
        className={`${textSize} font-semibold font-sans transition-colors duration-300 ${textColorClass}`}
      >
        {name}
      </span>
    </div>
  );
}

interface CollectionItemProps {
  collection: Collection;
  spaceId: string;
  folders: Folder[];
  isExpanded: boolean;
  isActive: boolean;
  activeFolderId: string | null;
  onToggle: () => void;
  onSetActive?: () => void;
  onSetActiveFolder?: (folderId: string) => void;
  onUpdateCollection: (newName: string) => Promise<void>;
  onUpdateFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteCollection: () => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameCollection: () => void;
  onRenameFolder: (folderId: string) => void;
  editingCollectionId: string | null;
  editingFolderId: string | null;
  onEditChange: (collectionId: string | null, folderId: string | null) => void;
  onContextMenu: (
    e: React.MouseEvent,
    type: "collection" | "folder",
    id: string,
    parentId?: string
  ) => void;
  onIconClick: (
    e: React.MouseEvent,
    type: "collection" | "folder",
    id: string,
    parentId?: string
  ) => void;
  isMenuOpen: (type: "collection" | "folder", id: string) => boolean;
}

function CollectionItem({
  collection,
  spaceId,
  folders,
  isExpanded,
  isActive,
  activeFolderId,
  onToggle,
  onUpdateCollection,
  onUpdateFolder,
  onDeleteCollection,
  onDeleteFolder,
  onRenameCollection,
  onRenameFolder,
  editingCollectionId,
  editingFolderId,
  onEditChange,
  onContextMenu: handleContextMenu,
  onIconClick: handleIconClick,
  isMenuOpen,
  onSetActive,
  onSetActiveFolder,
}: CollectionItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  // Only show yellow if collection is active AND expanded AND has no active folder
  // If collection is not expanded, it should never be yellow
  const hasActiveFolder = activeFolderId !== null;
  const shouldShowYellow = isActive && isExpanded && !hasActiveFolder;

  const collectionTextColor = shouldShowYellow
    ? "text-[#FFFF31]"
    : "text-text-primary dark:text-white opacity-50";
  const collectionIconColor = shouldShowYellow
    ? "text-[#FFFF31]"
    : "text-text-primary dark:text-white opacity-50";

  const showCollectionIcon =
    isHovered || isMenuOpen("collection", collection.id);

  return (
    <div className="flex flex-col gap-0.5 items-start relative shrink-0 w-full">
      <div
        className={`flex items-center relative shrink-0 w-full rounded-tr-md rounded-br-md transition-all duration-200 group py-1.5 cursor-pointer ${
          isHovered || isMenuOpen("collection", collection.id) || isActive || isExpanded
            ? "bg-[rgba(255,255,255,0.05)]"
            : ""
        } ${shouldShowYellow ? "bg-accent-selected" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          // Don't trigger if clicking on input field (menu button already stops propagation)
          const target = e.target as HTMLElement;
          if (target.tagName === "INPUT") {
            return;
          }
          onToggle();
        }}
      >
        <div className={`absolute left-0 top-0 bottom-0 ${isExpanded ? 'w-[3px] bg-[#FFFF31]' : 'w-[3px] bg-[rgba(255,255,255,0.3)]'}`} />
        <div
          className="flex items-center relative shrink-0 flex-1 min-w-0"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="relative shrink-0 w-7 h-7 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            {isExpanded ? (
              <CaretDown
                size={16}
                weight="regular"
                className={`${collectionIconColor} transition-colors duration-200`}
              />
            ) : (
              <CaretRight
                size={16}
                weight="regular"
                className={`${collectionIconColor} transition-colors duration-200`}
              />
            )}
          </button>
          <div className="relative shrink-0 w-5 h-5 mr-2">
            <Book
              size={18}
              weight="regular"
              className={`${collectionIconColor} transition-colors duration-200`}
            />
          </div>
          <div
            className="flex-1 flex items-center min-w-0"
          >
            <EditableItem
              name={collection.name}
              onUpdate={onUpdateCollection}
              textSize="text-[15px]"
              className={collectionTextColor}
              isEditing={editingCollectionId === collection.id}
              onEditChange={(editing) =>
                onEditChange(editing ? collection.id : null, null)
              }
            />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick(e, "collection", collection.id);
          }}
          className={`relative shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 mr-3 ${
            isMenuOpen("collection", collection.id)
              ? "opacity-100 bg-[rgba(255,255,255,0.1)]"
              : ""
          }`}
        >
          <DotsThree
            size={20}
            weight="regular"
            className="text-text-secondary dark:text-text-light transition-all duration-200 group-hover:scale-125"
          />
        </button>
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-0 items-start relative shrink-0 w-full pl-7 mt-1">
          {folders.map((folder) => {
            const isFolderActive = activeFolderId === folder.id;
            const folderTextColor = isFolderActive
              ? "text-[#FFFF31]"
              : "text-text-primary dark:text-white opacity-50";

            const isFolderHovered = hoveredFolderId === folder.id;
            const showFolderIcon =
              isFolderHovered || isMenuOpen("folder", folder.id);

            return (
              <div
                key={folder.id}
                className={`flex items-center justify-between relative shrink-0 w-full rounded-tr-md rounded-br-md transition-all duration-200 group py-1.5 pl-3 cursor-pointer ${
                  isFolderHovered || isMenuOpen("folder", folder.id) || isFolderActive
                    ? "bg-[rgba(255,255,255,0.05)]"
                    : ""
                } ${isFolderActive ? "bg-accent-selected" : ""}`}
                onMouseEnter={() => setHoveredFolderId(folder.id)}
                onMouseLeave={() => setHoveredFolderId(null)}
                onClick={(e) => {
                  // Don't trigger if clicking on input field (menu button already stops propagation)
                  const target = e.target as HTMLElement;
                  if (target.tagName === "INPUT") {
                    return;
                  }
                  if (onSetActiveFolder) {
                    onSetActiveFolder(folder.id);
                  }
                }}
              >
                <div className={`absolute left-0 top-0 bottom-0 ${isFolderActive ? 'w-[1px] bg-[#FFFF31]' : 'w-[1px] bg-[rgba(255,255,255,0.3)]'}`} />
                <div
                  className="flex items-center gap-2 relative shrink-0 flex-1 min-w-0"
                >
                  <div className="relative shrink-0 w-4 h-4">
                    <Folder
                      size={16}
                      weight="regular"
                      className={`${folderTextColor} transition-colors duration-200`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <EditableItem
                      name={folder.name}
                      onUpdate={(newName) => {
                        onUpdateFolder(folder.id, newName);
                      }}
                      textSize="text-[14px]"
                      className={folderTextColor}
                      isEditing={editingFolderId === folder.id}
                      onEditChange={(editing) =>
                        onEditChange(null, editing ? folder.id : null)
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIconClick(e, "folder", folder.id, collection.id);
                  }}
                  className={`relative shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 mr-3 ${
                    isMenuOpen("folder", folder.id)
                      ? "opacity-100 bg-[rgba(255,255,255,0.1)]"
                      : ""
                  }`}
                >
                  <DotsThree
                    size={20}
                    weight="regular"
                    className="text-text-secondary dark:text-text-light transition-all duration-200 group-hover:scale-125"
                  />
                </button>
              </div>
            );
          })}
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
    updateCollection,
    updateFolder,
    deleteSpaceById,
    deleteCollectionById,
    deleteFolderById,
    createCollection,
    createFolder,
    createNewSpace,
    collections,
    foldersMap,
    activeCollectionId,
    activeFolderId,
    setActiveCollection,
    setActiveFolder,
  } = useSpaces();
  const [showSpacesDropdown, setShowSpacesDropdown] = useState(false);
  const spacesDropdownRef = useRef<HTMLDivElement>(null);
  const spacesButtonRef = useRef<HTMLButtonElement>(null);
  const spacesDropdownPortalRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set()
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "space" | "collection" | "folder";
    id: string;
    parentId?: string; // For folders, the collection ID
  } | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null
  );
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Auto-expand the first collection that has folders (only on initial load)
  const hasAutoExpandedRef = useRef(false);
  useEffect(() => {
    if (
      !hasAutoExpandedRef.current &&
      collections.length > 0 &&
      Object.keys(foldersMap).length > 0 &&
      expandedCollections.size === 0
    ) {
      const firstCollectionWithFolders = collections.find(
        (collection) => foldersMap[collection.id]?.length > 0
      );
      if (firstCollectionWithFolders) {
        setExpandedCollections((prev) =>
          new Set(prev).add(firstCollectionWithFolders.id)
        );
        hasAutoExpandedRef.current = true;
      }
    }
  }, [collections, foldersMap, expandedCollections]);

  // Expand collection when it becomes active (from breadcrumb clicks)
  useEffect(() => {
    if (activeCollectionId) {
      setExpandedCollections((prev) => {
        // Only expand if not already expanded
        if (!prev.has(activeCollectionId)) {
          return new Set(prev).add(activeCollectionId);
        }
        return prev;
      });
    }
    // Only run when activeCollectionId changes, not when expandedCollections changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollectionId]);

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // Clear active collection/folder state when it's collapsed
  useEffect(() => {
    if (activeCollectionId && !expandedCollections.has(activeCollectionId)) {
      setActiveCollection(null);
      setActiveFolder(null);
    }
  }, [
    expandedCollections,
    activeCollectionId,
    setActiveCollection,
    setActiveFolder,
  ]);

  // Calculate dropdown position when it opens and on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (showSpacesDropdown && spacesButtonRef.current) {
        const buttonRect = spacesButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.top,
          left: buttonRect.right + 8, // 8px = ml-2 (0.5rem)
        });
      }
    };

    if (showSpacesDropdown) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [showSpacesDropdown]);

  // Close spaces dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        spacesDropdownRef.current &&
        !spacesDropdownRef.current.contains(target) &&
        spacesButtonRef.current &&
        !spacesButtonRef.current.contains(target) &&
        spacesDropdownPortalRef.current &&
        !spacesDropdownPortalRef.current.contains(target)
      ) {
        setShowSpacesDropdown(false);
      }
    };

    if (showSpacesDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSpacesDropdown]);

  const handleCreateNewSpace = async () => {
    if (!user) return;
    try {
      const spaceName = `Space ${spaces.length + 1}`;
      await createNewSpace(spaceName);
      setShowSpacesDropdown(false);
    } catch (error) {
      console.error("Error creating new space:", error);
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    type: "space" | "collection" | "folder",
    id: string,
    parentId?: string
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      id,
      parentId,
    });
  };

  const handleIconClick = (
    e: React.MouseEvent,
    type: "collection" | "folder",
    id: string,
    parentId?: string
  ) => {
    const buttonElement = e.currentTarget as HTMLElement;
    const rect = buttonElement.getBoundingClientRect();
    setContextMenu({
      x: rect.right + 4, // Position menu close to the right of the button
      y: rect.top, // Position menu aligned with the top of the button
      type,
      id,
      parentId,
    });
  };

  const isMenuOpenFor = (
    type: "collection" | "folder",
    id: string
  ): boolean => {
    return (
      contextMenu !== null && contextMenu.type === type && contextMenu.id === id
    );
  };

  const handleUpdateSpace = async (newName: string) => {
    if (!currentSpaceId) return;
    await updateSpace(currentSpaceId, newName);
    setEditingSpaceId(null);
  };

  const handleUpdateCollection = async (
    collectionId: string,
    newName: string
  ) => {
    if (!currentSpaceId) return;
    await updateCollection(currentSpaceId, collectionId, newName);
    setEditingCollectionId(null);
  };

  const handleUpdateFolder = async (
    collectionId: string,
    folderId: string,
    newName: string
  ) => {
    if (!currentSpaceId) return;
    await updateFolder(currentSpaceId, collectionId, folderId, newName);
    setEditingFolderId(null);
  };

  const handleDeleteSpace = async () => {
    if (!contextMenu || contextMenu.type !== "space") return;
    await deleteSpaceById(contextMenu.id);
    setContextMenu(null);
  };

  const handleDeleteCollection = async () => {
    if (!contextMenu || contextMenu.type !== "collection" || !currentSpaceId)
      return;
    await deleteCollectionById(currentSpaceId, contextMenu.id);
    setContextMenu(null);
  };

  const handleDeleteFolder = async () => {
    if (
      !contextMenu ||
      contextMenu.type !== "folder" ||
      !currentSpaceId ||
      !contextMenu.parentId
    )
      return;
    await deleteFolderById(
      currentSpaceId,
      contextMenu.parentId,
      contextMenu.id
    );
    setContextMenu(null);
  };

  const handleRename = () => {
    if (!contextMenu) return;
    if (contextMenu.type === "space") {
      setEditingSpaceId(contextMenu.id);
    } else if (contextMenu.type === "collection") {
      setEditingCollectionId(contextMenu.id);
    } else if (contextMenu.type === "folder") {
      setEditingFolderId(contextMenu.id);
    }
    setContextMenu(null);
  };

  const handleNewCollection = async () => {
    if (!contextMenu || !currentSpaceId) return;

    // Generate a unique collection name
    let collectionName = "New collection";
    let counter = 1;
    const existingNames = collections.map((c) => c.name.toLowerCase());

    while (existingNames.includes(collectionName.toLowerCase())) {
      collectionName = `New collection ${counter}`;
      counter++;
    }

    try {
      const collectionId = await createCollection(
        currentSpaceId,
        collectionName
      );
      setEditingCollectionId(collectionId);
      setContextMenu(null);
    } catch (error) {
      console.error("Error creating collection:", error);
      // If it still fails, try with a timestamp-based name
      const timestampName = `New collection ${Date.now()}`;
      const collectionId = await createCollection(
        currentSpaceId,
        timestampName
      );
      setEditingCollectionId(collectionId);
      setContextMenu(null);
    }
  };

  const handleNewFolder = async () => {
    if (!contextMenu || !currentSpaceId) return;

    // Determine the collection ID based on context menu type
    let collectionId: string;
    if (contextMenu.type === "collection") {
      collectionId = contextMenu.id;
    } else if (contextMenu.type === "folder" && contextMenu.parentId) {
      // For folders, use the parent collection ID
      collectionId = contextMenu.parentId;
    } else {
      return;
    }

    // Generate a unique folder name
    const existingFolders = foldersMap[collectionId] || [];
    let folderName = "New folder";
    let counter = 1;
    const existingNames = existingFolders.map((f) => f.name.toLowerCase());

    while (existingNames.includes(folderName.toLowerCase())) {
      folderName = `New folder ${counter}`;
      counter++;
    }

    try {
      const folderId = await createFolder(
        currentSpaceId,
        collectionId,
        folderName
      );
      setEditingFolderId(folderId);
      setContextMenu(null);
    } catch (error) {
      console.error("Error creating folder:", error);
      // If it still fails, try with a timestamp-based name
      const timestampName = `New folder ${Date.now()}`;
      const folderId = await createFolder(
        currentSpaceId,
        collectionId,
        timestampName
      );
      setEditingFolderId(folderId);
      setContextMenu(null);
    }
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    if (!contextMenu) return [];

    const items: ContextMenuItem[] = [];

    if (contextMenu.type === "collection") {
      items.push(
        {
          label: "New collection",
          icon: FolderPlus,
          onClick: handleNewCollection,
        },
        {
          label: "Rename collection",
          icon: TextT,
          onClick: handleRename,
        },
        {
          label: "Collection settings",
          icon: Settings,
          onClick: () => {
            // TODO: Implement collection settings
            setContextMenu(null);
          },
        },
        {
          label: "Delete collection",
          icon: Trash,
          onClick: handleDeleteCollection,
          isDestructive: true,
        }
      );
    } else if (contextMenu.type === "folder") {
      items.push(
        {
          label: "New folder",
          icon: FolderPlus,
          onClick: handleNewFolder,
        },
        {
          label: "Rename folder",
          icon: TextT,
          onClick: handleRename,
        },
        {
          label: "Folder settings",
          icon: Settings,
          onClick: () => {
            // TODO: Implement folder settings
            setContextMenu(null);
          },
        },
        {
          label: "Delete folder",
          icon: Trash,
          onClick: handleDeleteFolder,
          isDestructive: true,
        }
      );
    } else if (contextMenu.type === "space") {
      items.push(
        {
          label: "Rename space",
          icon: TextT,
          onClick: handleRename,
        },
        {
          label: "Delete space",
          icon: Trash,
          onClick: handleDeleteSpace,
          isDestructive: true,
        }
      );
    }

    return items;
  };

  // Get user display name and email
  const displayName = userData?.displayName || user?.displayName || "User";
  const email = userData?.email || user?.email || "";

  return (
    <>
      <div className="bg-[#161616] border border-[rgba(255,255,255,0.1)] overflow-hidden relative rounded-lg w-[280px] shrink-0 flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>
        {/* Spaces Section - Dropdown style */}
        <div className="px-3 pt-4 pb-2 border-b border-[rgba(255,255,255,0.1)]">
          <h2 className="text-[11px] font-bold text-text-secondary dark:text-text-light uppercase tracking-wider mb-3">
            Spaces
          </h2>
          
          {/* Dropdown Menu */}
          <div className="relative" ref={spacesDropdownRef}>
            <button
              ref={spacesButtonRef}
              onClick={() => setShowSpacesDropdown(!showSpacesDropdown)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)] transition-colors ${
                showSpacesDropdown ? "bg-[rgba(255,255,255,0.05)]" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                  <Planet size={28} weight="regular" className="text-text-secondary dark:text-text-light" />
                </div>
                <span>{currentSpace?.name || "Select Space"}</span>
              </div>
              <div className="relative w-4 h-4 flex items-center justify-center">
                <CodeSimple
                  size={16}
                  weight="regular"
                  className={`text-text-secondary dark:text-text-light transition-all duration-200 absolute ${
                    showSpacesDropdown ? "opacity-0 scale-90 rotate-180" : "opacity-100 scale-100 rotate-90"
                  }`}
                />
                <CaretRight
                  size={16}
                  weight="regular"
                  className={`text-text-secondary dark:text-text-light transition-all duration-200 absolute ${
                    showSpacesDropdown ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Content - Rendered via Portal */}
            {showSpacesDropdown && dropdownPosition && typeof window !== 'undefined' && createPortal(
              <div 
                ref={spacesDropdownPortalRef}
                className="fixed bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-md shadow-lg z-[100] overflow-hidden min-w-[280px]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                }}
              >
                <div className="py-1">
                  {/* Spaces Label */}
                  <div className="px-3 py-2 text-[11px] font-semibold text-text-secondary dark:text-text-light opacity-60 pointer-events-none">
                    Spaces
                  </div>
                  <div className="h-px bg-[rgba(255,255,255,0.1)] mb-1" />
                  
                  {spaces.map((space) => (
                    <button
                      key={space.id}
                      onClick={() => {
                        setCurrentSpaceId(space.id);
                        setShowSpacesDropdown(false);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContextMenu(e, "space", space.id);
                        setShowSpacesDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center justify-between ${
                        space.id === currentSpaceId
                          ? "bg-accent-selected text-accent-primary"
                          : "text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                          <Planet size={18} weight="regular" className="text-text-secondary dark:text-text-light" />
                        </div>
                        <span>{space.name}</span>
                      </div>
                      {/* CURRENT Pill - only for active space */}
                      {space.id === currentSpaceId && (
                        <span className="px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.3)] text-[10px] font-semibold text-text-secondary dark:text-text-light">
                          CURRENT
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="h-px bg-[rgba(255,255,255,0.1)] my-1" />
                  {currentSpace && (
                    <button
                      onClick={() => {
                        setEditingSpaceId(currentSpace.id);
                        setShowSpacesDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] font-semibold text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2"
                    >
                      <PencilSimple size={16} weight="regular" />
                      <span>Edit {currentSpace.name}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCreateNewSpace}
                    className="w-full text-left px-3 py-2 text-[13px] font-semibold text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} weight="regular" />
                    <span>Add space</span>
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 py-2 flex gap-2 border-b border-[rgba(255,255,255,0.1)]">
          <button
            onClick={() => {
              setExpandedCollections(new Set());
              setActiveCollection(null);
              setActiveFolder(null);
            }}
            className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-[11px] font-semibold text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <ArrowsInSimple size={16} weight="regular" />
            Collapse
          </button>
          <button className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-[11px] font-semibold text-text-secondary dark:text-text-light hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Hide size={16} weight="regular" />
            Hide
          </button>
        </div>

        {/* Collection Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-1">
            {collections.map((collection) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                spaceId={currentSpaceId || ""}
                folders={foldersMap[collection.id] || []}
                isExpanded={expandedCollections.has(collection.id)}
                isActive={activeCollectionId === collection.id}
                activeFolderId={activeFolderId}
                onToggle={() => {
                  const wasExpanded = expandedCollections.has(collection.id);
                  toggleCollection(collection.id);
                  if (!wasExpanded) {
                    setActiveCollection(collection.id);
                    setActiveFolder(null);
                  }
                }}
                onSetActive={() => setActiveCollection(collection.id)}
                onSetActiveFolder={(folderId) => {
                  setActiveFolder(folderId);
                  setActiveCollection(collection.id);
                }}
                onUpdateCollection={(newName) =>
                  handleUpdateCollection(collection.id, newName)
                }
                onUpdateFolder={(folderId, newName) =>
                  handleUpdateFolder(collection.id, folderId, newName)
                }
                onDeleteCollection={handleDeleteCollection}
                onDeleteFolder={(folderId) => {
                  if (!currentSpaceId) return;
                  deleteFolderById(currentSpaceId, collection.id, folderId);
                }}
                onRenameCollection={() => setEditingCollectionId(collection.id)}
                onRenameFolder={(folderId) => setEditingFolderId(folderId)}
                editingCollectionId={editingCollectionId}
                editingFolderId={editingFolderId}
                onEditChange={(collectionId, folderId) => {
                  setEditingCollectionId(collectionId);
                  setEditingFolderId(folderId);
                }}
                onContextMenu={handleContextMenu}
                onIconClick={handleIconClick}
                isMenuOpen={isMenuOpenFor}
              />
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex gap-3 items-center">
            <div className="relative rounded-md shrink-0 size-8 bg-bg-dark dark:bg-white flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="absolute inset-0 object-cover pointer-events-none rounded-md size-full"
                />
              ) : (
                <p className="text-text-light dark:text-[#0d0d0d] text-[11px] font-semibold font-sans">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start justify-center leading-tight flex-1 min-w-0">
              <p className="text-text-secondary dark:text-text-light text-[12px] font-semibold font-sans truncate w-full">
                {displayName}
              </p>
              <p className="text-text-tertiary text-[11px] font-medium font-sans truncate w-full">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
