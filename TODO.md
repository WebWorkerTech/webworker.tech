# TODO: Web Worker Astro SSR 重构

## 当前 Git 状态

- 当前分支：`v2`
- 当前 HEAD：`f94d535 ci: support workflow_dispatch`
- 远程跟踪：`origin/v2`
- 本轮没有新建分支。
- 本轮没有提交 commit。
- 当前改动仍在本地 working tree，尚未整理成可提交的变更集。

## 背景

当前项目原本是偏 SSG/静态数据的网站，内容更新依赖手动刷新或重新构建。
目标是把它改造成一个 Node + Astro SSR + Docker 的播客网站：

- 网站运行时读取本地 Markdown 文件，而不是依赖外部数据库。
- Docker 中挂载一个持久化 Markdown 目录。
- RSS 地址固定在环境配置里。
- 后台登录后可以刷新 RSS，按标题做差量对比。
- 新 RSS 单集可以导入为本地 Markdown。
- 后续可以手动编辑 Markdown 修正错别字。
- SSR 服务读取本地 Markdown 后实时反映内容变化。
- 可以手动刷新，也可以定时自动刷新。
- 先部署到测试域名 `new.webworker.tech`，禁止搜索引擎索引。
- 主域名替换必须等测试验证完成并得到明确同意。

## 重要纠偏

远程 1Panel/OpenResty 相关操作不应该继续靠手写配置。

本机已有 1Panel skill：

```text
/Users/otto/.agents/skills/1panel-skills
```

正确路线：

- Docker 镜像构建、Markdown 同步、容器启动：由本仓库脚本负责。
- 1Panel 网站、反向代理、HTTPS、DNS 验证：使用官方 `1panel-skills`。
- 不再把手写 OpenResty 配置脚本固化进本仓库。

当前会话已从 `~/.zshrc` 读取并验证：

```bash
ONEPANEL_BASE_URL
ONEPANEL_API_KEY
```

1Panel API 可以调用；后续面板相关操作优先使用官方 `1panel-skills` 的 CLI/API。

## 已完成

- Astro 已切到 SSR：`@astrojs/node` standalone。
- 页面数据读取改为异步读取本地 Markdown。
- `content/episodes` 已生成 Markdown 内容，当前约 99 条。
- 新增服务端模块：
  - `src/server/episodes.ts`
  - `src/server/rss.ts`
  - `src/server/markdown.ts`
  - `src/server/auth.ts`
  - `src/server/env.ts`
  - `src/server/scheduler.ts`
- 新增后台页面和 API：
  - `/admin`
  - `/api/admin/auth/login`
  - `/api/admin/auth/logout`
  - `/api/admin/me`
  - `/api/admin/rss/preview`
  - `/api/admin/rss/import`
- 新增健康检查：`/api/health`
- 新增 `robots.txt` 和 noindex 逻辑，测试环境默认禁止索引。
- 新增 Docker 相关文件：
  - `Dockerfile`
  - `docker-compose.yml`
  - `docker-compose.prod.yml`
  - `.dockerignore`
  - `.env.example`
- 新增部署脚本：
  - `scripts/deploy-new-webworker.sh`
- 新增 RSS 到 Markdown CLI：
  - `pnpm run fetch-rss -- --preview`
  - `pnpm run fetch-rss`
- 清理了过时的 `CLAUDE.md` 静态 HTML 指令。
- 新增/更新了项目说明：
  - `AGENTS.md`
  - `README.md`
  - `docs/staging-deploy.md`
  - `docs/rebuild-plan.md`
- 本地验证已通过：
  - `pnpm run fetch-rss -- --preview`：远程 99 条，本地 99 条，差量 0。
  - `pnpm run build`：Astro check 为 0 errors / 0 warnings / 0 hints。
  - `docker compose -f docker-compose.prod.yml config` 可展开，外部端口为 `4322`。
- 远程测试容器已部署过：
  - 原参考服务恢复在 `127.0.0.1:4321`。
  - 新 SSR 测试服务在 `4322`。
  - `/api/health` 返回 99 条。
- Tencent Cloud API skill 已安装在 `/Users/otto/.agents/skills/tencentcloud-api-skill`。
- `tccli` 已安装到 `/Users/otto/Library/Python/3.12/bin/tccli`。
- 已通过 `tccli auth login` 完成浏览器 OAuth 登录，凭证写入 `~/.tccli/default.credential`。
- DNSPod 已创建测试解析：
  - `new.webworker.tech A 182.92.243.114`
  - RecordId：`2302336871`
  - TTL：`600`
- 1Panel 已创建测试站点：
  - id：`19`
  - domain：`new.webworker.tech`
  - type：`proxy`
  - proxy：`http://127.0.0.1:4322`
  - status：`Running`
- 1Panel 已给测试站点开启 HTTPS：
  - 复用证书 id：`3`
  - 证书域名：`*.webworker.tech`
  - 证书状态：`ready`
  - HTTP 策略：`HTTPToHTTPS`
  - 协议：`TLSv1.3` / `TLSv1.2`
- 远程测试已通过：
  - `http://new.webworker.tech/` 返回 301 到 HTTPS。
  - `https://new.webworker.tech/` 返回 200。
  - HTTPS 响应包含 `X-Robots-Tag: noindex, nofollow, noarchive`。
  - `https://new.webworker.tech/robots.txt` 返回 `Disallow: /`。
  - `https://new.webworker.tech/api/health` 返回 99 条。
- Redis / 缓存 / 防刷增强已完成并部署到 staging：
  - 参考 `/Users/otto/mycode/mycode/blogs/astro-ijustcc` 的轻量 Redis 接入方式，新增 `src/server/redis.ts`。
  - Redis 只用于限流计数和短 TTL JSON 缓存，不作为内容数据库。
  - Docker 本地和生产 Compose 都已加入 Redis 服务。
  - 远端 `.env.production` 已加入 `REDIS_PASSWORD` 和内部 `REDIS_URL`。
  - 远端容器 `webworker-tech-new-redis-1` 当前 healthy。
  - Redis 中已验证有 `webworker:rate:*` 和短 hash 的 `webworker:episodes:prod:*` key。
- Node 层安全/缓存增强已完成：
  - Markdown 渲染接入 `sanitize-html`，降低 RSS/Markdown HTML 污染导致的 XSS 风险。
  - episodes 读取按文件名、mtime、size 生成签名，并使用内存 + Redis 60 秒缓存。
  - 公共 GET/HEAD 页面加 `Cache-Control: public, max-age=60, stale-while-revalidate=300`。
  - 公共页面随机 query 会 301 到干净 URL，减少 `?random=` 绕缓存刷 SSR。
  - Admin 登录、RSS preview、RSS import 接入 Redis/内存双后端限流。
  - Admin 写接口接入 Origin 校验。
  - 响应头新增 CSP、Permissions-Policy、HSTS 等基础安全头。
- 1Panel/OpenResty 防刷增强已完成：
  - 全局 OpenResty 已加入 `limit_req_zone $binary_remote_addr zone=webworker_req:10m rate=5r/s;`。
  - 站点 `new.webworker.tech` 已加入 `limit_req zone=webworker_req burst=20 nodelay;` 和 `limit_req_status 429;`。
  - 站点已开启 `limit_conn perserver 200;`、`limit_conn perip 20;`、`limit_rate 1024k;`。
  - API 写入后均通过 1Panel/OpenResty nginx check/reload，并已验证 HTTPS 仍返回 200。

## 未完成

- 尚未整理 commit。
- 尚未新建专用工作分支。
- 后台登录凭据目前在远程 `.env.production` 中，需要最终确认保存方式。
- Vite 仍有一些组件未使用 icon import 的打包警告，需要后续单独清理。
- 当前 `src/data/podcast-data.json` 有已暂存改动，需要确认是否保留为 legacy seed。
- 需要最终确认哪些本地改动属于本次重构，哪些是用户已有改动，避免误提交。

## 下一步计划

### 阶段 1：整理本地变更

1. 检查 `git status` 和 diff。
2. 区分本轮重构改动、用户已有暂存改动、可删除的临时文件。
3. 确认是否从 `v2` 新建分支，例如 `codex/astro-ssr-markdown`.
4. 暂不提交，先让用户审阅方案和文件范围。

### 阶段 2：收敛项目代码

1. 复查 SSR 数据读取链路。
2. 复查 RSS preview/import 是否只按标题差量。
3. 复查后台 auth cookie/JWT 和 API 保护。
4. 清理无效 import 和 Vite 警告。
5. 确认 `src/data/podcast-data.json` 只作为 legacy import seed，不再是运行时数据源。

### 阶段 3：本地验证

1. `pnpm run fetch-rss -- --preview`
2. `pnpm run build`
3. `JWT_SECRET=test ADMIN_PASSWORD=test HOST_PORT=4322 docker compose -f docker-compose.prod.yml config`
4. 必要时跑本地 SSR 服务验证：
   - `/`
   - `/episodes`
   - `/episode/<id>`
   - `/admin`
   - `/api/health`
   - `/robots.txt`

### 阶段 4：远程容器部署

1. 只使用 `scripts/deploy-new-webworker.sh` 做容器部署。
2. 保持 Compose project name 为 `webworker-tech-new`，避免再撞 `app-app-1`。
3. 保持测试站外部端口 `4322`。
4. 验证：
   - `http://127.0.0.1:4322/api/health`
   - Docker 容器健康状态。

### 阶段 5：1Panel 管理测试域名

1. 配置已放入 `~/.zshrc`，使用时通过新 zsh shell 读取：

   ```bash
   source ~/.zshrc
   ```

2. 使用 skill 工具查询网站：

   ```bash
   node /Users/otto/.agents/skills/1panel-skills/dist/scripts/cli.js \
     run websites searchWebsites \
     --input-json '{"page":1,"pageSize":20,"name":"new.webworker.tech","orderBy":"created_at","order":"descending"}'
   ```

3. 当前查询结果：`new.webworker.tech` 在 1Panel 网站列表中存在，站点 id 为 `19`。
4. 已用 1Panel API 创建该网站。
5. 已用官方 skill CLI 的 raw signed request 配置反代到 `http://127.0.0.1:4322`。
6. 已使用 Tencent Cloud `tccli` 为 `new.webworker.tech` 创建 A 记录到 `182.92.243.114`。
7. 已用 1Panel API 绑定现有 `*.webworker.tech` 证书并开启 HTTPS。
8. 已验证 robots/noindex，可给用户测试链接：`https://new.webworker.tech/`。
9. 已用 1Panel API 配置站点级连接数/带宽限制。
10. 已用 1Panel API 配置 OpenResty 全局 `limit_req_zone` 和站点 `limit_req`。

### 阶段 6：主域名切换

只有在用户明确同意后执行：

1. 保留旧站容器和配置作为回滚路径。
2. 把主域名反代切到 SSR 容器。
3. 验证页面、后台、RSS 同步、robots/indexing。
4. 最后再考虑开启 `PUBLIC_ALLOW_INDEXING=true`。

## 当前建议

测试域名已经可访问，下一步建议收敛代码提交：

1. 从当前 `v2` 新建一个专用分支，例如 `codex/astro-ssr-markdown`。
2. 清理非关键 Vite warning。
3. 复跑本地 build 和远程健康检查。
4. 整理 commit，推送给用户审阅。
