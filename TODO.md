# MindTech 播客网站重构项目

## 项目需求确认

**用户需求:**
- 使用 Astro + Vue3 (setup) + TypeScript + Tailwind v3
- 基于现有HTML页面重构为组件化架构
- 数据来源: RSS feed (https://feed.xyzfm.space/rv449dl9kqka)
- 图标系统: 使用 lucide-astro 替换 Font Awesome
- 主播信息: 使用mock数据（6个主播）
- 分类系统: 基于RSS内容自动分类
- 新增播客详情页: 显示shownotes和audio

**确认的设计决策:**
- 保持原有cream/mint配色方案和视觉风格
- 保持中文内容和文化特色
- 保持响应式设计和动画效果
- 组件化架构，页面结构简洁

## RSS数据分析结果

**可用数据字段:**
- `<title>`: 播客标题
- `<description>`: HTML格式的详细描述和show notes
- `<pubDate>`: 发布日期
- `<enclosure url>`: 音频文件URL
- `<itunes:duration>`: 播客时长
- `<itunes:image>`: 播客封面图
- `<guid>`: 唯一标识符
- `<link>`: 播客详情页链接

## 实施任务清单

### ✅ 已完成
1. [x] 分析RSS feed数据结构
2. [x] 制定项目架构计划
3. [x] 设计组件架构和数据流
4. [x] 映射RSS数据到页面元素
5. [x] 创建实施计划并获得批准
6. [x] 创建todo.md记录交流过程

### 🚧 待执行
7. [ ] 初始化Astro项目 (Vue3, TS, Tailwind v3)
8. [ ] 设置TypeScript类型定义
9. [ ] 实现RSS数据获取和解析
10. [ ] 创建6个主播的mock数据
11. [ ] 构建基础UI组件 (AudioPlayer, Cards等)
12. [ ] 实现自动分类逻辑
13. [ ] 创建页面区块组件
14. [ ] 构建播客详情页 (shownotes + audio)
15. [ ] 设置布局和主页面
16. [ ] 将Font Awesome替换为lucide-astro图标
17. [ ] 实现响应式设计和动画效果
18. [ ] 测试和性能优化

## 项目架构

```
src/
├── components/
│   ├── ui/                    # 基础UI组件 (Vue3 + setup)
│   │   ├── AudioPlayer.vue    # 音频播放器
│   │   ├── PodcastCard.vue    # 播客卡片
│   │   ├── CategoryCard.vue   # 分类卡片
│   │   ├── HostCard.vue       # 主播卡片
│   │   └── TestimonialCard.vue # 评价卡片
│   ├── layout/                # 布局组件
│   │   ├── Header.vue         # 导航栏
│   │   ├── Footer.vue         # 页脚
│   │   └── AudioPlayerFixed.vue # 固定音频播放器
│   └── sections/              # 页面区块组件
│       ├── HeroSection.vue    # 英雄区
│       ├── CategoriesSection.vue # 分类区
│       ├── EpisodesSection.vue # 最新播客
│       ├── FeaturedSection.vue # 精选专题
│       ├── HostsSection.vue   # 热门主播
│       ├── SubscribeSection.vue # 订阅区
│       ├── StatsSection.vue   # 统计数据
│       └── TestimonialsSection.vue # 听众评价
├── layouts/
│   └── Layout.astro          # 主布局
├── pages/
│   ├── index.astro           # 首页
│   └── episode/[id].astro    # 播客详情页
├── types/
│   └── podcast.ts            # TypeScript类型定义
├── utils/
│   └── rss.ts               # RSS解析工具
└── styles/
    └── global.css           # 全局样式
```

## 技术栈

- **框架**: Astro 4.x
- **前端**: Vue 3.4+ (Composition API + setup)
- **类型**: TypeScript 5.x
- **样式**: Tailwind CSS 3.4+
- **图标**: lucide-astro
- **数据**: RSS feed + Mock data

## 下一步行动

开始执行任务7: 初始化Astro项目配置