import 'server-only'; // <-- ensure this file cannot be imported from the client
import React from 'react';
import {createTRPCOptionsProxy, TRPCQueryOptions} from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from '@/server/init';
import { makeQueryClient } from '@/lib/query-client';
import { appRouter } from '@/server/app';
import {createTRPCClient, httpLink} from "@trpc/client";
import {getUrl} from "@/lib/utils";
import {HydrationBoundary} from "@tanstack/react-query";
import {dehydrate} from "@tanstack/query-core";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const caller = appRouter.createCaller(createTRPCContext);
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});
// If your router is on a separate server, pass a client:
createTRPCOptionsProxy({
    client: createTRPCClient({
        links: [httpLink({ url: getUrl() })],
    }),
    queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {props.children}
        </HydrationBoundary>
    );
};

export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
    queryOptions: T,
) {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === 'infinite') {
        void await queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
        void await queryClient.prefetchQuery(queryOptions);
    }
}