/** @type {import('next').NextConfig} */
const { webpack } = require('webpack'); // Use CommonJS import

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  /* config options here */
  typescript: {
    // Only ignore during development
    ignoreBuildErrors: !isProd,
  },
  eslint: {
    // Only ignore during development
    ignoreDuringBuilds: !isProd,
  },
  // Add more strict checks in production
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add Firebase storage domain for production images
      {
        protocol: 'https',
        hostname: '*.googleapis.com', // Firebase Storage URLs
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
  },
  // Add bcrypt and related modules to serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'node-pre-gyp', '@mapbox/node-pre-gyp', 'node-loader'],
    // Enable app directory caching
    appDir: true,
    // Enable server actions
    serverActions: true,
  },
  // Add Webpack config to ignore the problematic file/packages
  webpack: (config, { isServer }) => {
    // Add rule to handle HTML files - use null loader to ignore them
    config.module.rules.push({
      test: /\.html$/,
      include: /node_modules/,
      use: 'null-loader',
    });

    // Ignore problematic native module dependencies more broadly
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|nw-pre-gyp|node-gyp-build)$/,
      })
    );

    // More comprehensive ignore pattern for mapbox HTML files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.html$/,
        contextRegExp: /@mapbox\/node-pre-gyp/,
      })
    );

    // Rule for .node files (often needed for bcrypt)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Important: return the modified config
    return config;
  },
  // Output directory configuration
  output: 'standalone',
};

module.exports = nextConfig;