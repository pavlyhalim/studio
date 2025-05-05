
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
    // Ensure this rule doesn't conflict with other loaders
    // Check if a similar rule already exists before adding
    const nodeLoaderRule = {
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        // Optional: You might need to adjust the output path depending on your setup
        // name: '[name].[ext]',
      },
    };
    // Avoid adding duplicate rules
    const hasNodeLoaderRule = config.module.rules.some(
      (rule: any) => rule.test?.toString() === '/\\.node$/'
    );
    if (!hasNodeLoaderRule) {
      config.module.rules.push(nodeLoaderRule);
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
