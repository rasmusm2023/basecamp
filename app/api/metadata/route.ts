import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BasecampBot/1.0; +https://basecamp.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract metadata using regex (simpler than DOMParser for server-side)
    const titleMatch =
      html.match(
        /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    const descriptionMatch =
      html.match(
        /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      );
    const description = descriptionMatch ? descriptionMatch[1].trim() : null;

    const imageMatch =
      html.match(
        /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']twitter:image:src["']\s+content=["']([^"']+)["']/i
      );
    let image = imageMatch ? imageMatch[1].trim() : null;

    // Resolve relative image URLs
    if (image && !image.startsWith("http")) {
      try {
        const urlObj = new URL(url);
        image = new URL(image, urlObj.origin).href;
      } catch {
        image = null;
      }
    }

    // Fallback to hostname if no title found
    let finalTitle = title;
    if (!finalTitle) {
      try {
        const urlObj = new URL(url);
        finalTitle = urlObj.hostname;
      } catch {
        finalTitle = "Untitled";
      }
    }

    return NextResponse.json({
      title: finalTitle,
      description: description || undefined,
      image: image || undefined,
    });
  } catch (error: any) {
    console.error("Error fetching metadata:", error);

    // Return fallback metadata
    try {
      const urlObj = new URL(url);
      return NextResponse.json({
        title: urlObj.hostname,
        description: undefined,
        image: undefined,
      });
    } catch {
      return NextResponse.json({
        title: "Untitled",
        description: undefined,
        image: undefined,
      });
    }
  }
}
