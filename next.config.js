// Load environment variables
require('./loadEnv');

const compress = process.env.NEXT_COMPRESS
  ? process.env.NEXT_COMPRESS === 'true'
  : true;
const assetPrefix = process.env.NEXT_PUBLIC_CDN_URL || '';
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || null;
const customDomainName = process.env.SERVICE_WEB_CUSTOM_DOMAIN_NAME || '';

const remotePatterns = [];
const headers = [];
const rewrites = {};
const redirects = [];

if (assetPrefix) {
  // Allow the Image component to load images from the CDN
  remotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME,
  });
}

if (buildId) {
  // If the `buildId` is present in the path, remove it
  rewrites.beforeFiles = [
    {
      source: `/${buildId}/:path*`,
      destination: '/:path*',
    },
  ];

  // Also add a cache control header as these resources are immutable for each build
  headers.push({
    source: `/${buildId}/:path*`,
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  });
}

if (customDomainName) {
  // Add a canonical host name redirect
  redirects.push({
    source: '/:path*',
    missing: [
      {
        type: 'host',
        value: customDomainName,
      },
    ],
    destination: `https://${customDomainName}/:path*`,
    permanent: true,
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['applicationinsights', 'pino'],
  },
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress,
  assetPrefix,
  generateBuildId: async () => {
    return buildId;
  },
  images: {
    remotePatterns,
  },
  async headers() {
    return headers;
  },
  async rewrites() {
    return rewrites;
  },
  async redirects() {
    return redirects;
  },
  env: {
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_REGION: process.env.PINECONE_REGION,
    PINECONE_CLOUD: process.env.PINECONE_CLOUD,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE,
  },
};

module.exports = nextConfig;
