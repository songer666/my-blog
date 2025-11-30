import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {isNil} from "lodash";
import {notFound} from "next/navigation";

const ADMIN_HOST = process.env.ADMIN_HOST || 'localhost:3000';
const authConfig = {
    protectedPages: ['/admin/dashboard'],
};

export const config = {
    runtime: 'nodejs',
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|woff|woff2|ttf|eot|otf|css|scss|sass|less|js|mjs|pdf|doc|docx|txt|md|zip|rar|7z|tar|gz|mp3|mp4|avi|mov|wav|flac)$|sitemap\\.xml|robots\\.txt|manifest\\.json|sw\\.js|workbox-.*\\.js).*)',
    ],
};

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin') && hostname !== ADMIN_HOST) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 需要认证的页面路由
    const protectedRoutes = authConfig.protectedPages;
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        return authPageProtectedHandler(request);
    }
    if (pathname.startsWith('/admin')) {
        return authSignInHandler(request);
    }

    // 默认处理
    return NextResponse.next();
}
// 认证路由处理函数
const authPageProtectedHandler = async (request: NextRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isAuthenticated = !isNil(session?.user);

        if (!isAuthenticated) {
            // 创建登录URL并添加回调参数
            const loginUrl = new URL('/admin', request.url);
            loginUrl.searchParams.set(
                'callbackUrl',
                request.nextUrl.pathname + request.nextUrl.search,
            );
            return NextResponse.redirect(loginUrl);
        }

        // 用户已认证，继续处理请求
        return NextResponse.next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        // 发生错误时也重定向到登录页面，同样添加回调参数
        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }
};

const authSignInHandler = async (request: NextRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isAuthenticated = !isNil(session?.user);

        if (isAuthenticated) {
            const { callbackUrl } = request.nextUrl.searchParams as { callbackUrl?: string };
            const redirectUrl = new URL(isNil(callbackUrl) ? '/admin/dashboard' : callbackUrl, request.url);

            return NextResponse.redirect(redirectUrl);
        }

        // 用户已认证，继续处理请求
        return NextResponse.next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.next();
    }
};