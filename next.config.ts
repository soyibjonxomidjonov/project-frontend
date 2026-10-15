import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${process.env.API_INTERNAL_URL || "http://localhost:8000"}/:path*` }];
  },
};
export default nextConfig;
