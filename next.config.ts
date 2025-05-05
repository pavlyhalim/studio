
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
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|@mapbox\/node-pre-gyp|nw-pre-gyp)$/, // Ignore related packages
        contextRegExp: /node_modules/, // Target only within node_modules
      })
    );

    // Specifically ignore the problematic HTML file with a slightly broader context
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /index\.html$/, // Target the specific file
        contextRegExp: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util$/, // Broaden context slightly
      })
    );


    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
