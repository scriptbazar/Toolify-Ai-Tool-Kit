
import type {NextConfig} from 'next';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

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
      }
    ],
  },
   webpack: (config, { isServer }) => {
    // Correctly configure the copy-webpack-plugin
    if (!isServer) {
        config.plugins = config.plugins || [];
        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
                        to: path.join(__dirname, 'public/static/chunks/pdf.worker.min.mjs'),
                    },
                ],
            })
        );
    }

    return config;
  },
};

export default nextConfig;
