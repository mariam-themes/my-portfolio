import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // Redirect bare /blog → /en/blog (default locale)
      {
        source: '/blog',
        destination: '/en/blog',
        permanent: false,
      },
      // Redirect bare /blog/:slug → /en/blog/:slug
      {
        source: '/blog/:slug',
        destination: '/en/blog/:slug',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
