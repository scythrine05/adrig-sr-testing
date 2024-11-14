/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverActions: {
    bodySizeLimit: "10mb",
  },
};

export default nextConfig;
