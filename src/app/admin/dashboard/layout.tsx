import { AppSidebar } from "@/components/admin/layout/app-sidebar"
import { Separator } from "@/components/shadcn/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/shadcn/ui/sidebar"
import React from "react";
import {BreadCrumbComponent} from "@/components/admin/layout/bread-crumb";

export default function AdminDashboardLayout({children}:{children:Readonly<React.ReactNode>}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <BreadCrumbComponent/>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
