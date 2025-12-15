"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [gatheredImage, setGatheredImage] = useState<string | undefined>(
    undefined
  );
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    undefined
  );
  const [selectedImage, setSelectedImage] = useState<
    "gathered" | "uploaded" | null
  >(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [hasTriedFetchingImage, setHasTriedFetchingImage] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [errors, setErrors] = useState<{
    url?: string;
    name?: string;
    general?: string;
  }>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal (client-side only)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Get the selected image URL
  const getSelectedImageUrl = (): string | undefined => {
    if (selectedImage === "gathered") return gatheredImage;
    if (selectedImage === "uploaded") return uploadedImage;
    return undefined;
  };

  // Fetch metadata when URL is entered
  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setErrors({ url: "Please enter a URL" });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setErrors({ url: "Please enter a valid URL" });
      return;
    }

    setIsFetchingMetadata(true);
    setErrors({});

    try {
      const metadata = await fetchURLMetadata(url);
      setName(metadata.title || "");
      setDescription(metadata.description || "");

      // Use Open Graph image from metadata if available
      setHasTriedFetchingImage(true);
      if (metadata.image) {
        setGatheredImage(metadata.image);
        setSelectedImage("gathered");
      } else {
        setGatheredImage(undefined);
      }
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
      setErrors({
        general:
          "Failed to fetch website metadata. Please fill in the details manually.",
      });
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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

  // Compress and resize image to fit within Firestore's 1MB field limit
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Calculate new dimensions (max 400px on longest side for thumbnails)
          // This is 2x the display size (200px) for retina displays while keeping file size small
          let width = img.width;
          let height = img.height;
          const maxDimension = 400;

          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format (GIFs and WebP should be converted to JPEG for better compression)
          const outputFormat =
            file.type === "image/gif" || file.type === "image/webp"
              ? "image/jpeg"
              : file.type === "image/png"
              ? "image/jpeg" // Convert PNG to JPEG for better compression
              : "image/jpeg";

          // Convert to base64 with compression
          let quality = 0.85;
          let base64String = "";
          const maxBase64Size = 900000; // ~900KB to leave room (base64 is ~33% larger)

          const tryCompress = () => {
            base64String = canvas.toDataURL(outputFormat, quality);
            const base64Size = new Blob([base64String]).size;

            if (base64Size > maxBase64Size && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else if (base64Size > maxBase64Size) {
              // If still too large even at minimum quality, try reducing dimensions further
              if (width > 300 || height > 300) {
                width = Math.min(width, 300);
                height = Math.min(height, 300);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                quality = 0.7;
                tryCompress();
              } else {
                reject(
                  new Error(
                    "Image is too large even after compression. Please use a smaller image."
                  )
                );
              }
            } else {
              resolve(base64String);
            }
          };

          tryCompress();
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Validate image file
  const validateImageFile = (file: File): string | null => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "File size exceeds 5MB limit.";
    }

    return null;
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file first
    const validationError = validateImageFile(file);
    if (validationError) {
      setImageUploadError(validationError);
      setUploadedImage(undefined);
      setSelectedImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);
    setErrors({});

    // Compress and convert image to base64
    // This ensures images fit within Firestore's 1MB field limit
    compressImage(file)
      .then((base64String) => {
        // Check final size
        const base64Size = new Blob([base64String]).size;
        const maxSize = 1000000; // 1MB limit for Firestore

        if (base64Size > maxSize) {
          setImageUploadError(
            "Image is too large even after compression. Please use a smaller image."
          );
          setUploadedImage(undefined);
          setSelectedImage(null);
          setIsUploadingImage(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setUploadedImage(base64String);
          setSelectedImage("uploaded");
          setIsUploadingImage(false);
        }
      })
      .catch((error) => {
        console.error("Error compressing image:", error);
        setImageUploadError(
          error.message || "Failed to process image. Please try another image."
        );
        setUploadedImage(undefined);
        setSelectedImage(null);
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors({ general: "You must be logged in to add bookmarks" });
      return;
    }

    const newErrors: { url?: string; name?: string; general?: string } = {};

    if (!url.trim()) {
      newErrors.url = "URL is required";
    }

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Import the bookmark creation function dynamically to avoid circular dependencies
      const { createBookmarkInCollection, createBookmarkInFolder } =
        await import("../lib/firebase/spaces");

      const imageUrl = getSelectedImageUrl();

      if (folderId) {
        await createBookmarkInFolder(
          user.uid,
          spaceId,
          collectionId,
          folderId,
          url,
          name,
          description.trim() || undefined,
          imageUrl || undefined,
          tags.length > 0 ? tags : undefined
        );
      } else {
        await createBookmarkInCollection(
          user.uid,
          spaceId,
          collectionId,
          url,
          name,
          description.trim() || undefined,
          imageUrl || undefined,
          tags.length > 0 ? tags : undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating bookmark:", err);
      let errorMessage = err.message || "Failed to create bookmark";

      // Provide a clearer error message for Firestore field size limit
      if (
        errorMessage.includes("longer than") ||
        errorMessage.includes("1048487")
      ) {
        errorMessage =
          "Image is too large. Please use a smaller image (under 800KB recommended).";
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Render modal using portal to ensure backdrop-filter works correctly
  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop overlay - dark semi-transparent with blur applied to everything behind it */}
      <div
        className="modal-backdrop-blur"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal - on top of blurred backdrop */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] rounded-[16px] border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text-primary dark:text-white text-[24px] font-bold font-sans transition-colors duration-300">
                Add Link
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary dark:text-text-light hover:opacity-80 transition-opacity"
              >
                <X size={24} weight="regular" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[36px]">
              {/* URL Input */}
              <div className="flex flex-col gap-[8px] items-start relative w-full">
                <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                  Link (URL) <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-2 w-full">
                  <div
                    onClick={() => urlInputRef.current?.focus()}
                    className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] flex-1 transition-all duration-300 cursor-pointer ${
                      errors.url
                        ? "input-border-error"
                        : url.trim()
                        ? "input-border-focus"
                        : "input-border-default"
                    } focus-within:border-2`}
                  >
                    <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                      <input
                        ref={urlInputRef}
                        type="url"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (errors.url) {
                            setErrors((prev) => {
                              const { url, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                        onBlur={handleFetchMetadata}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="https://example.com"
                        className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleFetchMetadata}
                      disabled={isFetchingMetadata}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="px-4 py-3 bg-[#343434] dark:bg-[#343434] rounded-[8px] text-white hover:opacity-80 transition-opacity disabled:opacity-50 h-full"
                    >
                      <Link size={20} weight="regular" />
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#0d0d0d] dark:bg-[#0d0d0d] border border-[rgba(255,255,255,0.1)] rounded-[8px] text-white text-[12px] font-semibold font-sans whitespace-nowrap z-50">
                        Grab data from URL
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-[#0d0d0d]"></div>
                      </div>
                    )}
                  </div>
                </div>
                {errors.url && (
                  <div className="bg-error-bg border input-border-error relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                    <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                      <p className="text-error-text text-[14px] font-semibold font-sans transition-colors duration-300">
                        {errors.url}
                      </p>
                    </div>
                  </div>
                )}
                {isFetchingMetadata && (
                  <p className="text-text-secondary dark:text-text-light text-[12px] font-semibold font-sans">
                    Fetching metadata...
                  </p>
                )}
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-[8px] items-start relative w-full">
                <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                  Name <span className="text-red-500">*</span>
                </p>
                <div
                  onClick={() => nameInputRef.current?.focus()}
                  className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                    errors.name
                      ? "input-border-error"
                      : name.trim()
                      ? "input-border-focus"
                      : "input-border-default"
                  } focus-within:border-2`}
                >
                  <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors((prev) => {
                            const { name, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Name the link"
                      className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text"
                      required
                    />
                  </div>
                </div>
                {errors.name && (
                  <div className="bg-error-bg border input-border-error relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                    <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                      <p className="text-error-text text-[14px] font-semibold font-sans transition-colors duration-300">
                        {errors.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-[8px] items-start relative w-full">
                <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                  Description
                </p>
                <div
                  onClick={() => descriptionInputRef.current?.focus()}
                  className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                    description.trim()
                      ? "input-border-focus"
                      : "input-border-default"
                  } focus-within:border-2`}
                >
                  <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                    <textarea
                      ref={descriptionInputRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Describe the link and what it is for"
                      rows={3}
                      className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Input */}
              <div className="flex flex-col gap-[8px] items-start relative w-full">
                <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                  Image
                </p>
                <div className="flex gap-4 w-full">
                  {/* Left side - Gathered image */}
                  <div className="flex-1">
                    {gatheredImage ? (
                      <div
                        onClick={() => setSelectedImage("gathered")}
                        className={`relative cursor-pointer rounded-[8px] border-2 transition-all duration-300 ${
                          selectedImage === "gathered"
                            ? "input-border-focus"
                            : "input-border-default"
                        }`}
                      >
                        <img
                          src={gatheredImage}
                          alt="Gathered from URL"
                          className="w-full h-[200px] object-cover rounded-[8px]"
                        />
                        {selectedImage === "gathered" && (
                          <div className="absolute inset-0 bg-accent-primary/20 border-2 border-accent-primary rounded-[8px] flex items-center justify-center">
                            <div className="bg-accent-primary text-[#0d0d0d] px-3 py-1 rounded-[8px] text-[12px] font-bold font-sans">
                              Selected
                            </div>
                          </div>
                        )}
                      </div>
                    ) : hasTriedFetchingImage ? (
                      <div className="w-full h-[200px] border-2 border-dashed input-border-default rounded-[8px] flex items-center justify-center">
                        <p className="text-text-secondary text-[12px] font-semibold font-sans text-center px-4">
                          The website didn't provide an image
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-[200px] border-2 border-dashed input-border-default rounded-[8px] flex items-center justify-center">
                        <p className="text-text-secondary text-[12px] font-semibold font-sans text-center px-4">
                          Image from URL will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right side - Upload image */}
                  <div className="flex-1">
                    {isUploadingImage ? (
                      <div className="w-full h-[200px] border-2 border-dashed input-border-default rounded-[8px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-text-secondary text-[12px] font-semibold font-sans">
                            Uploading image...
                          </p>
                        </div>
                      </div>
                    ) : imageUploadError ? (
                      <div className="w-full h-[200px] border-2 input-border-error rounded-[8px] flex items-center justify-center bg-error-bg/10">
                        <div className="text-center px-4">
                          <p className="text-error-text text-[12px] font-semibold font-sans">
                            {imageUploadError}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUploadError(null);
                              fileInputRef.current?.click();
                            }}
                            className="mt-2 text-error-text text-[12px] font-semibold font-sans underline hover:opacity-80"
                          >
                            Try another image
                          </button>
                        </div>
                      </div>
                    ) : uploadedImage ? (
                      <div
                        onClick={() => setSelectedImage("uploaded")}
                        className={`relative cursor-pointer rounded-[8px] border-2 transition-all duration-300 ${
                          selectedImage === "uploaded"
                            ? "input-border-focus"
                            : "input-border-default"
                        }`}
                      >
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-[200px] object-contain rounded-[8px] bg-[#161616]"
                        />
                        {selectedImage === "uploaded" && (
                          <div className="absolute inset-0 bg-accent-primary/20 border-2 border-accent-primary rounded-[8px] flex items-center justify-center">
                            <div className="bg-accent-primary text-[#0d0d0d] px-3 py-1 rounded-[8px] text-[12px] font-bold font-sans">
                              Selected
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedImage(undefined);
                            setImageUploadError(null);
                            if (selectedImage === "uploaded") {
                              setSelectedImage(null);
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-2 right-2 bg-black/70 rounded-full p-2 hover:bg-black/90 transition-colors"
                        >
                          <X
                            size={16}
                            weight="regular"
                            className="text-white"
                          />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-[200px] border-2 border-dashed input-border-default rounded-[8px] flex items-center justify-center cursor-pointer hover:input-border-focus transition-all duration-300"
                      >
                        <div className="text-center">
                          <ImageIconPhosphor
                            size={32}
                            weight="regular"
                            className="text-text-secondary dark:text-text-light mx-auto mb-2"
                          />
                          <p className="text-text-secondary text-[12px] font-semibold font-sans">
                            Upload your own image
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
                </div>
              </div>

              {/* Tags Input */}
              <div className="flex flex-col gap-[8px] items-start relative w-full">
                <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2 mb-2 w-full">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 bg-[#343434] dark:bg-[#343434] px-3 py-1 rounded-[8px] text-white text-[12px] font-semibold font-sans"
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
                <div
                  onClick={() => tagInputRef.current?.focus()}
                  className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                    tagInput.trim() || tags.length > 0
                      ? "input-border-focus"
                      : "input-border-default"
                  } focus-within:border-2`}
                >
                  <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={addTag}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Add tags for better searchability (Add with enter)"
                      className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text"
                    />
                  </div>
                </div>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="bg-error-bg border input-border-error relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                  <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                    <p className="text-error-text text-[14px] font-semibold font-sans transition-colors duration-300">
                      {errors.general}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-[#343434] dark:bg-[#343434] rounded-[8px] text-white hover:opacity-80 transition-opacity text-[14px] font-semibold font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !url.trim() || !name.trim()}
                  className={`px-6 py-3 rounded-[8px] text-[14px] font-bold font-sans transition-all duration-300 ${
                    !isLoading && url.trim() && name.trim()
                      ? "btn-cta cursor-pointer"
                      : "btn-cta-disabled"
                  }`}
                >
                  {isLoading ? "Adding..." : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at document body level for proper backdrop-filter support
  return typeof window !== "undefined" && document.body
    ? createPortal(modalContent, document.body)
    : null;
}
