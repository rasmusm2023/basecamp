// Real-time Firestore listeners for spaces, folders, and subfolders
// These use onSnapshot for real-time updates and better performance

import {
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
  query,
} from "firebase/firestore";
import { db } from "./config";
import { Space, Folder, SubFolder } from "../types";

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

// ==================== FOLDERS ====================

export const subscribeToFolders = (
  userId: string,
  spaceId: string,
  callback: (folders: Folder[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const foldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/folders`
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

// ==================== SUBFOLDERS ====================

export const subscribeToSubFolders = (
  userId: string,
  spaceId: string,
  folderId: string,
  callback: (subFolders: SubFolder[]) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }

  const subFoldersRef = collection(
    db!,
    `users/${userId}/spaces/${spaceId}/folders/${folderId}/subfolders`
  );
  const subFoldersQuery = query(subFoldersRef);

  return onSnapshot(
    subFoldersQuery,
    (snapshot) => {
      const subFolders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubFolder[];

      // Sort by createdAt
      subFolders.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });

      callback(subFolders);
    },
    (error) => {
      console.error("Error in subfolders subscription:", error);
      callback([]);
    }
  );
};
