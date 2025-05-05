
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
  // Add bcrypt and related modules to serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'node-pre-gyp', '@mapbox/node-pre-gyp'],
  },
  // Add Webpack config to ignore the problematic file/packages
  webpack: (config, { isServer, webpack }) => {
    // Ignore problematic native module dependencies globally
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|@mapbox\/node-pre-gyp|nw-pre-gyp)$/,
        // Removed contextRegExp to apply ignore more broadly
      })
    );

    // Specifically ignore the problematic HTML file within the correct directory
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /index\.html$/,
        contextRegExp: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util$/, // Keep this specific context
      })
    );

    // Add rule to handle .node files if bcrypt is causing issues
    // (Less likely the cause of *this* error, but good practice for bcrypt)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader', // Using 'use' for consistency
    });


    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
