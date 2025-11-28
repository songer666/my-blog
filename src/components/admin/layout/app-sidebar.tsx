import * as React from "react";
import { data as adminData } from "./data";
import { NavMain } from "@/components/admin/layout/content/nav-main";
import { NavProjects } from "@/components/admin/layout/content/nav-projects";
import { NavUser } from "@/components/admin/layout/footer/nav-user";
import { NavHeader } from "@/components/admin/layout/header/nav-header";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/shadcn/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { caller } from "@/components/trpc/server";
import { ProjectType } from "@/server/types/project-type";

export async function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    // 服务端获取用户数据
    const res = await auth.api.getSession({headers: await headers()});
    const currentUser = res?.user;

    // 构建 header 数据
    const headerData = {
        ...adminData.header,
        email: currentUser?.email ?? adminData.header.email,
    };

    // 构建用户数据
    const userData = {
        ...adminData.user,
        avatar: currentUser?.image ?? adminData.user.avatar,
        name: currentUser?.name ?? adminData.user.name,
        email: currentUser?.email ?? adminData.user.email,
    };

    // 获取项目列表数据
    let projects: ProjectType[] = [];
    try {
        const projectsResult = await caller.project.getAll();
        projects = projectsResult.data || [];
    } catch (error) {
        console.error('获取项目列表失败:', error);
    }

    // 获取未读消息数量
    let unreadMessageCount = 0;
    try {
        unreadMessageCount = await caller.message.unreadCount();
    } catch (error) {
        console.error('获取未读消息数量失败:', error);
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <NavHeader header={headerData} />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminData.navMain} unreadMessageCount={unreadMessageCount} />
                <NavProjects projects={projects} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
