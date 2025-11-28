"use client"

import { useState } from "react"
import {
    Eye,
    MoreHorizontal,
    Trash2,
    Plus,
    Folder,
    Rocket,
    Code,
    Laptop,
    Smartphone,
    Globe,
    Database,
    Cloud,
    Cpu,
    Zap,
    Box,
    Package,
    Layers,
    Component,
    Briefcase,
    Sparkles,
    Star,
    Heart,
    Trophy,
    Target,
    type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/shadcn/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog"
import Link from "next/link"
import { ProjectType } from "@/server/types/project-type"
import { useRouter } from "next/navigation"
import { useProjectOperations } from "@/client/project-api"

// 项目图标数组（20个）
const projectIcons: LucideIcon[] = [
  Rocket,      // 0
  Code,        // 1
  Laptop,      // 2
  Smartphone,  // 3
  Globe,       // 4
  Database,    // 5
  Cloud,       // 6
  Cpu,         // 7
  Zap,         // 8
  Box,         // 9
  Package,     // 10
  Layers,      // 11
  Component,   // 12
  Briefcase,   // 13
  Sparkles,    // 14
  Star,        // 15
  Heart,       // 16
  Trophy,      // 17
  Target,      // 18
  Folder,      // 19
];

export function NavProjects({
  projects,
}: {
  projects: ProjectType[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { deleteProject } = useProjectOperations()
  
  // 控制删除对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null)

  // 打开删除确认对话框
  const openDeleteDialog = (projectId: string, projectTitle: string) => {
    setProjectToDelete({ id: projectId, title: projectTitle })
    setDeleteDialogOpen(true)
  }

  // 确认删除项目
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      await deleteProject(projectToDelete.id)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('删除项目失败:', error)
    }
  }

  // 根据索引获取图标
  const getProjectIcon = (index: number): LucideIcon => {
    return projectIcons[index % projectIcons.length];
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>项目栏</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project, index) => {
          const IconComponent = getProjectIcon(index);
          
          return (
            <SidebarMenuItem key={project.id} suppressHydrationWarning>
              <SidebarMenuButton asChild>
                <Link href={`/admin/dashboard/project/${project.id}`}>
                  <IconComponent />
                  <span>{project.title}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild suppressHydrationWarning>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/dashboard/project/${project.id}`}>
                      <Eye className="text-muted-foreground" />
                      <span>查看项目</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => openDeleteDialog(project.id, project.title)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="text-destructive" />
                    <span>删除项目</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="text-sidebar-foreground/70 cursor-pointer">
            <Link href="/admin/dashboard/project/create">
              <Plus className="text-sidebar-foreground/70" />
              <span>创建项目</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      
      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除项目 <span className="font-semibold text-foreground">"{projectToDelete?.title}"</span> 吗？
              <br />
              此操作无法撤销，项目的所有数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}
