// Utility functions for fetching URL metadata

export interface URLMetadata {
  title: string;
  description?: string;
  image?: string;
}

/**
 * Fetches metadata from a URL using the Next.js API route
 * This avoids CORS issues and provides better reliability
 */
export async function fetchURLMetadata(url: string): Promise<URLMetadata> {
  try {
    // Validate URL
    new URL(url);
  } catch {
    return {
      title: "Untitled",
      description: undefined,
      image: undefined,
    };
  }

  try {
    // Use the Next.js API route to fetch metadata
    const response = await fetch(
      `/api/metadata?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title || "Untitled",
      description: data.description || undefined,
      image: data.image || undefined,
    };
  } catch (error) {
    console.error("Error fetching URL metadata:", error);
    // Return fallback metadata
    try {
      const urlObj = new URL(url);
      return {
        title: urlObj.hostname,
        description: undefined,
        image: undefined,
      };
    } catch {
      return {
        title: "Untitled",
        description: undefined,
        image: undefined,
      };
    }
  }
}

/**
 * Generates a screenshot/thumbnail of a website (above the fold)
 * Uses Puppeteer via API route to capture actual website screenshots
 */
export async function generateWebsiteSnapshot(
  url: string
): Promise<string | undefined> {
  try {
    // Validate URL
    new URL(url);
  } catch {
    return undefined;
  }

  try {
    // Call the screenshot API route
    const response = await fetch(
      `/api/screenshot?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to capture screenshot: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the base64 data URL if available
    if (data.image) {
      return data.image;
    }

    // Fallback: try to get Open Graph image from metadata
    try {
      const metadata = await fetchURLMetadata(url);
      if (metadata.image) {
        return metadata.image;
      }
    } catch {
      // Continue to final fallback
    }

    // Final fallback: favicon
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=256`;
    } catch {
      return undefined;
    }
  } catch (error) {
    console.error("Error generating website snapshot:", error);

    // Fallback: try Open Graph image
    try {
      const metadata = await fetchURLMetadata(url);
      if (metadata.image) {
        return metadata.image;
      }
    } catch {
      // Continue to final fallback
    }

    // Final fallback: favicon
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=256`;
    } catch {
      return undefined;
    }
  }
}
