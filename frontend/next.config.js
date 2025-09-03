/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '**',
            },

        ],
    },
    experimental: {
        serverActions: true,
        missingSuspenseWithCSRBailout: false,
    },
};

module.exports = nextConfig;