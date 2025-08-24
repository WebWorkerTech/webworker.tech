# 播客网站 RSS 转 JSON 方案

这个项目实现了自动从RSS源获取播客数据并转换为JSON的功能，确保网站总是显示最新的播客内容。

## 🚀 特性

- ✅ 自动RSS转JSON转换
- ✅ 完整内容提取（标题、描述、音频链接等）
- ✅ 开发时自动更新数据
- ✅ 构建时自动更新数据
- ✅ 双重解析策略（直接XML解析 + rss2json备用）
- ✅ 错误容错机制

## 📁 项目结构

```
mindtech-podcast/
├── scripts/
│   └── fetch-rss.js          # RSS转JSON脚本
├── src/
│   └── data/
│       └── podcast-data.json  # 生成的播客数据
├── .env                      # RSS URL配置
└── package.json             # 集成了RSS转换的npm脚本
```

## 🔧 使用方法

### 1. 配置RSS源

编辑 `.env` 文件，设置您的RSS地址：

```bash
RSS_URL=https://your-podcast-rss-url.com/feed
```

### 2. 开发模式

```bash
npm run dev
```

这会：

1. 首先运行RSS转换脚本，获取最新数据
2. 启动Astro开发服务器

### 3. 构建项目

```bash
npm run build
```

这会：

1. 首先运行RSS转换脚本，获取最新数据
2. 运行Astro类型检查
3. 构建生产版本

### 4. 单独更新RSS数据

```bash
npm run fetch-rss
```

## 📊 数据格式

转换后的JSON数据包含：

```json
{
  "status": "ok",
  "feed": {
    "url": "RSS源地址",
    "title": "播客标题",
    "link": "播客链接",
    "author": "作者",
    "description": "播客描述",
    "image": "播客封面"
  },
  "items": [
    {
      "title": "节目标题",
      "pubDate": "发布日期",
      "link": "节目链接",
      "guid": "唯一标识",
      "author": "作者",
      "thumbnail": "缩略图",
      "description": "节目描述",
      "content": "完整内容",
      "enclosure": {
        "link": "音频文件链接",
        "type": "音频类型",
        "length": "文件大小",
        "duration": "时长",
        "image": "封面图",
        "rating": { "scheme": "urn:itunes", "value": "no" }
      },
      "categories": ["分类"]
    }
  ]
}
```

## 🛠 技术实现

### RSS解析策略

1. **主要方案**: 直接获取RSS XML并手动解析
   - 支持完整的RSS/Podcast标准
   - 提取CDATA内容
   - 处理iTunes扩展标签

2. **备用方案**: 使用rss2json.com API
   - 当直接解析失败时自动切换
   - 确保服务的可靠性

### 错误处理

- 网络错误时使用现有的JSON文件
- 解析失败时自动切换备用方案
- 详细的日志输出帮助调试

## 🎯 集成到工作流

每次运行 `npm run dev` 时，系统会：

1. 📡 获取最新的RSS数据
2. 🔄 转换为JSON格式
3. 💾 保存到 `src/data/podcast-data.json`
4. 🚀 启动开发服务器

这确保您在开发时总是使用最新的播客数据！

## 🔄 自定义RSS源

要切换到不同的播客RSS源：

1. 修改 `.env` 文件中的 `RSS_URL`
2. 运行 `npm run fetch-rss` 更新数据
3. 重启开发服务器

## 📝 注意事项

- RSS数据会缓存在 `podcast-data.json` 中
- 建议定期清理和更新数据
- 如果RSS源有变化，记得更新 `.env` 文件
- 生产环境建议设置定时任务定期更新RSS数据
