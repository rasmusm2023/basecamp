// Real-time Firestore listeners for spaces, collections, and folders
// These use onSnapshot for real-time updates and better performance

import {
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import { Space, Collection, Folder, Bookmark } from "../types";

// Helper to check if Firebase is available
const isFirebaseAvailable = () => {
  return db !== null;
};

// ==================== SPACES ====================

export const subscribeToSpaces = (
  userId: string,
  callback: (spaces: Space[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const spacesRef = collection(db!, `users/${userId}/spaces`);
  const spacesQuery = query(spacesRef);

  return onSnapshot(
    spacesQuery,
    (snapshot) => {
      const spaces = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Space[];

      // Sort by createdAt
      spaces.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });

      callback(spaces);
    },
    (error) => {
      console.error("Error in spaces subscription:", error);
      callback([]);
    }
  );
};

// ==================== COLLECTIONS ====================

export const subscribeToCollections = (
  userId: string,
  spaceId: string,
  callback: (collections: Collection[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const collectionsRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections`
  );
  const collectionsQuery = query(collectionsRef);

  return onSnapshot(
    collectionsQuery,
    (snapshot) => {
      const collections = snapshot.docs.map((doc) => ({
        id: doc.id,
        folders: [],
        ...doc.data(),
      })) as Collection[];

      // Sort by createdAt
      collections.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });

      callback(collections);
    },
    (error) => {
      console.error("Error in collections subscription:", error);
      callback([]);
    }
  );
};

// ==================== FOLDERS ====================

export const subscribeToFolders = (
  userId: string,
  spaceId: string,
  collectionId: string,
  callback: (folders: Folder[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const foldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders`
  );
  const foldersQuery = query(foldersRef);

  return onSnapshot(
    foldersQuery,
    (snapshot) => {
      const folders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Folder[];

      // Sort by createdAt
      folders.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });

      callback(folders);
    },
    (error) => {
      console.error("Error in folders subscription:", error);
      callback([]);
    }
  );
};

// ==================== BOOKMARKS ====================

// Subscribe to bookmarks in a collection
export const subscribeToBookmarksInCollection = (
  userId: string,
  spaceId: string,
  collectionId: string,
  callback: (bookmarks: Bookmark[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const bookmarksRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/bookmarks`
  );
  const bookmarksQuery = query(bookmarksRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    bookmarksQuery,
    (snapshot) => {
      const bookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bookmark[];

      callback(bookmarks);
    },
    (error) => {
      console.error("Error in bookmarks subscription:", error);
      callback([]);
    }
  );
};

// Subscribe to bookmarks in a folder
export const subscribeToBookmarksInFolder = (
  userId: string,
  spaceId: string,
  collectionId: string,
  folderId: string,
  callback: (bookmarks: Bookmark[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const bookmarksRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/collections/${collectionId}/folders/${folderId}/bookmarks`
  );
  const bookmarksQuery = query(bookmarksRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    bookmarksQuery,
    (snapshot) => {
      const bookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bookmark[];

      callback(bookmarks);
    },
    (error) => {
      console.error("Error in bookmarks subscription:", error);
      callback([]);
    }
  );
};
