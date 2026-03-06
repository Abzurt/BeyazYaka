/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Controls referrer information
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // HTTP Strict Transport Security (HSTS)
          },
        ],
      },
    ];
  },
};

export default nextConfig;
