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
    // Dynamically import puppeteer (only when needed)
    const puppeteer = await import("puppeteer");

    // Launch browser
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport to capture above-the-fold content
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
      });

      // Navigate to the page with a timeout
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000, // 30 second timeout
      });

      // Wait a bit for any lazy-loaded content
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Take screenshot of above-the-fold content
      const screenshot = await page.screenshot({
        type: "jpeg",
        quality: 85,
        clip: {
          x: 0,
          y: 0,
          width: 1280,
          height: 720,
        },
      });

      await browser.close();

      // Convert screenshot to base64 data URL
      // Note: For production, you might want to upload this to Firebase Storage
      // and return the Storage URL instead to avoid large base64 strings
      const base64 = (screenshot as Buffer).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      return NextResponse.json({
        image: dataUrl,
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error: any) {
    console.error("Error taking screenshot:", error);
    return NextResponse.json(
      {
        error: "Failed to capture screenshot",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
