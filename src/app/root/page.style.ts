import { cn } from "@/lib/utils"

export const pageStyles = {
  // 主容器
  container: "min-h-[300vh]",

  // 顶部内容区域
  hero: {
    wrapper: "pt-32 px-6",
    content: "max-w-4xl mx-auto text-center",
    title: "text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
    subtitle: "text-lg sm:text-xl text-muted-foreground mb-8",
    hint: "text-sm text-muted-foreground",
  },

  // 测试内容区域
  sections: {
    wrapper: "max-w-4xl mx-auto px-6 mt-32 space-y-32",
    base: "p-8 sm:p-12 rounded-2xl backdrop-blur-sm border border-border/50",
    section1: cn(
      "p-8 sm:p-12 rounded-2xl backdrop-blur-sm border border-border/50",
      "bg-gradient-to-br from-primary/5 to-purple-600/5"
    ),
    section2: cn(
      "p-8 sm:p-12 rounded-2xl backdrop-blur-sm border border-border/50",
      "bg-gradient-to-br from-orange-500/5 to-pink-600/5"
    ),
    section3: cn(
      "p-8 sm:p-12 rounded-2xl backdrop-blur-sm border border-border/50",
      "bg-gradient-to-br from-blue-500/5 to-cyan-600/5"
    ),
    section4: cn(
      "p-8 sm:p-12 rounded-2xl backdrop-blur-sm border border-border/50 mb-32",
      "bg-gradient-to-br from-green-500/5 to-emerald-600/5"
    ),
    title: "text-2xl sm:text-3xl font-bold mb-4",
    text: "text-muted-foreground leading-relaxed text-sm sm:text-base",
  },
}
