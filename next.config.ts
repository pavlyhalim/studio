
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
    serverComponentsExternalPackages: ['bcrypt', 'node-pre-gyp', '@mapbox/node-pre-gyp', 'node-loader'],
  },
  // Add Webpack config to ignore the problematic file/packages
  webpack: (config, { isServer, webpack }) => {
    // Ignore problematic native module dependencies more broadly on both server and client
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|nw-pre-gyp|node-gyp-build)$/,
      })
    );

    // Specifically ignore the problematic HTML file within the mapbox package context
    // This regex should robustly match the path regardless of OS path separators
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /index\.html$/,
        contextRegExp: /@mapbox[\\\/]node-pre-gyp[\\\/]lib[\\\/]util[\\\/]nw-pre-gyp$/,
      })
    );

    // Rule for .node files (often needed for bcrypt)
    // Check if a similar rule already exists before adding
    const hasNodeLoaderRule = config.module.rules.some(
      (rule: any) => rule.loader === 'node-loader' && rule.test?.toString() === '/\\.node$/'
    );
    if (!hasNodeLoaderRule) {
      config.module.rules.push({
        test: /\.node$/,
        loader: 'node-loader',
        options: {
          // Optional: You might need to adjust the output path depending on your setup
          // name: '[name].[ext]',
        },
      });
    }

    // Removed the ignore-loader rule as IgnorePlugin should handle this.


    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

