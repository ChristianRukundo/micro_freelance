/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "plus.unsplash.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: process.env.NEXT_PUBLIC_API_URL + "/:path*",
            },
        ];
    },
};

module.exports = nextConfig;
