
import type {NextConfig} from 'next';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

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
    // This is to make `pdfjs-dist` work with Next.js
    if (!isServer) {
        const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
        const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.mjs');

        config.plugins.push(new CopyPlugin({
            patterns: [
                { from: pdfWorkerPath, to: path.join(config.output.path, 'static', 'chunks') }
            ]
        }));
    }

    return config;
  },
};

export default nextConfig;
