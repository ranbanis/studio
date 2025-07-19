
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add this property to allow development origins for cross-origin requests
  allowedDevOrigins: [
    // IMPORTANT: Replace this with the exact domain from your Next.js console output,
    // e.g., '9003-firebase-studio-1749794103901.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev'
    // This domain will likely change if you restart your Cloud Workstation instance.
    // For a more general approach during development, you might consider:
    // '*.cloudworkstations.dev' (use with caution, as it's a broad wildcard)
    '9003-firebase-studio-1749794103901.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev', // <-- **PASTE YOUR DOMAIN HERE**
  ],
};

export default nextConfig;
