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
  createCollection,
  updateCollectionName,
  updateCollectionIcon,
  deleteCollection,
  createFolder,
  updateFolderName,
  updateFolderIcon,
  deleteFolder,
  createBookmarkInCollection,
  createBookmarkInFolder,
  updateBookmarkInCollection,
  updateBookmarkInFolder,
  deleteBookmarkFromCollection,
  deleteBookmarkFromFolder,
} from "@/lib/firebase/spaces";
import {
  subscribeToSpaces,
  subscribeToCollections,
  subscribeToFolders,
  subscribeToBookmarksInCollection,
  subscribeToBookmarksInFolder,
} from "@/lib/firebase/spaces-realtime";
import { Space, Collection, Folder, Bookmark } from "@/lib/types";
import { Unsubscribe } from "firebase/firestore";

interface SpacesContextType {
  spaces: Space[];
  currentSpaceId: string | null;
  currentSpace: Space | undefined;
  collections: Collection[];
  foldersMap: Record<string, Folder[]>;
  loading: boolean;
  loadingCollections: boolean;
  loadingFolders: Set<string>;
  activeCollectionId: string | null;
  activeFolderId: string | null;
  setCurrentSpaceId: (id: string | null) => void;
  setActiveCollection: (collectionId: string | null) => void;
  setActiveFolder: (folderId: string | null) => void;
  refreshSpaces: () => Promise<void>;
  createNewSpace: (name: string) => Promise<string>;
  updateSpace: (spaceId: string, newName: string) => Promise<void>;
  deleteSpaceById: (spaceId: string) => Promise<void>;
  refreshCollections: (spaceId: string) => Promise<Collection[]>;
  createCollection: (
    spaceId: string,
    name: string,
    icon?: string
  ) => Promise<string>;
  updateCollection: (
    spaceId: string,
    collectionId: string,
    newName: string
  ) => Promise<void>;
  updateCollectionIcon: (
    spaceId: string,
    collectionId: string,
    icon: string
  ) => Promise<void>;
  deleteCollectionById: (
    spaceId: string,
    collectionId: string
  ) => Promise<void>;
  getFolders: (spaceId: string, collectionId: string) => Promise<Folder[]>;
  createFolder: (
    spaceId: string,
    collectionId: string,
    name: string,
    icon?: string
  ) => Promise<string>;
  updateFolder: (
    spaceId: string,
    collectionId: string,
    folderId: string,
    newName: string
  ) => Promise<void>;
  updateFolderIcon: (
    spaceId: string,
    collectionId: string,
    folderId: string,
    icon: string
  ) => Promise<void>;
  deleteFolderById: (
    spaceId: string,
    collectionId: string,
    folderId: string
  ) => Promise<void>;
  bookmarks: Bookmark[];
  loadingBookmarks: boolean;
  createBookmark: (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    url: string,
    name: string,
    description?: string,
    image?: string,
    tags?: string[]
  ) => Promise<string>;
  updateBookmark: (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    bookmarkId: string,
    updates: Partial<Bookmark>
  ) => Promise<void>;
  deleteBookmark: (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    bookmarkId: string
  ) => Promise<void>;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export function SpacesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [foldersMap, setFoldersMap] = useState<Record<string, Folder[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null
  );
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Refs to store unsubscribe functions for cleanup
  const spacesUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const collectionsUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const foldersUnsubscribeRef = useRef<Record<string, Unsubscribe>>({});
  const bookmarksUnsubscribeRef = useRef<(() => void) | null>(null);
  const collectionBookmarksRef = useRef<Bookmark[]>([]);
  const folderBookmarksRef = useRef<Record<string, Bookmark[]>>({});

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
    console.log(
      "[SpacesContext] Setting up spaces subscription for user:",
      user.uid
    );
    spacesUnsubscribeRef.current = subscribeToSpaces(
      user.uid,
      (fetchedSpaces) => {
        console.log(
          "[SpacesContext] Spaces received:",
          fetchedSpaces.length,
          fetchedSpaces
        );
        setSpaces(fetchedSpaces);

        // Set first space as current if none is selected
        if (!currentSpaceId && fetchedSpaces.length > 0) {
          console.log(
            "[SpacesContext] Setting current space to:",
            fetchedSpaces[0].id
          );
          setCurrentSpaceId(fetchedSpaces[0].id);
        }

        // Create default space if none exists (in background, non-blocking)
        if (fetchedSpaces.length === 0) {
          console.log(
            "[SpacesContext] No spaces found, creating default space..."
          );
          createSpace(user.uid, "Your space")
            .then((spaceId) => {
              console.log("[SpacesContext] Default space created:", spaceId);
              return Promise.all([
                spaceId,
                createCollection(user.uid, spaceId, "New collection"),
              ]);
            })
            .then(([spaceId, collectionId]) => {
              console.log(
                "[SpacesContext] Default collection created:",
                collectionId
              );
              return createFolder(
                user.uid,
                spaceId,
                collectionId,
                "New folder"
              );
            })
            .then(() => {
              console.log("[SpacesContext] Default folder created");
            })
            .catch((error) => {
              console.error(
                "[SpacesContext] Error creating default space structure:",
                error
              );
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

  // Set up real-time listener for collections when currentSpaceId changes
  useEffect(() => {
    if (!user || !currentSpaceId) {
      setCollections([]);
      setFoldersMap({});
      // Clean up collection subscription
      if (collectionsUnsubscribeRef.current) {
        collectionsUnsubscribeRef.current();
        collectionsUnsubscribeRef.current = null;
      }
      // Clean up all folder subscriptions
      Object.values(foldersUnsubscribeRef.current).forEach((unsub) => {
        unsub();
      });
      foldersUnsubscribeRef.current = {};
      return;
    }

    setLoadingCollections(true);

    // Subscribe to collections in real-time
    console.log(
      "[SpacesContext] Setting up collections subscription for space:",
      currentSpaceId
    );
    collectionsUnsubscribeRef.current = subscribeToCollections(
      user.uid,
      currentSpaceId,
      (fetchedCollections) => {
        console.log(
          "[SpacesContext] Collections received:",
          fetchedCollections.length,
          fetchedCollections
        );
        setCollections(fetchedCollections);
        setLoadingCollections(false);

        // If space has no collections, create a default collection structure
        if (fetchedCollections.length === 0) {
          console.log(
            "[SpacesContext] No collections found, creating default collection structure..."
          );
          createCollection(user.uid, currentSpaceId, "New collection")
            .then((collectionId) => {
              console.log(
                "[SpacesContext] Default collection created:",
                collectionId
              );
              return createFolder(
                user.uid,
                currentSpaceId,
                collectionId,
                "New folder"
              );
            })
            .then(() => {
              console.log("[SpacesContext] Default folder created");
            })
            .catch((error) => {
              console.error(
                "[SpacesContext] Error creating default collection structure:",
                error
              );
            });
          return; // Exit early, collections will be created and subscription will fire again
        }

        // Set up real-time listeners for all folders in parallel
        const newFoldersMap: Record<string, Folder[]> = {};
        const folderPromises = fetchedCollections.map(async (collection) => {
          return new Promise<void>((resolve) => {
            // Subscribe to folders for this collection
            if (!foldersUnsubscribeRef.current[collection.id]) {
              foldersUnsubscribeRef.current[collection.id] = subscribeToFolders(
                user.uid,
                currentSpaceId,
                collection.id,
                (folders) => {
                  newFoldersMap[collection.id] = folders;
                  setFoldersMap((prev) => ({
                    ...prev,
                    [collection.id]: folders,
                  }));

                  // If collection has no folders, create one in the background
                  if (folders.length === 0) {
                    createFolder(
                      user.uid,
                      currentSpaceId,
                      collection.id,
                      "New folder"
                    ).catch((error) => {
                      console.error(
                        `Error creating folder for collection ${collection.id}:`,
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

        // Wait for all folder subscriptions to be set up
        Promise.all(folderPromises).catch((error) => {
          console.error("Error setting up folder subscriptions:", error);
        });
      }
    );

    return () => {
      if (collectionsUnsubscribeRef.current) {
        collectionsUnsubscribeRef.current();
        collectionsUnsubscribeRef.current = null;
      }
      // Clean up all folder subscriptions for this space
      Object.values(foldersUnsubscribeRef.current).forEach((unsub) => {
        unsub();
      });
      foldersUnsubscribeRef.current = {};
    };
  }, [user, currentSpaceId]);

  // Set up real-time listener for bookmarks when collection/folder is active
  useEffect(() => {
    if (!user || !currentSpaceId || !activeCollectionId) {
      setBookmarks([]);
      collectionBookmarksRef.current = [];
      folderBookmarksRef.current = {};
      if (bookmarksUnsubscribeRef.current) {
        bookmarksUnsubscribeRef.current();
        bookmarksUnsubscribeRef.current = null;
      }
      return;
    }

    setLoadingBookmarks(true);

    if (activeFolderId) {
      // Single folder: show only that folder's bookmarks
      bookmarksUnsubscribeRef.current = subscribeToBookmarksInFolder(
        user.uid,
        currentSpaceId,
        activeCollectionId,
        activeFolderId,
        (fetchedBookmarks) => {
          setBookmarks(
            fetchedBookmarks.map((b) => ({ ...b, folderId: activeFolderId }))
          );
          setLoadingBookmarks(false);
        }
      );
    } else {
      // Collection view: aggregate collection-level bookmarks + all folder bookmarks
      collectionBookmarksRef.current = [];
      folderBookmarksRef.current = {};

      const mergeBookmarks = () => {
        const fromCollection = collectionBookmarksRef.current;
        const fromFolders = Object.values(folderBookmarksRef.current).flat();
        const combined = [...fromCollection, ...fromFolders];
        combined.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setBookmarks(combined);
        setLoadingBookmarks(false);
      };

      const unsubs: (() => void)[] = [];

      unsubs.push(
        subscribeToBookmarksInCollection(
          user.uid,
          currentSpaceId,
          activeCollectionId,
          (fetchedBookmarks) => {
            collectionBookmarksRef.current = fetchedBookmarks;
            mergeBookmarks();
          }
        )
      );

      const folders = foldersMap[activeCollectionId] ?? [];
      folders.forEach((folder) => {
        unsubs.push(
          subscribeToBookmarksInFolder(
            user.uid,
            currentSpaceId,
            activeCollectionId,
            folder.id,
            (fetchedBookmarks) => {
              folderBookmarksRef.current = {
                ...folderBookmarksRef.current,
                [folder.id]: fetchedBookmarks.map((b) => ({
                  ...b,
                  folderId: folder.id,
                })),
              };
              mergeBookmarks();
            }
          )
        );
      });

      bookmarksUnsubscribeRef.current = () => unsubs.forEach((u) => u());
    }

    return () => {
      if (bookmarksUnsubscribeRef.current) {
        bookmarksUnsubscribeRef.current();
        bookmarksUnsubscribeRef.current = null;
      }
    };
  }, [user, currentSpaceId, activeCollectionId, activeFolderId, foldersMap]);

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

  const refreshCollections = async (spaceId: string): Promise<Collection[]> => {
    // Real-time listener handles this automatically
    // Return cached collections for API compatibility
    return collections;
  };

  const createNewCollection = async (
    spaceId: string,
    name: string,
    icon?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const collectionId = await createCollection(user.uid, spaceId, name, icon);
    // Real-time listener will update automatically
    return collectionId;
  };

  const updateCollection = async (
    spaceId: string,
    collectionId: string,
    newName: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateCollectionName(user.uid, spaceId, collectionId, newName);
    // Real-time listener will update automatically
  };

  const updateCollectionIcon = async (
    spaceId: string,
    collectionId: string,
    icon: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateCollectionIcon(user.uid, spaceId, collectionId, icon);
    // Real-time listener will update automatically
  };

  const deleteCollectionById = async (
    spaceId: string,
    collectionId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await deleteCollection(user.uid, spaceId, collectionId);
    // Real-time listener will update automatically
  };

  const getFolders = async (
    spaceId: string,
    collectionId: string
  ): Promise<Folder[]> => {
    // Return cached folders
    return foldersMap[collectionId] || [];
  };

  const createNewFolder = async (
    spaceId: string,
    collectionId: string,
    name: string,
    icon?: string
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const folderId = await createFolder(
      user.uid,
      spaceId,
      collectionId,
      name,
      icon
    );
    // Real-time listener will update automatically
    return folderId;
  };

  const updateFolder = async (
    spaceId: string,
    collectionId: string,
    folderId: string,
    newName: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateFolderName(user.uid, spaceId, collectionId, folderId, newName);
    // Real-time listener will update automatically
  };

  const updateFolderIcon = async (
    spaceId: string,
    collectionId: string,
    folderId: string,
    icon: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await updateFolderIcon(user.uid, spaceId, collectionId, folderId, icon);
    // Real-time listener will update automatically
  };

  const deleteFolderById = async (
    spaceId: string,
    collectionId: string,
    folderId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    await deleteFolder(user.uid, spaceId, collectionId, folderId);
    // Real-time listener will update automatically
  };

  // Bookmark management functions
  const createBookmark = async (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    url: string,
    name: string,
    description?: string,
    image?: string,
    tags?: string[]
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    if (folderId) {
      return createBookmarkInFolder(
        user.uid,
        spaceId,
        collectionId,
        folderId,
        url,
        name,
        description,
        image,
        tags
      );
    } else {
      return createBookmarkInCollection(
        user.uid,
        spaceId,
        collectionId,
        url,
        name,
        description,
        image,
        tags
      );
    }
  };

  const updateBookmark = async (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    bookmarkId: string,
    updates: Partial<Bookmark>
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (folderId) {
      await updateBookmarkInFolder(
        user.uid,
        spaceId,
        collectionId,
        folderId,
        bookmarkId,
        updates
      );
    } else {
      await updateBookmarkInCollection(
        user.uid,
        spaceId,
        collectionId,
        bookmarkId,
        updates
      );
    }
  };

  const deleteBookmark = async (
    spaceId: string,
    collectionId: string,
    folderId: string | undefined,
    bookmarkId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (folderId) {
      await deleteBookmarkFromFolder(
        user.uid,
        spaceId,
        collectionId,
        folderId,
        bookmarkId
      );
    } else {
      await deleteBookmarkFromCollection(
        user.uid,
        spaceId,
        collectionId,
        bookmarkId
      );
    }
  };

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        currentSpaceId,
        currentSpace,
        collections,
        foldersMap,
        loading,
        loadingCollections,
        loadingFolders,
        activeCollectionId,
        activeFolderId,
        setCurrentSpaceId,
        setActiveCollection: setActiveCollectionId,
        setActiveFolder: setActiveFolderId,
        refreshSpaces,
        createNewSpace,
        updateSpace,
        deleteSpaceById,
        refreshCollections,
        createCollection: createNewCollection,
        updateCollection,
        updateCollectionIcon,
        deleteCollectionById,
        getFolders,
        createFolder: createNewFolder,
        updateFolder,
        updateFolderIcon,
        deleteFolderById,
        bookmarks,
        loadingBookmarks,
        createBookmark,
        updateBookmark,
        deleteBookmark,
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
