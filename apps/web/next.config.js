const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/database"],
    experimental: {
        serverComponentsExternalPackages: ["@prisma/client", "prisma"],
        outputFileTracingRoot: path.join(__dirname, "../../"),
    },
    output: "standalone",
};

module.exports = nextConfig;
