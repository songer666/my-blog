import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import {appRouter} from "@/server/app";
import {createTRPCContext, CreateTRPCContextType} from "@/server/init";

const handler = async (req: Request) => {
    // ⭐ 只在 POST 的时候打 raw body，避免太吵
    if (req.method === 'POST') {
        const url = new URL(req.url);
        const clone = req.clone();
        const rawBody = await clone.text();

        console.log('🔵 [tRPC raw request]');
        console.log('  url:', url.pathname + url.search);
        console.log('  method:', req.method);
        console.log('  content-type:', req.headers.get('content-type'));
        console.log('  body sample:', rawBody.slice(0, 100));
    }
    
    try {
        return await fetchRequestHandler({
            endpoint: '/api/trpc',
            req,
            router: appRouter,
            createContext: createTRPCContext,
            onError({ error, path, input, type }) {
                console.error('🔴 [tRPC onError]');
                console.error('  path:', path);
                console.error('  type:', type);
                console.error('  input:', input);
                console.error('  error:', error);
            },
        });
    } catch (err) {
        console.error('💥 [tRPC handler fatal error]', err);
        return new Response('Internal Server Error', { status: 500 });
    }
};
export { handler as GET, handler as POST };