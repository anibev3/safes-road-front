import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,

    outputFileTracingIncludes: {
        '/*': ['./registry/**/*']
    },
    images: {
        domains: ['images.unsplash.com', 'api.mapbox.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com'
            }
        ]
    },
    env: {
        NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    },
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
    },
    // Support des modules transpiler
    transpilePackages: ['mapbox-gl']
};

export default withBundleAnalyzer(nextConfig);
