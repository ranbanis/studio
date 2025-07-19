
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
    // Using a wildcard to allow any Firebase Studio development domain.
    '*.cloudworkstations.dev'
  ],
};

export default nextConfig;
