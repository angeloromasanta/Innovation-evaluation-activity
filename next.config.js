/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Required for Firebase
    experimental: {
      serverActions: true,
    },
    // Optimization for faster builds
    compiler: {
      removeConsole: process.env.NODE_ENV === "production",
    },
    // If you're using images from external sources, add them here
    images: {
      domains: [],
    },
  }
  
  module.exports = nextConfig