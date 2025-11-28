// ✅ 前台首页 - 通过自定义域名访问时会看到这个页面
// 域名会通过 vercel.json 的 rewrite 规则映射到这里
import React from 'react'
import { pageStyles } from './page.style'

const RootPage = async () => {
    return (
        <div className={pageStyles.container}>
            {/* 顶部内容区域 - 为导航栏留出空间 */}
            <div className={pageStyles.hero.wrapper}>
                <div className={pageStyles.hero.content}>
                    <h1 className={pageStyles.hero.title}>
                        欢迎来到气质猫咪的博客
                    </h1>
                    <p className={pageStyles.hero.subtitle}>
                        优雅的中文字体 × 精致的代码字体
                    </p>
                    <div className={pageStyles.hero.hint}>
                        👇 Scroll down to see navbar effects
                    </div>
                </div>
            </div>

            {/* 测试滚动内容 */}
            <div className={pageStyles.sections.wrapper}>
                <section className={pageStyles.sections.section1}>
                    <h2 className={pageStyles.sections.title}>🎨 字体展示</h2>
                    <p className={pageStyles.sections.text}>
                        这是<strong>霞鹜文楷</strong>字体，一款优雅的开源中文字体。它具有手写风格，笔画柔和，非常适合博客文章阅读。你可以看到每个汉字都有独特的美感和韵味。
                    </p>
                    <div className="mt-4 p-4 rounded-lg bg-muted/50">
                        <code className="text-sm">
                            const greeting = "Hello, 气质猫咪!";
                            console.log(greeting);
                        </code>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        ↑ 代码使用 FiraCode 等宽字体，支持连字特性
                    </p>
                </section>

                <section className={pageStyles.sections.section2}>
                    <h2 className={pageStyles.sections.title}>📝 中文排版示例</h2>
                    <p className={pageStyles.sections.text}>
                        春江潮水连海平，海上明月共潮生。滟滟随波千万里，何处春江无月明！
                    </p>
                    <p className={pageStyles.sections.text}>
                        江流宛转绕芳甸，月照花林皆似霰。空里流霜不觉飞，汀上白沙看不见。
                    </p>
                    <p className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                        —— 张若虚《春江花月夜》
                    </p>
                </section>

                <section className={pageStyles.sections.section3}>
                    <h2 className={pageStyles.sections.title}>💻 代码字体展示</h2>
                    <div className="space-y-3">
                        <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto">
                            <code>{`function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// FiraCode 支持连字：!= === => >= <=
const result = fibonacci(10) !== 0;
console.log(\`斐波那契数列第10项：\${result}\`);`}</code>
                        </pre>
                        <p className="text-xs text-muted-foreground">
                            ↑ 注意代码中的箭头、等号等符号的连字效果
                        </p>
                    </div>
                </section>

                <section className={pageStyles.sections.section4}>
                    <h2 className={pageStyles.sections.title}>🌟 混排效果</h2>
                    <p className={pageStyles.sections.text}>
                        在现代 Web 开发中，我们经常需要混合使用中英文。霞鹜文楷配合 <code>FiraCode</code> 字体，
                        能够完美呈现 <strong>中文、English、代码片段</strong> 的混排效果。
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                        <p>• 正文字体：<span className="font-sans">霞鹜文楷（LXGW WenKai）</span></p>
                        <p>• 代码字体：<code className="font-mono">FiraCode Variable</code></p>
                        <p>• 主题色彩：<span className="text-purple-600 dark:text-purple-400">气质猫咪紫</span></p>
                    </div>
                </section>
                
                <section className={pageStyles.sections.section1}>
                    <h2 className={pageStyles.sections.title}>✨ 字体特性</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-lg border border-border/50">
                            <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">霞鹜文楷</h3>
                            <ul className="space-y-1 text-sm">
                                <li>• 优雅的手写风格</li>
                                <li>• 完整的中文字符集</li>
                                <li>• 适合长文阅读</li>
                                <li>• 笔画柔和自然</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-lg border border-border/50">
                            <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">FiraCode</h3>
                            <ul className="space-y-1 text-sm">
                                <li>• 等宽代码字体</li>
                                <li>• 支持连字特性</li>
                                <li>• 清晰易读</li>
                                <li>• 可变字重</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default RootPage
