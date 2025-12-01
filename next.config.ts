import type { NextConfig } from "next";

const externals: string[] = ['next-mdx-remote-client'];
if (process.env.TURBOPACK) {
    externals.push('rehype-prism-plus');
}

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: true,
    serverExternalPackages: externals,
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 增加请求体大小限制到 1GB（支持大文件上传）
    experimental: {
        serverActions: {
            bodySizeLimit: '1gb',
        },
    },
    // 配置允许的图片域名
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.r2.cloudflarestorage.com',
            },
            {
                protocol: 'https',
                hostname: '**.r2.dev',
            },
        ],
        // 允许 SVG（需要注意安全性）
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

export default nextConfig;
