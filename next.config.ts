import type { NextConfig } from "next";

// Static SPA export: `next build` produces ./out, served by nginx:alpine.
// Backend base URL is read at build time from NEXT_PUBLIC_API_BASE_URL.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
