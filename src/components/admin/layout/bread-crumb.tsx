'use client'

import React, { useEffect } from 'react'
import type {Crumb} from "@/store/breadcrumb/type";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/shadcn/ui/breadcrumb";
import {useBreadCrumbStore} from "@/store/breadcrumb/store";
import {isNil} from "lodash";
import { usePathname } from "next/navigation";
import { data as adminData } from "./data";

export function BreadCrumbComponent(){
    const pathname = usePathname();
    const { crumbs, setCrumbs } = useBreadCrumbStore(state => ({
        crumbs: state.crumbs,
        setCrumbs: state.setCrumbs
    }));

    // 根据路径自动设置面包屑
    useEffect(() => {
        const proj = adminData.projects?.find((p) => p.url === pathname);
        if (proj) {
            setCrumbs([{ title: "项目栏" }, { title: proj.title, url: proj.url }]);
            return;
        }
        const nav = adminData.navMain?.find((n) => pathname === n.url);
        if (nav) {
            setCrumbs([{ title: "管理栏" }, { title: nav.title, url: nav.url }]);
            return;
        }
        const sub = adminData.navMain?.find(
            (n) => !isNil(n.items) && n.items.some((item) => pathname === item.url),
        );
        if (sub) {
            const subNav = sub.items?.find((i) => i.url === pathname);
            if (subNav) {
                setCrumbs([
                    { title: "管理栏" },
                    { title: sub.title },
                    { title: subNav.title, url: subNav.url },
                ]);
                return;
            }
        }
        if (pathname === adminData.user.url) {
            setCrumbs([{ title: "管理栏" }, { title: "个人信息" }]);
            return;
        }
        // 处理重置密码页面
        if (pathname === '/admin/dashboard/user/reset-password') {
            setCrumbs([
                { title: "管理栏" }, 
                { title: "用户管理", url: "/admin/dashboard/user" },
                { title: "重置密码" }
            ]);
            return;
        }
        
        // 处理博客创建页面
        if (pathname === '/admin/dashboard/blog/create') {
            setCrumbs([
                { title: "管理栏" },
                { title: "博客管理", url: "/admin/dashboard/blog" },
                { title: "创建博客" }
            ]);
            return;
        }
        
        // 处理博客编辑页面 /admin/dashboard/blog/edit/[slug]
        if (pathname.startsWith('/admin/dashboard/blog/edit/')) {
            setCrumbs([
                { title: "管理栏" },
                { title: "博客管理", url: "/admin/dashboard/blog" },
                { title: "编辑博客" }
            ]);
            return;
        }
        
        // 处理项目创建页面
        if (pathname === '/admin/dashboard/projects/create') {
            setCrumbs([
                { title: "项目栏" },
                { title: "创建项目" }
            ]);
            return;
        }
        
        // 处理项目编辑页面 /admin/dashboard/projects/edit/[slug]
        if (pathname.startsWith('/admin/dashboard/projects/edit/')) {
            setCrumbs([
                { title: "项目栏" },
                { title: "编辑项目" }
            ]);
            return;
        }
        
        // 处理项目详情页面 /admin/dashboard/projects/[slug]
        if (pathname.startsWith('/admin/dashboard/projects/') &&
            pathname !== '/admin/dashboard/projects/create' &&
            !pathname.startsWith('/admin/dashboard/projects/edit/')) {
            setCrumbs([
                { title: "项目栏" },
                { title: "项目详情" }
            ]);
            return;
        }
        
        // 处理代码库详情页面 /admin/dashboard/resources/code/[slug]
        if (pathname.startsWith('/admin/dashboard/resources/code/') &&
            pathname !== '/admin/dashboard/resources/code') {
            setCrumbs([
                { title: "管理栏" },
                { title: "资源管理", url: "/admin/dashboard/resources" },
                { title: "代码资源", url: "/admin/dashboard/resources/code" },
                { title: "代码库详情" }
            ]);
            return;
        }
    }, [pathname, setCrumbs]);
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {!isNil(crumbs) && crumbs.length > 0 && crumbs.map((crumb: Crumb, index: number) => (
                    <React.Fragment key={`${index}-${crumb.title}`}>
                        <BreadcrumbItem className={'hidden md:block'}>
                            {index !== crumbs.length - 1 ? (
                                <>
                                    {crumb.url ? (
                                        <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbLink>{crumb.title}</BreadcrumbLink>
                                    )}
                                </>
                            ) : (
                                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index !== crumbs.length - 1 && <BreadcrumbSeparator/>}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}