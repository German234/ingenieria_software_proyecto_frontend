import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["capas.fopinet.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "capas.fopinet.com",
        port: "",
        pathname: "/apiv2/uploads/images/profile_images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
