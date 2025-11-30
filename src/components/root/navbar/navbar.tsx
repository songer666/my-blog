"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Code, Image as ImageIcon, Music, ChevronDown } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/shadcn/ui/animated-theme-toggler"
import { navbarStyles } from "./navbar.style"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "主页", href: "/" },
  { name: "博客", href: "/blog" },
  { name: "项目", href: "/projects" },
  { name: "关于", href: "/about" },
]

const resourceItems = [
  { name: "代码", href: "/resources/code", icon: Code },
  { name: "图库", href: "/resources/image", icon: ImageIcon },
  { name: "音乐", href: "/resources/music", icon: Music },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 当移动端菜单打开时，锁定页面滚动
  useEffect(() => {
    if (mobileOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY
      // 锁定 body 滚动
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // 恢复滚动
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [mobileOpen])

  // 判断是否为当前路由（使用 startsWith 匹配，例如 /blog/[slug] 也视作 /blog）
  const isActive = (href: string) => {
    // 精确匹配首页
    if (href === '/') {
      return pathname === '/' || pathname === '/root'
    }
    // 其他路径使用 startsWith 匹配
    return pathname.startsWith(href) || pathname.startsWith('/root' + href)
  }

  return (
    <>
      {/* 移动端遮罩层 - 当菜单打开时显示 */}
      {mobileOpen && (
        <div
          className={navbarStyles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={navbarStyles.container(scrolled)}>
        <div className={navbarStyles.inner}>
          <div className={navbarStyles.flexLayout}>
            {/* 左侧：移动端菜单按钮 + 头像 */}
            <div className={navbarStyles.leftSection}>
              {/* 移动端菜单按钮 */}
              <button
                className={navbarStyles.mobileMenuButton}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* 头像 - 所有尺寸都显示 */}
              <Link href="/root" className={navbarStyles.avatarLink}>
                <div className={navbarStyles.avatarContainer}>
                  <Image
                    src="/navbar/cat.jpg"
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 40px, 48px"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* 移动端下拉菜单 */}
            {mobileOpen && (
              <div className={navbarStyles.mobileDropdown.container}>
              <nav className={navbarStyles.mobileDropdown.nav}>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      navbarStyles.mobileDropdown.item,
                      isActive(item.href) && navbarStyles.mobileDropdown.itemActive
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Resources 分组 */}
                <div className={navbarStyles.mobileDropdown.separator} />
                <div className={navbarStyles.mobileDropdown.header}>
                  资源
                </div>
                {resourceItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        navbarStyles.mobileDropdown.item,
                        isActive(item.href) && navbarStyles.mobileDropdown.itemActive
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {/* 中间：导航链接（桌面端）- 纯静态渲染 */}
          <div className={navbarStyles.navLinksContainer(scrolled)}>
            <nav className={navbarStyles.navList}>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    navbarStyles.navLinkItem,
                    isActive(item.href) && navbarStyles.navLinkItemActive
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Resources 下拉菜单 - 纯 CSS 实现 */}
              <div className={navbarStyles.dropdown.wrapper}>
                <span 
                  className={cn(
                    navbarStyles.navLinkItem,
                    navbarStyles.dropdown.trigger,
                    (pathname.startsWith('/resources') || pathname.startsWith('/root/resources')) && navbarStyles.navLinkItemActive
                  )}
                  tabIndex={0}
                >
                  资源
                  <ChevronDown className={navbarStyles.dropdown.icon} />
                </span>
                <div className={navbarStyles.dropdown.content}>
                  <div className={navbarStyles.dropdown.contentInner}>
                    <ul className={navbarStyles.dropdown.list}>
                      {resourceItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={cn(
                                navbarStyles.dropdown.item,
                                isActive(item.href) && navbarStyles.dropdown.itemActive
                              )}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </nav>
          </div>

            {/* 右侧：主题切换按钮 */}
            <AnimatedThemeToggler className={navbarStyles.themeToggle} />
          </div>
        </div>
      </nav>
    </>
  )
}
