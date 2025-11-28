# MDX 视频嵌入插件使用指南

## 功能概述

视频嵌入插件允许你在 MDX 博客文章中轻松嵌入 Bilibili 和 YouTube 视频，只需提供视频 ID 即可。

## 支持的平台

- **Bilibili（哔哩哔哩）**
- **YouTube**

## 语法格式

### Bilibili 视频

```markdown
:::bilibili{id="视频BV号"}
:::
```

可选添加标题：
```markdown
:::bilibili{id="视频BV号" title="视频标题"}
:::
```

### YouTube 视频

```markdown
:::youtube{id="视频ID"}
:::
```

可选添加标题：
```markdown
:::youtube{id="视频ID" title="视频标题"}
:::
```

## 获取视频 ID

### Bilibili

从 Bilibili 视频 URL 中提取 BV 号：

**示例 URL：**
```
https://www.bilibili.com/video/BV1qgyGBgE5K/?spm_id_from=333.1007.tianma.2-2-5.click
```

**提取 BV 号：** `BV1qgyGBgE5K`

**使用方式：**
```markdown
:::bilibili{id="BV1qgyGBgE5K"}
:::
```

### YouTube

从 YouTube 视频 URL 中提取视频 ID：

**示例 URL：**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**提取视频 ID：** `dQw4w9WgXcQ`

**使用方式：**
```markdown
:::youtube{id="dQw4w9WgXcQ"}
:::
```

## 使用示例

### 1. 嵌入 Bilibili 视频（无标题）

```markdown
:::bilibili{id="BV1qgyGBgE5K"}
:::
```

### 2. 嵌入 Bilibili 视频（带标题）

```markdown
:::bilibili{id="BV1qgyGBgE5K" title="精彩的动画短片"}
:::
```

### 3. 嵌入 YouTube 视频（无标题）

```markdown
:::youtube{id="dQw4w9WgXcQ"}
:::
```

### 4. 嵌入 YouTube 视频（带标题）

```markdown
:::youtube{id="dQw4w9WgXcQ" title="经典音乐视频"}
:::
```

### 5. 在文章中混合使用

```markdown
# 我的视频分享

这是一个很棒的 Bilibili 视频：

:::bilibili{id="BV1qgyGBgE5K" title="【Live2D模型展示】电波系编舞少女"}
:::

如果你喜欢 YouTube，这里还有一个推荐：

:::youtube{id="dQw4w9WgXcQ" title="Rick Astley - Never Gonna Give You Up"}
:::
```

## 视频特性

### 响应式设计
- 视频播放器自动适配屏幕宽度
- 保持 16:9 的宽高比
- 移动端友好

### 播放器功能
- ✅ 全屏播放支持
- ✅ 高清画质（Bilibili）
- ✅ 自动播放控制
- ✅ 弹幕关闭（Bilibili 默认）

### 样式特点
- BlurFade 淡入动画
- 圆角边框设计
- 深色模式支持
- 可选的视频标题显示

## Bilibili 视频 URL 格式

Bilibili 视频 URL 的常见格式：

1. **标准格式**：`https://www.bilibili.com/video/BV号/`
2. **带参数格式**：`https://www.bilibili.com/video/BV号/?参数`
3. **短链接格式**：`https://b23.tv/短链接`（需要访问后获取完整链接）

**只需要提取中间的 BV 号部分！**

例如：
- `https://www.bilibili.com/video/BV1qgyGBgE5K/` → `BV1qgyGBgE5K`
- `https://www.bilibili.com/video/BV1xx411c7mD/?spm_id=...` → `BV1xx411c7mD`

## YouTube 视频 URL 格式

YouTube 视频 URL 的常见格式：

1. **标准格式**：`https://www.youtube.com/watch?v=视频ID`
2. **短链接格式**：`https://youtu.be/视频ID`
3. **嵌入格式**：`https://www.youtube.com/embed/视频ID`

**提取 v= 后面或 youtu.be/ 后面的 ID！**

例如：
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → `dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ` → `dQw4w9WgXcQ`

## 注意事项

1. **视频可访问性**
   - 确保视频未被删除或设为私密
   - Bilibili 视频需要公开可见
   - YouTube 视频需要允许嵌入

2. **视频 ID 格式**
   - Bilibili BV 号区分大小写
   - 确保复制完整的 BV 号
   - YouTube ID 通常包含字母、数字和符号

3. **性能考虑**
   - 避免在同一页面嵌入过多视频
   - 视频会在用户滚动到时加载（BlurFade）

4. **地区限制**
   - 某些视频可能有地区访问限制
   - YouTube 在某些地区可能需要特殊网络环境

## 完整的 MDX 示例

```markdown
---
title: "视频分享合集"
date: "2024-01-01"
---

# 我的视频推荐

## Bilibili 精选

这是一个非常有趣的动画展示：

:::bilibili{id="BV1qgyGBgE5K" title="Live2D模型展示"}
:::

## YouTube 音乐

经典永不过时：

:::youtube{id="dQw4w9WgXcQ" title="Rick Astley - Never Gonna Give You Up"}
:::

## 教程视频

这里是一个实用的编程教程：

:::bilibili{id="BV1xx411c7mD"}
:::
```

## 故障排除

**问题**：视频无法显示
- 检查视频 ID 是否正确
- 确认视频未被删除
- 检查网络连接

**问题**：Bilibili 视频无法播放
- 确认 BV 号正确（区分大小写）
- 检查视频是否公开
- 尝试在 Bilibili 网站直接访问

**问题**：YouTube 视频无法加载
- 确认视频允许嵌入
- 检查地区限制
- 验证视频 ID 格式

---

创建时间: 2024
更新时间: 2024
