
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
  },
  allowedDevOrigins: [
      "https://6000-firebase-studio-1756184305311.cluster-52r6vzs3ujeoctkkxpjif3x34a.cloudworkstations.dev"
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
   webpack: (config, { isServer }) => {
    config.externals.push({
      "handlebars": "commonjs handlebars"
    })
    
    // This is the correct way to prevent webpack from trying to resolve
    // a server-side library on the client.
    if (!isServer) {
        config.resolve.alias = {
            ...config.resolve.alias,
            "handlebars": false,
        };
    }
    
    return config;
  },
};

export default nextConfig;
    
