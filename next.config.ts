import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import webpack from "webpack";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  allowedDevOrigins: [
    "localhost:3000",
    "localhost:4000",
    "localhost:9002",
    "*.cloudworkstations.dev",
  ],

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
    config.resolve = {
      ...(config.resolve ?? {}),
      fallback: {
        ...(config.resolve?.fallback ?? {}),
        process: require.resolve("process/browser"),
        stream: require.resolve("stream-browserify"),
        fs: false,
        path: false,
        os: false,
        perf_hooks: false,
        jquery: false,
      },
      alias: {
        ...(config.resolve?.alias ?? {}),
        handlebars: path.resolve(
          __dirname,
          "node_modules/handlebars/dist/handlebars.min.js"
        ),
      },
    };

    config.module = {
      ...(config.module ?? {}),
      rules: [
        ...(config.module?.rules ?? []),
        { test: /\.html$/, include: /node_modules/, use: "null-loader" },
        { test: /\.node$/, use: "node-loader" },
        { test: /@opentelemetry\/exporter-jaeger/, use: "null-loader" },
        { test: /handlebars\/lib\/index\.js$/, use: "null-loader" },
        { test: /node:.*$/, use: "null-loader" },
      ],
    };

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
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "production"
        ),
      }),
      new webpack.ProvidePlugin({
        $: ["jquery", "jQuery"],
        jQuery: ["jquery", "jQuery"],
      }),
      new webpack.NormalModuleReplacementPlugin(
        /^node:perf_hooks$/,
        require.resolve("path").replace(/path$/, "empty")
      ),
      new webpack.NormalModuleReplacementPlugin(
        /moment-timezone\/data\/packed\/latest\.json/,
        require.resolve("path").replace(/path$/, "empty")
      ),
    ];

    return config;
  },
};

export default nextConfig;
