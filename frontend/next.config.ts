import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost", port: "4000" },
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
