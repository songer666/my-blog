'use client'
import {
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar"
import { AvatarSkeleton } from "@/components/skeleton/admin-skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/shadcn/ui/sidebar"
import { authApi } from "@/client/auth-api";
import {useRouter} from "next/navigation";
import {isNil} from "lodash";
import {toast} from "sonner";
import Link from "next/link";

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    url: string
    avatar: string
  }
}) {
    const router = useRouter();
    const {isMobile} = useSidebar();
    const logOut = async () => {
        try {
            const {data} = await authApi.signOut();
            if (!isNil(data) && data.success)
                router.refresh();
        } catch (error: any) {
            toast.error("退出登录失败",{
                description: error.message,
                position: 'top-center'
            })
        }
    }
  return (
    <SidebarMenu>
      <SidebarMenuItem suppressHydrationWarning>
        <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {user.avatar ? (
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    <AvatarSkeleton className="w-8 h-8 rounded-lg" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <AvatarSkeleton className="w-8 h-8 rounded-lg" />
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {user.avatar ? (
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      <AvatarSkeleton className="w-8 h-8 rounded-lg" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <AvatarSkeleton className="w-8 h-8 rounded-lg" />
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href={user.url} className={'flex gap-2 items-center'}>
                    <Sparkles />
                    个人信息
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <button onClick={logOut} className={'flex gap-2 items-center cursor-pointer'}>
                    <LogOut />
                    退出登录
                </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
