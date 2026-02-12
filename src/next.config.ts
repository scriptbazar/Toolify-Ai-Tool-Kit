
import type {NextConfig} from 'next';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'clsx', 'framer-motion'],
    serverExternalPackages: ['genkit', '@genkit-ai/core', '@genkit-ai/google-genai', '@opentelemetry/sdk-node'],
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    config.externals.push('handlebars');
    config.externals.push('firebase-admin');
    config.externals.push('@google-cloud/firestore');

    if (!isServer) {
        config.externals.push('canvas');
    }
    config.externals.push('pdfjs-dist/build/pdf.worker.min.mjs');

    if (!config.resolve) {
      config.resolve = {};
    }
     config.resolve.alias = {
      ...config.resolve.alias,
      'node:process': 'process/browser',
    };

    config.plugins.push(new NodePolyfillPlugin());
    
    return config;
  },
};

export default nextConfig;
