/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress network errors in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Disable source maps in development to reduce network requests
  productionBrowserSourceMaps: false,
};

export default nextConfig;

