
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
    // Ignore problematic native module dependencies more broadly
    // This should cover most cases where these modules cause issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|@mapbox\/node-pre-gyp|nw-pre-gyp|node-gyp-build)$/,
      })
    );

    // Specifically ignore the problematic HTML file, trying without context first
    // This file seems to cause issues with bundlers trying to parse it.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /index\.html$/,
        // Removed contextRegExp to make the ignore rule less specific and more robust
        // contextRegExp: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util$/,
      })
    );

    // Rule for .node files (often needed for bcrypt)
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader', // Use loader instead of use for single loader
    });


    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
