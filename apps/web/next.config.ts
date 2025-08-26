import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    reactCompiler: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore indexedDB and other browser-only APIs during server-side rendering
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "indexeddb": false,
        "idb-keyval": false,
        "unstorage": false
      };
      
      // Define global variables for server-side rendering
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'typeof indexedDB': JSON.stringify('undefined'),
          'typeof window': JSON.stringify('undefined'),
          'typeof localStorage': JSON.stringify('undefined'),
          'typeof sessionStorage': JSON.stringify('undefined')
        })
      );
    }
    return config;
  }
};

export default nextConfig;
