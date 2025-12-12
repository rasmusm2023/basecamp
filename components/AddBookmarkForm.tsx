"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchURLMetadata } from "../lib/utils/metadata";
import { uploadBookmarkImage } from "../lib/firebase/storage";
import { X, Link } from "./icons";
import { Image as ImageIconPhosphor } from "phosphor-react";

interface AddBookmarkFormProps {
  spaceId: string;
  collectionId: string;
  folderId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookmarkForm({
  spaceId,
  collectionId,
  folderId,
  onClose,
  onSuccess,
}: AddBookmarkFormProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch metadata when URL is entered
  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsFetchingMetadata(true);
    setError(null);

    try {
      const metadata = await fetchURLMetadata(url);
      setName(metadata.title || "");
      setDescription(metadata.description || "");

      // Use Open Graph image from metadata if available
      if (metadata.image) {
        setImage(metadata.image);
      } else {
        // No image found, user can upload their own
        setImage("");
      }
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
      setError(
        "Failed to fetch website metadata. Please fill in the details manually and upload an image."
      );
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ".") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsLoading(true);

      // Check if Firebase Storage is available
      const { storage } = await import("../lib/firebase/config");

      if (storage) {
        // Try to upload to Firebase Storage
        try {
          const imageUrl = await uploadBookmarkImage(user.uid, file);
          setImage(imageUrl);
        } catch (uploadError: any) {
          // If Storage upload fails, convert to base64
          console.warn(
            "Firebase Storage upload failed, using base64:",
            uploadError?.message
          );
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            setImage(base64String);
          };
          reader.readAsDataURL(file);
        }
      } else {
        // Storage not available, convert to base64 directly
        console.log("Firebase Storage not available, using base64");
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImage(base64String);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to add bookmarks");
      return;
    }

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    // Image is optional - user can add bookmark without image

    setIsLoading(true);
    setError(null);

    try {
      // Import the bookmark creation function dynamically to avoid circular dependencies
      const { createBookmarkInCollection, createBookmarkInFolder } =
        await import("../lib/firebase/spaces");

      if (folderId) {
        await createBookmarkInFolder(
          user.uid,
          spaceId,
          collectionId,
          folderId,
          url,
          name,
          description || undefined,
          image || undefined,
          tags.length > 0 ? tags : undefined
        );
      } else {
        await createBookmarkInCollection(
          user.uid,
          spaceId,
          collectionId,
          url,
          name,
          description || undefined,
          image || undefined,
          tags.length > 0 ? tags : undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating bookmark:", err);
      setError(err.message || "Failed to create bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-primary dark:bg-bg-dark rounded-[16px] border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-text-primary dark:text-white text-[24px] font-bold font-sans">
              Add Link
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary dark:text-text-light hover:opacity-80 transition-opacity"
            >
              <X size={24} weight="regular" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* URL Input */}
            <div>
              <label className="block text-text-primary dark:text-white text-[14px] font-medium mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleFetchMetadata}
                  placeholder="https://example.com"
                  className="flex-1 bg-[#161616] dark:bg-[#161616] border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] px-4 py-3 text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-text-light focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={isFetchingMetadata}
                  className="px-4 py-3 bg-[#343434] dark:bg-[#343434] rounded-[8px] text-white hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <Link size={20} weight="regular" />
                </button>
              </div>
              {isFetchingMetadata && (
                <p className="text-text-secondary dark:text-text-light text-[12px] mt-2">
                  Fetching metadata...
                </p>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-text-primary dark:text-white text-[14px] font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bookmark name"
                className="w-full bg-[#161616] dark:bg-[#161616] border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] px-4 py-3 text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-text-light focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-text-primary dark:text-white text-[14px] font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="w-full bg-[#161616] dark:bg-[#161616] border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] px-4 py-3 text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-text-light focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors resize-none"
              />
            </div>

            {/* Image Input */}
            <div>
              <label className="block text-text-primary dark:text-white text-[14px] font-medium mb-2">
                Image
              </label>
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Bookmark preview"
                    className="w-full h-[200px] object-cover rounded-[8px] border border-[rgba(255,255,255,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <X size={16} weight="regular" className="text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[200px] border-2 border-dashed border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] flex items-center justify-center cursor-pointer hover:border-[rgba(255,255,255,0.3)] transition-colors"
                >
                  <div className="text-center">
                    <ImageIconPhosphor
                      size={48}
                      weight="regular"
                      className="text-text-secondary dark:text-text-light mx-auto mb-2"
                    />
                    <p className="text-text-secondary dark:text-text-light text-[14px]">
                      Click to upload image or fetch from URL
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-text-primary dark:text-white text-[14px] font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-[#343434] dark:bg-[#343434] px-3 py-1 rounded-[8px] text-white text-[12px]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <X size={12} weight="regular" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={addTag}
                placeholder="Add tags (press Enter, comma, or period)"
                className="w-full bg-[#161616] dark:bg-[#161616] border border-[rgba(255,255,255,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[8px] px-4 py-3 text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-text-light focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-[8px] p-3">
                <p className="text-red-500 text-[14px]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-[#343434] dark:bg-[#343434] rounded-[8px] text-white hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !url.trim() || !name.trim() || !image}
                className="px-6 py-3 bg-white dark:bg-white text-black rounded-[8px] hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
