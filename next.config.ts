
import type {NextConfig} from 'next';

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
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    // The "handlebars" library is a sub-dependency of genkit, and it uses
    // an old "require.extensions" feature that is not supported by webpack.
    // This can be worked around by telling webpack to not try and bundle the
    // "handlebars" library.
    config.externals.push('handlebars');

    // These libraries are large and should be handled carefully.
    // 'canvas' is a server-side dependency for node-canvas, which might be used by pdfjs-dist on the server.
    // We mark it as external to prevent webpack from trying to bundle it for the client.
    if (!isServer) {
        config.externals.push('canvas');
    }
    config.externals.push('pdfjs-dist/build/pdf.worker.min.mjs');


    // This alias is necessary to resolve the 'node:process' import used by
    // some dependencies, which is not supported by Webpack by default.
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['node:process'] = 'process/browser';
    
    return config;
  },
};

export default nextConfig;

    
