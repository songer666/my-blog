// ✅ 前台首页 - 通过自定义域名访问时会看到这个页面
// 域名会通过 vercel.json 的 rewrite 规则映射到这里
import React from 'react'
import { getQueryClient, trpc } from '@/components/trpc/server'
import { HeroSection } from '@/components/root/home/hero-section'
import { RecentSection } from '@/components/root/home/recent-section'
import { RecentBlogs } from '@/components/root/home/recent-blogs'
import { RecentProjects } from '@/components/root/home/recent-projects'

const RootPage = async () => {
    // 获取最近的博客文章（6篇）
    const queryClient = getQueryClient()
    const postsResponse = await queryClient.fetchQuery(
        trpc.post.getPublicPosts.queryOptions({ page: 1, limit: 6 })
    )
    const recentPosts = postsResponse.data?.posts || []

    // 获取最近的项目（3个）
    const projectsResponse = await queryClient.fetchQuery(
        trpc.project.getAllPublicProjects.queryOptions()
    )
    const recentProjects = (projectsResponse.data || []).slice(0, 3)

    return (
        <div className="min-h-screen">
            {/* Hero 区域 - 占满屏幕高度减去 navbar */}
            <HeroSection />

            {/* 最近博客区域 */}
            <RecentSection
                title="最近博客"
                moreText="更多博客"
                moreLink="/root/blog"
            >
                <RecentBlogs posts={recentPosts} />
            </RecentSection>

            {/* 最近项目区域 */}
            <RecentSection
                title="最近项目"
                moreText="更多项目"
                moreLink="/root/projects"
            >
                <RecentProjects projects={recentProjects} />
            </RecentSection>
        </div>
    )
}

export default RootPage
