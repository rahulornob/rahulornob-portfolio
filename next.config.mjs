/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    preloadEntriesOnStart: false,
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
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
