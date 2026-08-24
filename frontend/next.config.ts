import type { NextConfig } from "next";

const isAppsInTossBuild = process.env.APP_BUILD_TARGET === "ait";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isAppsInTossBuild
    ? { output: "export" }
    : {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: "http://backend:8080/api/:path*",
            },
          ];
        },
      }),
};

export default nextConfig;
