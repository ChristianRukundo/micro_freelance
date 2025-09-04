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
        serverActions: {},
    },
    transpilePackages: ['framer-motion'],
    webpack: (config) => {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
        });
        return config;
    },
};

module.exports = nextConfig;