/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/database"],
    experimental: {
        serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    },
    output: "standalone",
};

module.exports = nextConfig;
