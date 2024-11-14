/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverActions: {
    bodySizeLimit: "5mb",
  },
};

export default nextConfig;
