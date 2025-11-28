"use client"

import { 
  ChevronRight, 
  type LucideIcon,
  LayoutDashboard,
  User2,
  MessageSquare,
  Bot,
  BookOpen,
  Folder
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/shadcn/ui/sidebar"
import { Badge } from "@/components/shadcn/ui/badge";
import Link from "next/link";
import {isNil} from "lodash";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  User2,
  MessageSquare,
  Bot,
  BookOpen,
  Folder,
};

export function NavMain({
  items,
  unreadMessageCount = 0,
}: {
  items: {
    title: string
    url: string
    icon?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  unreadMessageCount?: number
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>管理栏</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = item.icon ? iconMap[item.icon] : null;
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem suppressHydrationWarning>
                <CollapsibleTrigger asChild suppressHydrationWarning>
                    {!isNil(item.items) && item.items?.length > 0 ? (
                        <SidebarMenuButton tooltip={item.title}>
                            {IconComponent && <IconComponent />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    ) : (
                        <Link href={item.url}>
                            <SidebarMenuButton tooltip={item.title} className={'cursor-pointer'}>
                                {IconComponent && <IconComponent />}
                                <span>{item.title}</span>
                                {item.title === '留言管理' && unreadMessageCount > 0 && (
                                  <Badge variant="destructive" className="ml-auto">
                                    {unreadMessageCount}
                                  </Badge>
                                )}
                            </SidebarMenuButton>
                        </Link>
                    )}
                </CollapsibleTrigger>
                {!isNil(item.items) && item.items?.length > 0 && (
                    <CollapsibleContent suppressHydrationWarning>
                        <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                        <a href={subItem.url}>
                                            <span>{subItem.title}</span>
                                        </a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
