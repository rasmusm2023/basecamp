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
  FolderPlus,
  TextT,
  Settings,
  Trash,
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

interface FolderItemProps {
  folder: Folder;
  spaceId: string;
  subFolders: SubFolder[];
  isExpanded: boolean;
  isActive: boolean;
  activeSubFolderId: string | null;
  onToggle: () => void;
  onSetActive?: () => void;
  onSetActiveSubFolder?: (subFolderId: string) => void;
  onUpdateFolder: (newName: string) => Promise<void>;
  onUpdateSubFolder: (subFolderId: string, newName: string) => Promise<void>;
  onDeleteFolder: () => Promise<void>;
  onDeleteSubFolder: (subFolderId: string) => Promise<void>;
  onRenameFolder: () => void;
  onRenameSubFolder: (subFolderId: string) => void;
  editingFolderId: string | null;
  editingSubFolderId: string | null;
  onEditChange: (folderId: string | null, subFolderId: string | null) => void;
  onContextMenu: (
    e: React.MouseEvent,
    type: "folder" | "subfolder",
    id: string,
    parentId?: string
  ) => void;
}

function FolderItem({
  folder,
  spaceId,
  subFolders,
  isExpanded,
  isActive,
  activeSubFolderId,
  onToggle,
  onUpdateFolder,
  onUpdateSubFolder,
  onDeleteFolder,
  onDeleteSubFolder,
  onRenameFolder,
  onRenameSubFolder,
  editingFolderId,
  editingSubFolderId,
  onEditChange,
  onContextMenu: handleContextMenu,
  onSetActive,
  onSetActiveSubFolder,
}: FolderItemProps) {
  // Only show yellow if folder is active AND expanded AND has no active subfolder
  // If folder is not expanded, it should never be yellow
  const hasActiveSubFolder = activeSubFolderId !== null;
  const shouldShowYellow = isActive && isExpanded && !hasActiveSubFolder;
  
  const folderTextColor = shouldShowYellow
    ? "text-[#FFFF31]"
    : "text-text-primary dark:text-white opacity-50";
  const folderIconColor = shouldShowYellow
    ? "text-[#FFFF31]"
    : "text-text-primary dark:text-white opacity-50";

  return (
    <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex gap-[4px] items-end relative shrink-0 w-full">
        <div
          className="flex gap-[4px] items-end relative shrink-0 flex-1 cursor-pointer"
          onClick={(e) => {
            // Don't toggle if clicking on the editable input
            if ((e.target as HTMLElement).tagName === 'INPUT') {
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
                className={`${folderIconColor} transition-colors duration-300`}
              />
            ) : (
              <CaretRight
                size={16}
                weight="regular"
                className={`${folderIconColor} transition-colors duration-300`}
              />
            )}
          </button>
          <div className="relative shrink-0 w-[24px] h-[24px]">
            <Book
              size={24}
              weight="regular"
              className={`${folderIconColor} transition-colors duration-300`}
            />
          </div>
          <div
            onContextMenu={(e) => {
              e.stopPropagation();
              handleContextMenu(e, "folder", folder.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="flex-1 flex items-center cursor-pointer"
          >
            <EditableItem
              name={folder.name}
              onUpdate={onUpdateFolder}
              textSize="text-[20px]"
              className={folderTextColor}
              isEditing={editingFolderId === folder.id}
              onEditChange={(editing) =>
                onEditChange(editing ? folder.id : null, null)
              }
            />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full pl-[28px]">
          {subFolders.map((subFolder) => {
            const isSubFolderActive = activeSubFolderId === subFolder.id;
            const subFolderTextColor = isSubFolderActive
              ? "text-[#FFFF31]"
              : "text-text-primary dark:text-white opacity-50";
            
            return (
              <div
                key={subFolder.id}
                className="flex items-center justify-between relative shrink-0 w-full"
              >
                <div
                  className="flex items-center gap-[4px] relative shrink-0 flex-1 cursor-pointer"
                  onClick={(e) => {
                    // Don't toggle if clicking on the editable input
                    if ((e.target as HTMLElement).tagName === 'INPUT') {
                      return;
                    }
                    // Set subfolder as active when clicked
                    if (onSetActiveSubFolder) {
                      onSetActiveSubFolder(subFolder.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContextMenu(e, "subfolder", subFolder.id, folder.id);
                  }}
                >
                  <div className="flex flex-col gap-[8px] items-start relative shrink-0 flex-1">
                    <EditableItem
                      name={`— ${subFolder.name}`}
                      onUpdate={(newName) => {
                        const cleanName = newName.replace(/^—\s*/, "");
                        onUpdateSubFolder(subFolder.id, cleanName);
                      }}
                      textSize="text-[14px]"
                      className={subFolderTextColor}
                      isEditing={editingSubFolderId === subFolder.id}
                      onEditChange={(editing) =>
                        onEditChange(null, editing ? subFolder.id : null)
                      }
                    />
                  </div>
                </div>
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
    updateFolder,
    updateSubFolder,
    deleteSpaceById,
    deleteFolderById,
    deleteSubFolderById,
    createFolder,
    createSubFolder,
    folders,
    subFoldersMap,
    activeFolderId,
    activeSubFolderId,
    setActiveFolder,
    setActiveSubFolder,
  } = useSpaces();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "space" | "folder" | "subfolder";
    id: string;
    parentId?: string; // For subfolders, the folder ID
  } | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSubFolderId, setEditingSubFolderId] = useState<string | null>(
    null
  );
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Auto-expand the first folder that has subfolders (only on initial load)
  const hasAutoExpandedRef = useRef(false);
  useEffect(() => {
    if (
      !hasAutoExpandedRef.current &&
      folders.length > 0 &&
      Object.keys(subFoldersMap).length > 0 &&
      expandedFolders.size === 0
    ) {
      const firstFolderWithSubfolders = folders.find(
        (folder) => subFoldersMap[folder.id]?.length > 0
      );
      if (firstFolderWithSubfolders) {
        setExpandedFolders((prev) =>
          new Set(prev).add(firstFolderWithSubfolders.id)
        );
        hasAutoExpandedRef.current = true;
      }
    }
  }, [folders, subFoldersMap, expandedFolders]);

  // Expand folder when it becomes active (from breadcrumb clicks)
  useEffect(() => {
    if (activeFolderId) {
      setExpandedFolders((prev) => {
        // Only expand if not already expanded
        if (!prev.has(activeFolderId)) {
          return new Set(prev).add(activeFolderId);
        }
        return prev;
      });
    }
    // Only run when activeFolderId changes, not when expandedFolders changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolderId]);

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
  };

  // Clear active folder state when it's collapsed
  useEffect(() => {
    if (activeFolderId && !expandedFolders.has(activeFolderId)) {
      setActiveFolder(null);
      setActiveSubFolder(null);
    }
  }, [expandedFolders, activeFolderId, setActiveFolder, setActiveSubFolder]);

  const handleContextMenu = (
    e: React.MouseEvent,
    type: "space" | "folder" | "subfolder",
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

  const handleUpdateSpace = async (newName: string) => {
    if (!currentSpaceId) return;
    await updateSpace(currentSpaceId, newName);
    setEditingSpaceId(null);
  };

  const handleUpdateFolder = async (folderId: string, newName: string) => {
    if (!currentSpaceId) return;
    await updateFolder(currentSpaceId, folderId, newName);
    setEditingFolderId(null);
  };

  const handleUpdateSubFolder = async (
    folderId: string,
    subFolderId: string,
    newName: string
  ) => {
    if (!currentSpaceId) return;
    await updateSubFolder(currentSpaceId, folderId, subFolderId, newName);
    setEditingSubFolderId(null);
  };

  const handleDeleteSpace = async () => {
    if (!contextMenu || contextMenu.type !== "space") return;
    await deleteSpaceById(contextMenu.id);
    setContextMenu(null);
  };

  const handleDeleteFolder = async () => {
    if (!contextMenu || contextMenu.type !== "folder" || !currentSpaceId)
      return;
    await deleteFolderById(currentSpaceId, contextMenu.id);
    setContextMenu(null);
  };

  const handleDeleteSubFolder = async () => {
    if (
      !contextMenu ||
      contextMenu.type !== "subfolder" ||
      !currentSpaceId ||
      !contextMenu.parentId
    )
      return;
    await deleteSubFolderById(
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
    } else if (contextMenu.type === "folder") {
      setEditingFolderId(contextMenu.id);
    } else if (contextMenu.type === "subfolder") {
      setEditingSubFolderId(contextMenu.id);
    }
    setContextMenu(null);
  };

  const handleNewFolder = async () => {
    if (!contextMenu || !currentSpaceId) return;

    // Generate a unique collection name
    let folderName = "New collection";
    let counter = 1;
    const existingNames = folders.map((f) => f.name.toLowerCase());

    while (existingNames.includes(folderName.toLowerCase())) {
      folderName = `New collection ${counter}`;
      counter++;
    }

    try {
      const folderId = await createFolder(currentSpaceId, folderName);
      setEditingFolderId(folderId);
      setContextMenu(null);
    } catch (error) {
      console.error("Error creating folder:", error);
      // If it still fails, try with a timestamp-based name
      const timestampName = `New collection ${Date.now()}`;
      const folderId = await createFolder(currentSpaceId, timestampName);
      setEditingFolderId(folderId);
      setContextMenu(null);
    }
  };

  const handleNewSubFolder = async () => {
    if (!contextMenu || !currentSpaceId || contextMenu.type !== "folder")
      return;

    // Generate a unique folder name
    const existingSubFolders = subFoldersMap[contextMenu.id] || [];
    let subFolderName = "New folder";
    let counter = 1;
    const existingNames = existingSubFolders.map((sf) => sf.name.toLowerCase());

    while (existingNames.includes(subFolderName.toLowerCase())) {
      subFolderName = `New folder ${counter}`;
      counter++;
    }

    try {
      const subFolderId = await createSubFolder(
        currentSpaceId,
        contextMenu.id,
        subFolderName
      );
      setEditingSubFolderId(subFolderId);
      setContextMenu(null);
    } catch (error) {
      console.error("Error creating sub-folder:", error);
      // If it still fails, try with a timestamp-based name
      const timestampName = `New folder ${Date.now()}`;
      const subFolderId = await createSubFolder(
        currentSpaceId,
        contextMenu.id,
        timestampName
      );
      setEditingSubFolderId(subFolderId);
      setContextMenu(null);
    }
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    if (!contextMenu) return [];

    const items: ContextMenuItem[] = [];

    if (contextMenu.type === "folder") {
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
    } else if (contextMenu.type === "subfolder") {
      items.push(
        {
          label: "New folder",
          icon: FolderPlus,
          onClick: async () => {
            if (!contextMenu.parentId || !currentSpaceId) return;

            // Generate a unique folder name
            const existingSubFolders =
              subFoldersMap[contextMenu.parentId] || [];
            let subFolderName = "New folder";
            let counter = 1;
            const existingNames = existingSubFolders.map((sf) =>
              sf.name.toLowerCase()
            );

            while (existingNames.includes(subFolderName.toLowerCase())) {
              subFolderName = `New folder ${counter}`;
              counter++;
            }

            try {
              const subFolderId = await createSubFolder(
                currentSpaceId,
                contextMenu.parentId,
                subFolderName
              );
              setEditingSubFolderId(subFolderId);
              setContextMenu(null);
            } catch (error) {
              console.error("Error creating folder:", error);
              // If it still fails, try with a timestamp-based name
              const timestampName = `New folder ${Date.now()}`;
              const subFolderId = await createSubFolder(
                currentSpaceId,
                contextMenu.parentId,
                timestampName
              );
              setEditingSubFolderId(subFolderId);
              setContextMenu(null);
            }
          },
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
          onClick: handleDeleteSubFolder,
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

        {/* Collapse Folders Button */}
        <div
          onClick={() => {
            setExpandedFolders(new Set());
            // Clear active folder/subfolder when collapsing all
            setActiveFolder(null);
            setActiveSubFolder(null);
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

        {/* Folder Navigation */}
        <div className="absolute flex flex-col gap-[8px] items-start left-[15px] top-[149px] w-[259px]">
          {folders.map((folder, index) => (
            <div
              key={folder.id}
              className="flex flex-col gap-[16px] items-start relative shrink-0 w-full"
              onContextMenu={(e) => handleContextMenu(e, "folder", folder.id)}
            >
              <FolderItem
                folder={folder}
                spaceId={currentSpaceId || ""}
                subFolders={subFoldersMap[folder.id] || []}
                isExpanded={expandedFolders.has(folder.id)}
                isActive={activeFolderId === folder.id}
                activeSubFolderId={activeSubFolderId}
                onToggle={() => {
                  const wasExpanded = expandedFolders.has(folder.id);
                  toggleFolder(folder.id);
                  // Only set as active if expanding, not collapsing
                  if (!wasExpanded) {
                    setActiveFolder(folder.id);
                    setActiveSubFolder(null);
                  }
                }}
                onSetActive={() => setActiveFolder(folder.id)}
                onSetActiveSubFolder={(subFolderId) => {
                  setActiveSubFolder(subFolderId);
                  setActiveFolder(folder.id);
                }}
                onUpdateFolder={(newName) =>
                  handleUpdateFolder(folder.id, newName)
                }
                onUpdateSubFolder={(subFolderId, newName) =>
                  handleUpdateSubFolder(folder.id, subFolderId, newName)
                }
                onDeleteFolder={handleDeleteFolder}
                onDeleteSubFolder={(subFolderId) => {
                  if (!currentSpaceId) return;
                  deleteSubFolderById(currentSpaceId, folder.id, subFolderId);
                }}
                onRenameFolder={() => setEditingFolderId(folder.id)}
                onRenameSubFolder={(subFolderId) =>
                  setEditingSubFolderId(subFolderId)
                }
                editingFolderId={editingFolderId}
                editingSubFolderId={editingSubFolderId}
                onEditChange={(folderId, subFolderId) => {
                  setEditingFolderId(folderId);
                  setEditingSubFolderId(subFolderId);
                }}
                onContextMenu={handleContextMenu}
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
