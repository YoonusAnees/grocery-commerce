/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: ["172.20.10.3"],
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
