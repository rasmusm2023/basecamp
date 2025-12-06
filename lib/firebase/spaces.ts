// Firestore service for managing spaces, folders, subfolders, and bookmarks

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
import { Space, Folder, SubFolder, Bookmark } from "../types";

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

  // Delete all folders in the space (and their subfolders and bookmarks)
  const foldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/folders`
  );
  const foldersSnapshot = await getDocs(foldersRef);

  for (const folderDoc of foldersSnapshot.docs) {
    await deleteFolder(userId, spaceId, folderDoc.id);
  }

  // Delete the space
  const spaceRef = doc(db!, `users/${userId}/spaces/${spaceId}`);
  await deleteDoc(spaceRef);
};

// ==================== FOLDERS ====================

export const createFolder = async (
  userId: string,
  spaceId: string,
  name: string,
  icon?: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  try {
    // Check for duplicate folder names in the same space
    const folders = await getFolders(userId, spaceId);
    const duplicateExists = folders.some(
      (folder) => folder.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicateExists) {
      throw new Error("A folder with this name already exists");
    }

    const folderRef = doc(
      collection(db!, `users/${userId}/spaces/${spaceId}/folders`)
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
  spaceId: string
): Promise<Folder[]> => {
  if (!isFirebaseAvailable()) {
    console.warn("Firebase not available, returning empty folders array");
    return [];
  }

  try {
    const foldersRef = collection(
      db!,
      `users/${userId}/spaces/${spaceId}/folders`
    );

    // Fetch without orderBy for speed (sort manually)
    const foldersSnapshot = await getDocs(foldersRef);

    const folders: Folder[] = foldersSnapshot.docs.map((doc) => ({
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
  folderId: string,
  newName: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  if (!newName.trim()) {
    throw new Error("Folder name cannot be empty");
  }

  // Check for duplicate folder names in the same space
  const folders = await getFolders(userId, spaceId);
  const duplicateExists = folders.some(
    (folder) =>
      folder.id !== folderId &&
      folder.name.toLowerCase() === newName.trim().toLowerCase()
  );
  if (duplicateExists) {
    throw new Error("A folder with this name already exists");
  }

  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}`
  );
  await updateDoc(folderRef, {
    name: newName.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateFolderIcon = async (
  userId: string,
  spaceId: string,
  folderId: string,
  icon: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}`
  );
  await updateDoc(folderRef, {
    icon,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteFolder = async (
  userId: string,
  spaceId: string,
  folderId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  // Delete all subfolders in the folder (and their bookmarks)
  const subFoldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders`
  );
  const subFoldersSnapshot = await getDocs(subFoldersRef);

  for (const subFolderDoc of subFoldersSnapshot.docs) {
    await deleteSubFolder(userId, spaceId, folderId, subFolderDoc.id);
  }

  // Delete the folder
  const folderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}`
  );
  await deleteDoc(folderRef);
};

// ==================== SUBFOLDERS ====================

export const createSubFolder = async (
  userId: string,
  spaceId: string,
  folderId: string,
  name: string,
  icon?: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  try {
    const subFolderRef = doc(
      collection(
        db!,
        `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders`
      )
    );
    const subFolder: Omit<SubFolder, "id"> = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only add icon if it's provided (Firestore doesn't allow undefined)
    if (icon) {
      subFolder.icon = icon;
    }

    await setDoc(subFolderRef, subFolder);
    return subFolderRef.id;
  } catch (error: any) {
    console.error("Error in createSubFolder:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};

export const getSubFolders = async (
  userId: string,
  spaceId: string,
  folderId: string
): Promise<SubFolder[]> => {
  if (!isFirebaseAvailable()) {
    console.warn("Firebase not available, returning empty subfolders array");
    return [];
  }

  try {
    const subFoldersRef = collection(
      db!,
      `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders`
    );

    // Fetch without orderBy for speed (sort manually)
    const subFoldersSnapshot = await getDocs(subFoldersRef);

    const subFolders = subFoldersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SubFolder[];

    // Sort manually (faster than waiting for index)
    subFolders.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });

    return subFolders;
  } catch (error: any) {
    console.error("Error fetching subfolders:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    return [];
  }
};

export const updateSubFolderName = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string,
  newName: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  if (!newName.trim()) {
    throw new Error("Sub-folder name cannot be empty");
  }

  const subFolderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}`
  );
  await updateDoc(subFolderRef, {
    name: newName.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateSubFolderIcon = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string,
  icon: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const subFolderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}`
  );
  await updateDoc(subFolderRef, {
    icon,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSubFolder = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  // Delete all bookmarks in the subfolder
  const bookmarksRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks`
  );
  const bookmarksSnapshot = await getDocs(bookmarksRef);

  for (const bookmarkDoc of bookmarksSnapshot.docs) {
    const bookmarkRef = doc(
      db!,
      `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks/${bookmarkDoc.id}`
    );
    await deleteDoc(bookmarkRef);
  }

  // Delete the subfolder
  const subFolderRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}`
  );
  await deleteDoc(subFolderRef);
};

// ==================== BOOKMARKS ====================

export const createBookmark = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string,
  url: string,
  title: string,
  description?: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    collection(
      db!,
      `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks`
    )
  );
  const bookmark: Bookmark = {
    id: bookmarkRef.id,
    url: url.trim(),
    title: title.trim(),
    description: description?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(bookmarkRef, bookmark);
  return bookmarkRef.id;
};

export const getBookmarks = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string
): Promise<Bookmark[]> => {
  if (!isFirebaseAvailable()) {
    return [];
  }

  try {
    const bookmarksRef = collection(
      db!,
      `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks`
    );
    const bookmarksSnapshot = await getDocs(
      query(bookmarksRef, orderBy("createdAt", "asc"))
    );
    return bookmarksSnapshot.docs.map((doc) => doc.data() as Bookmark);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
};

export const updateBookmark = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string,
  bookmarkId: string,
  updates: Partial<Bookmark>
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks/${bookmarkId}`
  );
  await updateDoc(bookmarkRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteBookmark = async (
  userId: string,
  spaceId: string,
  folderId: string,
  subFolderId: string,
  bookmarkId: string
): Promise<void> => {
  if (!isFirebaseAvailable()) {
    throw new Error("Firebase is not configured");
  }

  const bookmarkRef = doc(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders/${subFolderId}/bookmarks/${bookmarkId}`
  );
  await deleteDoc(bookmarkRef);
};
