import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    reactCompiler: true
  }
};

export default nextConfig;
