
import type {NextConfig} from 'next';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

let copyWebpackPluginHasRun = false;

const nextConfig: NextConfig = {
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

    // This is to solve the "topLevelAwait" issue with pdfjs-dist.
    // It prevents webpack from trying to bundle a node-specific canvas module
    // on the client.
    config.externals.push('canvas');

    // Copy pdf.js CMaps and worker to public directory only for server build
    if (isServer) {
        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps'),
                        to: path.join(process.cwd(), 'public', 'cmaps'),
                    },
                    {
                        from: path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'build', 'pdf.worker.min.mjs'),
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
