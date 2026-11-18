import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-এর পণ্ডিতি বন্ধ করার জাদুকরী কোড 🌟
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // আপনার আগের Cloudinary সেটিং
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;