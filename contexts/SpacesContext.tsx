"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  createSpace,
  updateSpaceName,
  deleteSpace,
  createFolder,
  updateFolderName,
  updateFolderIcon,
  deleteFolder,
  createSubFolder,
  updateSubFolderName,
  updateSubFolderIcon,
  deleteSubFolder,
} from "@/lib/firebase/spaces";
import {
  subscribeToSpaces,
  subscribeToFolders,
  subscribeToSubFolders,
} from "@/lib/firebase/spaces-realtime";
import { Space, Folder, SubFolder } from "@/lib/types";
import { Unsubscribe } from "firebase/firestore";

interface SpacesContextType {
  spaces: Space[];
  currentSpaceId: string | null;
  currentSpace: Space | undefined;
  folders: Folder[];
  subFoldersMap: Record<string, SubFolder[]>;
  loading: boolean;
  loadingFolders: boolean;
  loadingSubFolders: Set<string>;
  activeFolderId: string | null;
  activeSubFolderId: string | null;
  setCurrentSpaceId: (id: string | null) => void;
  setActiveFolder: (folderId: string | null) => void;
  setActiveSubFolder: (subFolderId: string | null) => void;
  refreshSpaces: () => Promise<void>;
  createNewSpace: (name: string) => Promise<string>;
  updateSpace: (spaceId: string, newName: string) => Promise<void>;
  deleteSpaceById: (spaceId: string) => Promise<void>;
  refreshFolders: (spaceId: string) => Promise<Folder[]>;
  createFolder: (
    spaceId: string,
    name: string,
    icon?: string
  ) => Promise<string>;
  updateFolder: (
    spaceId: string,
    folderId: string,
    newName: string
  ) => Promise<void>;
  updateFolderIcon: (
    spaceId: string,
    folderId: string,
    icon: string
  ) => Promise<void>;
  deleteFolderById: (spaceId: string, folderId: string) => Promise<void>;
  getSubFolders: (spaceId: string, folderId: string) => Promise<SubFolder[]>;
  createSubFolder: (
    spaceId: string,
    folderId: string,
    name: string,
    icon?: string
  ) => Promise<string>;
  updateSubFolder: (
    spaceId: string,
    folderId: string,
    subFolderId: string,
    newName: string
  ) => Promise<void>;
  updateSubFolderIcon: (
    spaceId: string,
    folderId: string,
    subFolderId: string,
    icon: string
  ) => Promise<void>;
  deleteSubFolderById: (
    spaceId: string,
    folderId: string,
    subFolderId: string
  ) => Promise<void>;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export function SpacesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [subFoldersMap, setSubFoldersMap] = useState<
    Record<string, SubFolder[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingSubFolders, setLoadingSubFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeSubFolderId, setActiveSubFolderId] = useState<string | null>(null);

  // Refs to store unsubscribe functions for cleanup
  const spacesUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const foldersUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const subFoldersUnsubscribeRef = useRef<Record<string, Unsubscribe>>({});

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Set up real-time listener for spaces
  useEffect(() => {
    if (!user) {
      setSpaces([]);
      setCurrentSpaceId(null);
      setLoading(false);
      // Clean up subscriptions
      if (spacesUnsubscribeRef.current) {
        spacesUnsubscribeRef.current();
        spacesUnsubscribeRef.current = null;
      }
      return;
    }

    // Set loading to false immediately - real-time listener will update data as it arrives
    setLoading(false);

    // Subscribe to spaces in real-time
    spacesUnsubscribeRef.current = subscribeToSpaces(
      user.uid,
      (fetchedSpaces) => {
        setSpaces(fetchedSpaces);

        // Set first space as current if none is selected
        if (!currentSpaceId && fetchedSpaces.length > 0) {
          setCurrentSpaceId(fetchedSpaces[0].id);
        }

        // Create default space if none exists (in background, non-blocking)
        if (fetchedSpaces.length === 0) {
          createSpace(user.uid, "Your space")
            .then((spaceId) => {
              return Promise.all([
                spaceId,
                createFolder(user.uid, spaceId, "New collection"),
              ]);
            })
            .then(([spaceId, folderId]) => {
              return createSubFolder(
                user.uid,
                spaceId,
                folderId,
                "New folder"
              );
            })
            .catch((error) => {
              console.error("Error creating default space structure:", error);
            });
        }
      }
    );

    return () => {
      if (spacesUnsubscribeRef.current) {
        spacesUnsubscribeRef.current();
        spacesUnsubscribeRef.current = null;
      }
    };
  }, [user]);

  // Set up real-time listener for folders when currentSpaceId changes
  useEffect(() => {
    if (!user || !currentSpaceId) {
      setFolders([]);
      setSubFoldersMap({});
      // Clean up folder subscription
      if (foldersUnsubscribeRef.current) {
        foldersUnsubscribeRef.current();
        foldersUnsubscribeRef.current = null;
      }
      // Clean up all subfolder subscriptions
      Object.values(subFoldersUnsubscribeRef.current).forEach((unsub) => {
        unsub();
      });
      subFoldersUnsubscribeRef.current = {};
      return;
    }

    setLoadingFolders(true);

    // Subscribe to folders in real-time
    foldersUnsubscribeRef.current = subscribeToFolders(
      user.uid,
      currentSpaceId,
      (fetchedFolders) => {
        setFolders(fetchedFolders);
        setLoadingFolders(false);

        // Set up real-time listeners for all subfolders in parallel
        const newSubFoldersMap: Record<string, SubFolder[]> = {};
        const subFolderPromises = fetchedFolders.map(async (folder) => {
          return new Promise<void>((resolve) => {
            // Subscribe to subfolders for this folder
            if (!subFoldersUnsubscribeRef.current[folder.id]) {
              subFoldersUnsubscribeRef.current[folder.id] =
                subscribeToSubFolders(
                  user.uid,
                  currentSpaceId,
                  folder.id,
                  (subFolders) => {
                    newSubFoldersMap[folder.id] = subFolders;
                    setSubFoldersMap((prev) => ({
                      ...prev,
                      [folder.id]: subFolders,
                    }));

                    // If folder has no subfolders, create one in the background
                    if (subFolders.length === 0) {
                      createSubFolder(
                        user.uid,
                        currentSpaceId,
                        folder.id,
                        "New folder"
                      ).catch((error) => {
                        console.error(
                          `Error creating subfolder for folder ${folder.id}:`,
                          error
                        );
                      });
                    }
                    resolve();
                  }
                );
            } else {
              // Already subscribed, just resolve
              resolve();
            }
          });
        });

        // Wait for all subfolder subscriptions to be set up
        Promise.all(subFolderPromises).catch((error) => {
          console.error("Error setting up subfolder subscriptions:", error);
        });
      }
    );

    return () => {
      if (foldersUnsubscribeRef.current) {
        foldersUnsubscribeRef.current();
        foldersUnsubscribeRef.current = null;
      }
      // Clean up all subfolder subscriptions for this space
      Object.values(subFoldersUnsubscribeRef.current).forEach((unsub) => {
        unsub();
      });
      subFoldersUnsubscribeRef.current = {};
    };
  }, [user, currentSpaceId]);

  const refreshSpaces = async () => {
    // Real-time listener handles this automatically
    // This function is kept for API compatibility
  };

  const createNewSpace = async (name: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const spaceId = await createSpace(user.uid, name);
    setCurrentSpaceId(spaceId);
    return spaceId;
  };

  const updateSpace = async (
    spaceId: string,
    newName: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateSpaceName(user.uid, spaceId, newName);
    // Real-time listener will update automatically
  };

  const deleteSpaceById = async (spaceId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await deleteSpace(user.uid, spaceId);
    // Real-time listener will update automatically
    // If deleted space was current, switch to first available space
    if (currentSpaceId === spaceId) {
      setCurrentSpaceId(spaces.length > 1 ? spaces[0].id : null);
    }
  };

  const refreshFolders = async (spaceId: string): Promise<Folder[]> => {
    // Real-time listener handles this automatically
    // Return cached folders for API compatibility
    return folders;
  };

  const createNewFolder = async (
    spaceId: string,
    name: string,
    icon?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const folderId = await createFolder(user.uid, spaceId, name, icon);
    // Real-time listener will update automatically
    return folderId;
  };

  const updateFolder = async (
    spaceId: string,
    folderId: string,
    newName: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateFolderName(user.uid, spaceId, folderId, newName);
    // Real-time listener will update automatically
  };

  const updateFolderIcon = async (
    spaceId: string,
    folderId: string,
    icon: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateFolderIcon(user.uid, spaceId, folderId, icon);
    // Real-time listener will update automatically
  };

  const deleteFolderById = async (
    spaceId: string,
    folderId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await deleteFolder(user.uid, spaceId, folderId);
    // Real-time listener will update automatically
  };

  const getSubFolders = async (
    spaceId: string,
    folderId: string
  ): Promise<SubFolder[]> => {
    // Return cached subfolders
    return subFoldersMap[folderId] || [];
  };

  const createNewSubFolder = async (
    spaceId: string,
    folderId: string,
    name: string,
    icon?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const subFolderId = await createSubFolder(
      user.uid,
      spaceId,
      folderId,
      name,
      icon
    );
    // Real-time listener will update automatically
    return subFolderId;
  };

  const updateSubFolder = async (
    spaceId: string,
    folderId: string,
    subFolderId: string,
    newName: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateSubFolderName(
      user.uid,
      spaceId,
      folderId,
      subFolderId,
      newName
    );
    // Real-time listener will update automatically
  };

  const updateSubFolderIcon = async (
    spaceId: string,
    folderId: string,
    subFolderId: string,
    icon: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateSubFolderIcon(user.uid, spaceId, folderId, subFolderId, icon);
    // Real-time listener will update automatically
  };

  const deleteSubFolderById = async (
    spaceId: string,
    folderId: string,
    subFolderId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await deleteSubFolder(user.uid, spaceId, folderId, subFolderId);
    // Real-time listener will update automatically
  };

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        currentSpaceId,
        currentSpace,
        folders,
        subFoldersMap,
        loading,
        loadingFolders,
        loadingSubFolders,
        activeFolderId,
        activeSubFolderId,
        setCurrentSpaceId,
        setActiveFolder: setActiveFolderId,
        setActiveSubFolder: setActiveSubFolderId,
        refreshSpaces,
        createNewSpace,
        updateSpace,
        deleteSpaceById,
        refreshFolders,
        createFolder: createNewFolder,
        updateFolder,
        updateFolderIcon,
        deleteFolderById,
        getSubFolders,
        createSubFolder: createNewSubFolder,
        updateSubFolder,
        updateSubFolderIcon,
        deleteSubFolderById,
      }}
    >
      {children}
    </SpacesContext.Provider>
  );
}

export function useSpaces() {
  const context = useContext(SpacesContext);
  if (context === undefined) {
    throw new Error("useSpaces must be used within a SpacesProvider");
  }
  return context;
}
