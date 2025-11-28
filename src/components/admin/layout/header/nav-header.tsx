import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/ui/sidebar"

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  GalleryVerticalEnd,
};

export function NavHeader({
  header,
}: { header: {
    name: string
    logo: string
    email: string
  }
}) {
  const LogoComponent = iconMap[header.logo];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
          <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {LogoComponent && <LogoComponent className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{header.name}</span>
                  <span className="truncate text-xs">{header.email}</span>
              </div>
          </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
