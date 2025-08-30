
import type {NextConfig} from 'next';

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
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCr9mGn2d7OWTX3B-TKxvO3kb7gB_yABdE",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "toolifyai-7sfvi.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "toolifyai-7sfvi",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "toolifyai-7sfvi.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "69818852370",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:69818852370:web:375b674cfee5e2c863e4cb",
  },
};

export default nextConfig;
