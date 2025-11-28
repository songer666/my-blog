'use client';
// ^-- 确保我们可以在服务端组件中挂载 Provider
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import React, { useState } from 'react';
import { makeQueryClient } from '@/lib/query-client';
import type { AppRouter } from '@/server/app';
import superjson from "superjson";
import {getUrl} from "@/lib/utils";
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
    if (typeof window === 'undefined') {
        // 服务端：始终创建一个全新的 Query Client
        return makeQueryClient();
    }
    // 浏览器端：如果还没有，则创建一个新的 Query Client
    // 这点非常重要，避免在 React 初始渲染期间发生挂起（suspend）时
    // 重新创建新的 client。若在创建 client 之下有 suspense 边界，
    // 则可能不需要这样做。
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

/**
 * 注意：如果在本组件与可能触发挂起的代码之间没有 suspense 边界，
 * 初始化 query client 时应避免使用 useState。否则在初次渲染发生挂起时，
 * React 可能会丢弃这个 client。
 * */
export function TRPCReactProvider(
    props: Readonly<{
        children: React.ReactNode;
    }>,
) {
    const queryClient = getQueryClient();
    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: getUrl(),
                }),
            ],
        }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}
