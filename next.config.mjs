/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Project photos will live in Azure Blob Storage (W3D3-BE). next/image
    // only loads remote images from hosts listed here, so add the storage
    // account's host (<account>.blob.core.windows.net) in that task.
    remotePatterns: [],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
