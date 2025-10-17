
import { createRequire } from 'node:module';
const customRequire = createRequire(import.meta.url);

import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    
    config.externals.push('handlebars');

    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['node:process'] = 'process/browser';

    config.externals.push('canvas');

    if (isServer) {
        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.join(path.dirname(customRequire.resolve('pdfjs-dist/package.json')), 'cmaps'),
                        to: path.join(process.cwd(), 'public', 'cmaps'),
                    },
                     {
                        from: path.join(path.dirname(customRequire.resolve('pdfjs-dist/package.json')), 'build', 'pdf.worker.min.mjs'),
                        to: path.join(process.cwd(), 'public'),
                    }
                ],
            })
        );
    }
    
    return config;
  },
};

export default nextConfig;
