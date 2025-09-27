
import type {NextConfig} from 'next';
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
    // This is to make `pdfjs-dist` work with Next.js
    const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
    const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.mjs');
    
    // Add an alias for 'pdfjs-dist'
    config.resolve.alias['pdfjs-dist'] = pdfjsDistPath;
    
    // Copy the worker file to the static directory
    if (!isServer) {
        config.entry().then((entry: any) => {
            entry['main.js'].push(pdfWorkerPath);
            return entry;
        });
    }

    return config;
  },
};

export default nextConfig;
