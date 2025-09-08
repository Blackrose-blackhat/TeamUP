import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   eslint: {
    dirs: ['pages', 'utils'],
     ignoreDuringBuilds: true, // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  typescript: {
    ignoreBuildErrors: true, // ⚠️ deploys even with TS errors
  },
  /* config options here */
   images: {
    remotePatterns: [
  {
    protocol: "https",
    hostname: "avatars.githubusercontent.com",
    pathname: "/**", // allow all paths
  },
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
    pathname: "/**",
  },
]
  },
};

export default nextConfig;
