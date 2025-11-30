import { cn } from "@/lib/utils"

export const navbarStyles = {
    // 导航栏容器
    container: (scrolled: boolean) =>
        cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
            scrolled ? "backdrop-blur-md bg-background/80" : "bg-transparent"
        ),

    // 内部容器
    inner: "max-w-7xl mx-auto px-4 sm:px-6 relative",

    // Flex 布局
    flexLayout: "flex items-center justify-between h-16 sm:h-20",

    // 左侧容器（移动端：菜单按钮+头像）
    leftSection: "flex items-center gap-3",

    // 头像链接
    avatarLink: "flex-shrink-0 transition-transform duration-300 hover:scale-110",

    // 头像容器（hover时显示优雅的猫咪紫边框）
    avatarContainer:
        `relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden 
        ring-0 hover:ring-2 hover:ring-purple-500/70 dark:hover:ring-purple-400/60 
        transition-all duration-300`.trim(),

    // 导航链接容器（平板/电脑端 - 绝对定位居中）
    navLinksContainer: (scrolled: boolean) =>
        cn(
            "hidden md:flex items-center px-6 py-2 rounded-full transition-all duration-500 absolute left-1/2 -translate-x-1/2 w-auto",
            scrolled
                ? "bg-transparent"
                : "border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm"
        ),

    // 导航列表
    navList: "flex items-center gap-2",

    // 导航链接项 - 纯静态优化
    navLinkItem: cn(
        "font-display",
        "px-4 py-2 rounded-full text-sm font-medium",
        "whitespace-nowrap",
        "transition-colors duration-150",
        "text-foreground/70",
        "hover:text-purple-600 dark:hover:text-purple-400",
        "hover:scale-[1.02]"
    ),

    // 导航链接项 - 选中状态（服务端渲染，无延迟）
    navLinkItemActive: cn(
        "!text-purple-600 dark:!text-purple-400",
        "!font-semibold"
    ),

    // 主题切换按钮
    themeToggle: cn(
        "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
        "transition-all duration-300",
        "text-foreground/70 hover:text-foreground",
        "hover:bg-muted"
    ),

    // 移动端菜单按钮
    mobileMenuButton: cn(
        "md:hidden w-10 h-10 rounded-full flex items-center justify-center",
        "transition-all duration-300",
        "text-foreground/70 hover:text-foreground",
        "hover:bg-muted"
    ),

    // 移动端遮罩层
    mobileOverlay: cn(
        "md:hidden fixed inset-0 z-40",
        "bg-background/60 backdrop-blur-sm",
        "animate-in fade-in-0 duration-300"
    ),

    // 移动端下拉菜单
    mobileDropdown: {
        container: cn(
            "md:hidden absolute top-full left-0 right-0 mt-0 z-50",
            "bg-background/95 backdrop-blur-xl border-b border-border",
            "shadow-lg animate-in slide-in-from-top-2 duration-300"
        ),
        nav: "px-4 py-3 space-y-0.5",
        item: cn(
            "font-display",
            "flex items-center gap-3 px-4 py-2.5 rounded-lg w-full",
            "transition-all duration-200",
            "text-foreground/80",
            "font-medium text-sm",
            // hover 样式 - 紫色和阴影
            "hover:text-purple-600 dark:hover:text-purple-400",
            "hover:drop-shadow-[0_1px_2px_rgba(168,85,247,0.2)]",
            "hover:bg-purple-50/30 dark:hover:bg-purple-950/10"
        ),
        itemActive: cn(
            "text-purple-600 dark:text-purple-400",
            "drop-shadow-[0_1px_2px_rgba(168,85,247,0.3)]",
            "font-semibold",
            "bg-purple-50/50 dark:bg-purple-950/20"
        ),
        separator: "h-px bg-border my-2",
        header: "font-display px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
    },

    // 纯 CSS 下拉菜单
    dropdown: {
        // wrapper 包含按钮和下拉内容，hover 整个区域都保持显示
        wrapper: "relative group",
        
        trigger: cn(
            "flex items-center gap-1",
            "cursor-pointer",
            // 移除默认的 outline
            "outline-none focus:outline-none"
        ),
        
        icon: cn(
            "w-4 h-4 transition-transform duration-200",
            "group-hover:rotate-180",
            "group-focus-within:rotate-180"
        ),
        
        content: cn(
            // 默认隐藏
            "absolute top-full left-1/2 -translate-x-1/2",
            // 关键：使用 pt-2 创建连接区域，鼠标移动时不会断开
            "pt-2",
            "opacity-0 invisible pointer-events-none",
            "group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto",
            "group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto",
            "transition-all duration-200"
        ),
        
        // 实际的下拉框内容
        contentInner: cn(
            "bg-background/95 backdrop-blur-xl",
            "border border-border rounded-lg shadow-lg",
            "min-w-[160px]",
            // 动画
            "translate-y-[-8px] group-hover:translate-y-0",
            "group-focus-within:translate-y-0",
            "transition-all duration-200"
        ),
        
        list: "p-1",
        
        item: cn(
            "font-display",
            "flex items-center gap-3 px-4 py-3 rounded-lg",
            "text-sm font-medium text-foreground/80",
            "whitespace-nowrap",
            "transition-colors duration-150",
            "hover:text-purple-600 dark:hover:text-purple-400",
            "hover:bg-purple-50/30 dark:hover:bg-purple-950/10"
        ),
        
        itemActive: cn(
            "!text-purple-600 dark:!text-purple-400",
            "!font-semibold",
            "bg-purple-50/50 dark:bg-purple-950/20"
        ),
    },
}
