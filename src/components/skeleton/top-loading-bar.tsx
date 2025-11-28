"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function TopLoadingBar() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // 模拟加载进度
    const intervals: NodeJS.Timeout[] = []
    
    // 快速到 30%
    intervals.push(setTimeout(() => setProgress(30), 100))
    
    // 中速到 60%
    intervals.push(setTimeout(() => setProgress(60), 300))
    
    // 慢速到 90%
    intervals.push(setTimeout(() => setProgress(90), 800))
    
    // 完成
    intervals.push(setTimeout(() => {
      setProgress(100)
      setIsComplete(true)
    }, 1200))
    
    // 完成后淡出
    intervals.push(setTimeout(() => {
      setProgress(0)
    }, 1400))

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [])

  if (progress === 0 && !isComplete) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px]">
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out",
          // Light 模式：黑灰色渐变
          "bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800",
          // Dark 模式：紫色渐变
          "dark:bg-gradient-to-r dark:from-purple-500 dark:via-pink-400 dark:to-purple-500",
          // 发光效果 - light 模式淡一点，dark 模式亮一点
          "shadow-[0_0_8px_rgba(0,0,0,0.3)]",
          "dark:shadow-[0_0_10px_rgba(168,85,247,0.8)]",
          // 完成时快速消失
          isComplete && "opacity-0 duration-200"
        )}
        style={{
          width: `${progress}%`,
          transition: isComplete 
            ? 'opacity 200ms ease-out' 
            : 'width 300ms ease-out',
        }}
      />
    </div>
  )
}
