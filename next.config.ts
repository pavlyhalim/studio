
import type {NextConfig} from 'next';
import webpack from 'webpack'; // Import webpack

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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add bcrypt to serverComponentsExternalPackages to prevent bundling issues
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
  },
  // Add Webpack config to ignore the problematic file
  webpack: (config, { isServer }) => {
    // Use Webpack's IgnorePlugin
    config.plugins.push(
      new webpack.IgnorePlugin({
        // Match the specific problematic file path pattern
        resourceRegExp: /@mapbox\/node-pre-gyp\/lib\/util\/nw-pre-gyp\/index\.html$/,
      })
    );

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
