
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
  webpack: (config, { isServer, webpack }) => {
    // Use Webpack's IgnorePlugin to exclude the problematic file/module
    // Try a simpler regex pattern
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@mapbox\/node-pre-gyp/,
        // Optionally, you can provide a context to narrow down the ignore scope
        // contextRegExp: /node_modules/,
      })
    );

    // Ignore specific problematic file as a fallback
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /nw-pre-gyp\/index\.html$/,
        // contextRegExp: /node-pre-gyp\/lib\/util/, // More specific context if needed
      })
    );


    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
