// Firestore service for managing spaces, collections, folders, and bookmarks

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { Space, Collection, Folder, Bookmark } from "../types";

// Helper to check if Firebase is available
const isFirebaseAvailable = () => {
  return db !== null;
};

// ==================== SPACES ====================

export const createSpace = async (
  userId: string,
  name: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  try {
    const spaceRef = doc(collection(db!, `users/${userId}/spaces`));
    const space: Omit<Space, "id"> = {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(spaceRef, space);
    return spaceRef.id;
  } catch (error: any) {
    console.error("Error in createSpace:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};

export const getSpaces = async (userId: string): Promise<Space[]> => {
  if (!isFirebaseAvailable()) {
    console.warn("Firebase not available, returning empty spaces array");
    return [];
  }

  try {
    const spacesRef = collection(db!, `users/${userId}/spaces`);

    // Fetch without orderBy for speed (sort manually)
    const spacesSnapshot = await getDocs(spacesRef);

    const spaces = spacesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Space[];

    // Sort manually (faster than waiting for index)
    spaces.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });

    return spaces;
  } catch (error: any) {
    console.error("Error fetching spaces:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    return [];
  }
};

export const updateSpaceName = async (
  userId: string,
  spaceId: string,
  newName: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  if (!newName.trim()) {
    throw new Error("Space name cannot be empty");
  }

  const spaceRef = doc(db!, `users/${userId}/spaces/${spaceId}`);
  await updateDoc(spaceRef, {
    name: newName.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSpace = async (
  userId: string,
  spaceId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  // Delete all collections in the space (and their folders and bookmarks)
  const collectionsRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections`
  );
  const collectionsSnapshot = await getDocs(collectionsRef);

  for (const collectionDoc of collectionsSnapshot.docs) {
    await deleteCollection(userId, spaceId, collectionDoc.id);
  }

  // Delete the space
  const spaceRef = doc(db!, `users/${userId}/spaces/${spaceId}`);
  await deleteDoc(spaceRef);
};

// ==================== COLLECTIONS ====================

export const createCollection = async (
  userId: string,
  spaceId: string,
  name: string,
  icon?: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  try {
    // Check for duplicate collection names in the same space
    const collections = await getCollections(userId, spaceId);
    const duplicateExists = collections.some(
      (collection) =>
        collection.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicateExists) {
      throw new Error("A collection with this name already exists");
    }

    const collectionRef = doc(
      collection(db!, `users/${userId}/spaces/${spaceId}/collections`)
    );
    const collectionData: Omit<Collection, "id"> = {
      name: name.trim(),
      folders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only add icon if it's provided (Firestore doesn't allow undefined)
    if (icon) {
      collectionData.icon = icon;
    }

    await setDoc(collectionRef, collectionData);
    return collectionRef.id;
  } catch (error: any) {
    console.error("Error in createCollection:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};

export const getCollections = async (
  userId: string,
  spaceId: string
): Promise<Collection[]> => {
  if (!isFirebaseAvailable()) {
    console.warn("Firebase not available, returning empty collections array");
    return [];
  }

  try {
    const collectionsRef = collection(
      db!,
      `users/${userId}/spaces/${spaceId}/collections`
    );

    // Fetch without orderBy for speed (sort manually)
    const collectionsSnapshot = await getDocs(collectionsRef);

    const collections: Collection[] = collectionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      folders: [],
      ...doc.data(),
    })) as Collection[];

    // Sort manually (faster than waiting for index)
    collections.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });

    return collections;
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    return [];
  }
};

export const updateCollectionName = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  newName: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  if (!newName.trim()) {
    throw new Error("Collection name cannot be empty");
  }

  // Check for duplicate collection names in the same space
  const collections = await getCollections(userId, spaceId);
  const duplicateExists = collections.some(
    (collection) =>
      collection.id !== collectionId &&
      collection.name.toLowerCase() === newName.trim().toLowerCase()
  );
  if (duplicateExists) {
    throw new Error("A collection with this name already exists");
  }

  const collectionRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}`
  );
  await updateDoc(collectionRef, {
    name: newName.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateCollectionIcon = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  icon: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const collectionRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}`
  );
  await updateDoc(collectionRef, {
    icon,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCollection = async (
  userId: string,
  spaceId: string,
  collectionId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  // Delete all bookmarks in the collection
  const bookmarksRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/bookmarks`
  );
  const bookmarksSnapshot = await getDocs(bookmarksRef);

  for (const bookmarkDoc of bookmarksSnapshot.docs) {
    await deleteDoc(
      doc(
        db!,
        `users/${userId}/spaces/${spaceId}/collections/${collectionId}/bookmarks/${bookmarkDoc.id}`
      )
    );
  }

  // Delete all folders in the collection (and their bookmarks)
  const foldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders`
  );
  const foldersSnapshot = await getDocs(foldersRef);

  for (const folderDoc of foldersSnapshot.docs) {
    await deleteFolder(userId, spaceId, collectionId, folderDoc.id);
  }

  // Delete the collection
  const collectionRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}`
  );
  await deleteDoc(collectionRef);
};

// ==================== FOLDERS ====================

export const createFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  name: string,
  icon?: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  try {
    const folderRef = doc(
      collection(
        db!,
        `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders`
      )
    );
    const folder: Omit<Folder, "id"> = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only add icon if it's provided (Firestore doesn't allow undefined)
    if (icon) {
      folder.icon = icon;
    }

    await setDoc(folderRef, folder);
    return folderRef.id;
  } catch (error: any) {
    console.error("Error in createFolder:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};

export const getFolders = async (
  userId: string,
  spaceId: string,
  collectionId: string
): Promise<Folder[]> => {
  if (!isFirebaseAvailable()) {
    console.warn("Firebase not available, returning empty folders array");
    return [];
  }

  try {
    const foldersRef = collection(
      db!,
      `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders`
    );

    // Fetch without orderBy for speed (sort manually)
    const foldersSnapshot = await getDocs(foldersRef);

    const folders = foldersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Folder[];

    // Sort manually (faster than waiting for index)
    folders.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });

    return folders;
  } catch (error: any) {
    console.error("Error fetching folders:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    return [];
  }
};

export const updateFolderName = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  newName: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  if (!newName.trim()) {
    throw new Error("Folder name cannot be empty");
  }

  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}`
  );
  await updateDoc(folderRef, {
    name: newName.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateFolderIcon = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  icon: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}`
  );
  await updateDoc(folderRef, {
    icon,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  // Delete all bookmarks in the folder
  const bookmarksRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}/bookmarks`
  );
  const bookmarksSnapshot = await getDocs(bookmarksRef);

  for (const bookmarkDoc of bookmarksSnapshot.docs) {
    const bookmarkRef = doc(
      db!,
      `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}/bookmarks/${bookmarkDoc.id}`
    );
    await deleteDoc(bookmarkRef);
  }

  // Delete the folder
  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}`
  );
  await deleteDoc(folderRef);
};

// ==================== BOOKMARKS ====================

// Helper function to get bookmark collection path
const getBookmarkPath = (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId?: string
): string => {
  if (folderId) {
    return `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}/bookmarks`;
  }
  return `users/${userId}/spaces/${spaceId}/collections/${collectionId}/bookmarks`;
};

// Create bookmark in a collection (not folder)
export const createBookmarkInCollection = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  url: string,
  name: string,
  description?: string,
  image?: string,
  tags?: string[]
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    collection(db!, getBookmarkPath(userId, spaceId, collectionId))
  );
  const bookmark: Bookmark = {
    id: bookmarkRef.id,
    url: url.trim(),
    name: name.trim(),
    description: description?.trim(),
    image: image,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(bookmarkRef, bookmark);
  return bookmarkRef.id;
};

// Create bookmark in a folder
export const createBookmarkInFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  url: string,
  name: string,
  description?: string,
  image?: string,
  tags?: string[]
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    collection(db!, getBookmarkPath(userId, spaceId, collectionId, folderId))
  );
  const bookmark: Bookmark = {
    id: bookmarkRef.id,
    url: url.trim(),
    name: name.trim(),
    description: description?.trim(),
    image: image,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(bookmarkRef, bookmark);
  return bookmarkRef.id;
};

// Get bookmarks from a collection
export const getBookmarksFromCollection = async (
  userId: string,
  spaceId: string,
  collectionId: string
): Promise<Bookmark[]> => {
  if (!isFirebaseAvailable()) {
    return [];
  }

  try {
    const bookmarksRef = collection(
      db!,
      getBookmarkPath(userId, spaceId, collectionId)
    );
    const bookmarksSnapshot = await getDocs(
      query(bookmarksRef, orderBy("createdAt", "asc"))
    );
    return bookmarksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Bookmark[];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
};

// Get bookmarks from a folder
export const getBookmarksFromFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string
): Promise<Bookmark[]> => {
  if (!isFirebaseAvailable()) {
    return [];
  }

  try {
    const bookmarksRef = collection(
      db!,
      getBookmarkPath(userId, spaceId, collectionId, folderId)
    );
    const bookmarksSnapshot = await getDocs(
      query(bookmarksRef, orderBy("createdAt", "asc"))
    );
    return bookmarksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Bookmark[];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
};

// Update bookmark in a collection
export const updateBookmarkInCollection = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  bookmarkId: string,
  updates: Partial<Bookmark>
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `${getBookmarkPath(userId, spaceId, collectionId)}/${bookmarkId}`
  );
  await updateDoc(bookmarkRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

// Update bookmark in a folder
export const updateBookmarkInFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  bookmarkId: string,
  updates: Partial<Bookmark>
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `${getBookmarkPath(userId, spaceId, collectionId, folderId)}/${bookmarkId}`
  );
  await updateDoc(bookmarkRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

// Delete bookmark from a collection
export const deleteBookmarkFromCollection = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  bookmarkId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `${getBookmarkPath(userId, spaceId, collectionId)}/${bookmarkId}`
  );
  await deleteDoc(bookmarkRef);
};

// Delete bookmark from a folder
export const deleteBookmarkFromFolder = async (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  bookmarkId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `${getBookmarkPath(userId, spaceId, collectionId, folderId)}/${bookmarkId}`
  );
  await deleteDoc(bookmarkRef);
};
