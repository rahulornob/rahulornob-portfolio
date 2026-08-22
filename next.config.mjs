/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    preloadEntriesOnStart: false,
    webpackMemoryOptimizations: true,
  },
  async redirects() {
    return [
      {
        source: "/studio/:path*",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
