import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Games surface is a thin client: local pixel art (public/pixel) plus JSON from
     dsec-api via the server-side proxy. No remote image domains needed. */
};

export default nextConfig;
