"use client";

import { useState, useRef, useEffect } from "react";
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
  TextT,
  Settings,
  Trash,
  DotsThree,
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
    <div className={`flex items-center gap-[8px] ${className}`}>
      <span
        className={`${textSize} font-medium font-sans transition-colors duration-300 ${
          className || "text-text-primary dark:text-white opacity-50"
        }`}
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
    <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div
        className={`flex gap-[4px] items-center relative shrink-0 w-full rounded-[4px] transition-all duration-300 ${
          isHovered || isMenuOpen("collection", collection.id)
            ? "bg-bg-primary dark:bg-[rgba(255,255,255,0.1)]"
            : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex gap-[4px] items-center relative shrink-0 flex-1 cursor-pointer"
          onClick={(e) => {
            // Don't toggle if clicking on the editable input
            if ((e.target as HTMLElement).tagName === "INPUT") {
              return;
            }
            onToggle();
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="relative shrink-0 w-[24px] h-[24px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            {isExpanded ? (
              <CaretDown
                size={16}
                weight="regular"
                className={`${collectionIconColor} transition-colors duration-300`}
              />
            ) : (
              <CaretRight
                size={16}
                weight="regular"
                className={`${collectionIconColor} transition-colors duration-300`}
              />
            )}
          </button>
          <div className="relative shrink-0 w-[24px] h-[24px]">
            <Book
              size={24}
              weight="regular"
              className={`${collectionIconColor} transition-colors duration-300`}
            />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="flex-1 flex items-center cursor-pointer"
          >
            <EditableItem
              name={collection.name}
              onUpdate={onUpdateCollection}
              textSize="text-[20px]"
              className={collectionTextColor}
              isEditing={editingCollectionId === collection.id}
              onEditChange={(editing) =>
                onEditChange(editing ? collection.id : null, null)
              }
            />
          </div>
        </div>
        {showCollectionIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick(e, "collection", collection.id);
            }}
            className={`relative shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-all duration-300 ${
              isMenuOpen("collection", collection.id)
                ? "bg-bg-primary dark:bg-[rgba(255,255,255,0.1)]"
                : "hover:bg-bg-primary dark:hover:bg-[rgba(255,255,255,0.1)]"
            }`}
          >
            <DotsThree
              size={20}
              weight="regular"
              className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
            />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full pl-[28px]">
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
                className={`flex items-center justify-between relative shrink-0 w-full rounded-[4px] transition-all duration-300 ${
                  isFolderHovered || isMenuOpen("folder", folder.id)
                    ? "bg-bg-primary dark:bg-[rgba(255,255,255,0.1)]"
                    : ""
                }`}
                onMouseEnter={() => setHoveredFolderId(folder.id)}
                onMouseLeave={() => setHoveredFolderId(null)}
              >
                <div
                  className="flex items-center gap-[4px] relative shrink-0 flex-1 cursor-pointer"
                  onClick={(e) => {
                    // Don't toggle if clicking on the editable input
                    if ((e.target as HTMLElement).tagName === "INPUT") {
                      return;
                    }
                    // Set folder as active when clicked
                    if (onSetActiveFolder) {
                      onSetActiveFolder(folder.id);
                    }
                  }}
                >
                  <div className="flex flex-col gap-[8px] items-start relative shrink-0 flex-1">
                    <EditableItem
                      name={`— ${folder.name}`}
                      onUpdate={(newName) => {
                        const cleanName = newName.replace(/^—\s*/, "");
                        onUpdateFolder(folder.id, cleanName);
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
                {showFolderIcon && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleIconClick(e, "folder", folder.id, collection.id);
                    }}
                    className={`relative shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-all duration-300 ${
                      isMenuOpen("folder", folder.id)
                        ? "bg-bg-primary dark:bg-[rgba(255,255,255,0.1)]"
                        : "hover:bg-bg-primary dark:hover:bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <DotsThree
                      size={20}
                      weight="regular"
                      className="text-text-primary dark:text-white opacity-50 transition-colors duration-300"
                    />
                  </button>
                )}
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
    collections,
    foldersMap,
    activeCollectionId,
    activeFolderId,
    setActiveCollection,
    setActiveFolder,
  } = useSpaces();
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
    if (!contextMenu || !currentSpaceId || contextMenu.type !== "collection")
      return;

    // Generate a unique folder name
    const existingFolders = foldersMap[contextMenu.id] || [];
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
        contextMenu.id,
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
        contextMenu.id,
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
          label: "New folder",
          icon: FolderPlus,
          onClick: handleNewFolder,
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
      <div className="bg-[#161616] border-[#3b3b3b] border-[0px_1px_1px] border-solid overflow-hidden relative rounded-[16px] w-[280px] shrink-0 h-[973px]">
        {/* Space Header Tabs */}
        <div className="absolute bg-[#282828] flex gap-[8px] items-center -left-px rounded-tl-[16px] rounded-tr-[16px] top-0 w-[280px]">
          {spaces.map((space) => (
            <div
              key={space.id}
              className={`box-border flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
                space.id === currentSpaceId
                  ? "bg-[#f2f2f2] dark:bg-[#f2f2f2]"
                  : ""
              }`}
              onClick={() => setCurrentSpaceId(space.id)}
              onContextMenu={(e) => handleContextMenu(e, "space", space.id)}
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

        {/* Collapse Collections Button */}
        <div
          onClick={() => {
            setExpandedCollections(new Set());
            // Clear active collection/folder when collapsing all
            setActiveCollection(null);
            setActiveFolder(null);
          }}
          className="absolute bg-[#282828] box-border flex gap-[8px] items-center justify-center left-[15px] overflow-hidden p-[8px] rounded-[16px] top-[94px] w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
        >
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
          <div
            className="absolute left-[15px] top-[54px]"
            onContextMenu={(e) =>
              handleContextMenu(e, "space", currentSpace.id)
            }
          >
            <EditableItem
              name={currentSpace.name}
              onUpdate={handleUpdateSpace}
              textSize="text-[24px]"
              isEditing={editingSpaceId === currentSpace.id}
              onEditChange={(editing) =>
                setEditingSpaceId(editing ? currentSpace.id : null)
              }
            />
          </div>
        )}

        {/* Divider */}
        <div className="absolute h-px bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(255,255,255,0.1)] left-[15px] top-[138px] w-[248px]" />

        {/* Collection Navigation */}
        <div className="absolute flex flex-col gap-[8px] items-start left-[15px] top-[149px] w-[259px]">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className="flex flex-col gap-[16px] items-start relative shrink-0 w-full"
            >
              <CollectionItem
                collection={collection}
                spaceId={currentSpaceId || ""}
                folders={foldersMap[collection.id] || []}
                isExpanded={expandedCollections.has(collection.id)}
                isActive={activeCollectionId === collection.id}
                activeFolderId={activeFolderId}
                onToggle={() => {
                  const wasExpanded = expandedCollections.has(collection.id);
                  toggleCollection(collection.id);
                  // Only set as active if expanding, not collapsing
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
              {index < collections.length - 1 && (
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
