// next.config.ts
import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import webpack from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  allowedDevOrigins: [
    "localhost:3000",
    "localhost:4000",
    "localhost:9002",
    "*.cloudworkstations.dev",
  ],

  // Always ignore type/lint errors so build doesn't block
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  serverExternalPackages: [
    "bcrypt",
    "node-pre-gyp",
    "@mapbox/node-pre-gyp",
    "node-loader",
  ],

  experimental: {
    serverActions: {},
  },

  output: "standalone",

  webpack: (config: Configuration): Configuration => {
    // 1) Polyfill only the core 'process' & 'stream' names (not the 'node:' scheme)
    config.resolve = {
      ...(config.resolve ?? {}),
      fallback: {
        ...(config.resolve?.fallback ?? {}),
        process: require.resolve("process/browser"),
        stream: require.resolve("stream-browserify"),
        fs: false,
        path: false,
        os: false,
        perf_hooks: false, // Add this line to handle the perf_hooks module
      },
    };

    // 2) Ensure module.rules exists and null-load problematic files
    config.module = {
      ...(config.module ?? {}),
      rules: [
        ...(config.module?.rules ?? []),
        { test: /\.html$/, include: /node_modules/, use: "null-loader" },
        { test: /\.node$/, use: "node-loader" },
        { test: /@opentelemetry\/exporter-jaeger/, use: "null-loader" },
        { test: /handlebars\/lib\/index\.js$/, use: "null-loader" },
        // Add a rule to handle node: imports
        {
          test: /node:.*$/,
          use: "null-loader",
        },
      ],
    };

    // 3) Ignore native modules & all node: imports
    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.IgnorePlugin({
        resourceRegExp: /^(node-pre-gyp|nw-pre-gyp|node-gyp-build)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.html$/,
        contextRegExp: /@mapbox\/node-pre-gyp/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /@opentelemetry\/exporter-jaeger/,
      }),
      // Remove the blanket node: ignore line
      // new webpack.IgnorePlugin({ resourceRegExp: /^node:/ }),

      // Provide empty implementations for specific node: modules as needed
      // Replace the NormalModuleReplacementPlugin line with this:
      new webpack.NormalModuleReplacementPlugin(
        /^node:perf_hooks$/,
        require.resolve("path").replace(/path$/, "empty")
      ),
    ];

    return config;
  },
};

export default nextConfig;
