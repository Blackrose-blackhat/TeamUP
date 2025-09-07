import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
