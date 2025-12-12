// Firebase Storage utilities for image uploads

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

// Helper to check if Firebase Storage is available
const isStorageAvailable = () => {
  return storage !== null;
};

/**
 * Uploads an image file to Firebase Storage
 * @param userId - The user ID
 * @param file - The image file to upload
 * @param bookmarkId - Optional bookmark ID (if updating existing bookmark)
 * @returns The download URL of the uploaded image
 */
export async function uploadBookmarkImage(
  userId: string,
  file: File,
  bookmarkId?: string
): Promise<string> {
  if (!isStorageAvailable()) {
    throw new Error("Firebase Storage is not configured");
  }

  // Validate file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit.");
  }

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = bookmarkId
      ? `bookmarks/${userId}/${bookmarkId}_${timestamp}.${fileExtension}`
      : `bookmarks/${userId}/${timestamp}_screenshot.${fileExtension}`;

    console.log("Uploading file to path:", filename);
    const storageRef = ref(storage!, filename);

    // Upload the file
    console.log("Starting upload...");
    const uploadResult = await uploadBytes(storageRef, file);
    console.log("Upload complete, getting download URL...");

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log("Download URL obtained:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Deletes an image from Firebase Storage
 * @param imageUrl - The URL of the image to delete
 */
export async function deleteBookmarkImage(imageUrl: string): Promise<void> {
  if (!isStorageAvailable()) {
    throw new Error("Firebase Storage is not configured");
  }

  try {
    // Extract the path from the URL
    // Firebase Storage URLs are in format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new Error("Invalid image URL");
    }

    // Decode the path (Firebase Storage encodes paths)
    const decodedPath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage!, decodedPath);

    await deleteObject(storageRef);
  } catch (error: any) {
    console.error("Error deleting image:", error);
    // Don't throw - it's okay if deletion fails (image might not exist)
  }
}
