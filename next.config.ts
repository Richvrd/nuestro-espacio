import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    // ✅ Permite que tu IP local acceda a los recursos de desarrollo de Next.js
  allowedDevOrigins: ['192.168.0.12', '*'],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;