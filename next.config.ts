
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
  // Ensure node-loader is also external if used in server components
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'node-pre-gyp', '@mapbox/node-pre-gyp', 'node-loader'],
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

    // Specifically ignore the problematic HTML file, this seems to be the most reliable way
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /index\.html$/,
        contextRegExp: /@mapbox[\\/]node-pre-gyp[\\/]lib[\\/]util[\\/]nw-pre-gyp$/, // More specific context
      })
    );

    // Rule for .node files (often needed for bcrypt)
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader', // Use loader instead of use for single loader
      options: {
        // Optional: You might need to adjust the output path depending on your setup
        // name: '[name].[ext]',
      },
    });

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
