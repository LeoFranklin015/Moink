/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Headers for the embed page
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
      {
        // Headers for the frame page
        source: "/frame",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
  images: {},
};

export default nextConfig;
