/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["assets.co.dev"],
  },
  // Optimize for production builds
  swcMinify: true,
  // Configure build output
  output: 'standalone',
  // Optimize webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only enable minification in production
    config.optimization.minimize = !dev;
    
    // Add cache groups
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  }
};

export default nextConfig;