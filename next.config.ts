
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // This is required for the middleware to be able to run in the Node.js runtime.
    nodeMiddleware: true,
  },
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
      }
    ],
  },
  webpack: (config, { isServer }) => {
    //
    // The "handlebars" library is a sub-dependency of genkit, and it uses
    // an old "require.extensions" feature that is not supported by webpack.
    //
    // This can be worked around by telling webpack to not try and bundle the
    // "handlebars" library.
    //
    config.externals.push('handlebars');

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



