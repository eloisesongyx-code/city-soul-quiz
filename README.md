# 城市灵魂测评 · City Soul Quiz

「如果你的灵魂只能住进一座城市，它会选择哪里？」—— 一个杂志风格的娱乐性人格测评。

24 道生活情境题 → 六个维度（自主与自由 / 成长与机会 / 新鲜与刺激 / 安稳与秩序 /
关系与归属 / 自然与松弛）→ 八座中国城市原型匹配 → 深度杂志式结果报告，支持分享与 PNG 长图。

> 本测评仅供娱乐与自我探索，不构成专业心理诊断、命运预测或迁居建议，未经心理测量学实证验证。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vite 5 + React 18 + TypeScript（strict）+ Tailwind CSS 3 + React Router（HashRouter） |
| 托管 | GitHub Pages（静态站点，GitHub Actions 自动部署） |
| 数据库 | Supabase PostgreSQL（RLS 行级安全） |
| 后端逻辑 | Supabase Edge Functions（Deno） |
| 管理员登录 | Supabase Auth（邮箱 + 密码） |

## 架构与安全模型

- **前端无后端**：所有会话/评分/报告逻辑都在 Edge Functions + PostgreSQL 数据库函数中，前端仅渲染。
- **RLS 最小权限**：四张表（`access_codes` / `test_sessions` / `test_results` / `admins`）全部启用 RLS 且
  **不授予 anon/authenticated 任何策略**（客户端默认拒绝所有读写）。
- **SECURITY INVOKER 数据库函数**：`set search_path = public, extensions`。anon 直接调用会被 RLS 拒绝，
  只有 service_role（Edge Functions 内部）能真正执行，无需 revoke/grant 样板。
- **访问密码**：只存 bcrypt 哈希（pgcrypto），前缀用于索引，原文不落库。
- **会话**：`session_token` 为 32 字节随机 bearer 密钥，存在 localStorage 用于断点续答；
  `idempotency_key` 唯一约束 + `select ... for update` + 条件 `update` 保证配额原子扣减、并发安全。
- **密钥隔离**：只有 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY` 进入前端；
  `service_role key`、数据库密码、管理员密钥**绝不**放入 `VITE_*` 或前端构建。

## 环境变量

前端（`VITE_*`，可进入浏览器，非敏感）：

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_BASE_PATH=/city-soul-quiz/   # 项目站点 /<仓库名>/；用户主页站点填 /
```

服务端（Edge Functions secrets，禁止进入前端）：

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

详见 [.env.example](.env.example)。

## 本地开发

```bash
npm install

# 前端（需先配置 .env 中的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）
npm run dev
```

前端运行时直接调用已部署的 Supabase 项目（Edge Functions + Postgres）。

本地校验：

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest（含计分/报告/前后端一致性漂移测试）
npm run build       # typecheck + vite build
```

## 目录结构

```
src/
  lib/            # 题库、城市原型、计分、报告、API、存储、分享、长图导出
  pages/          # 首页 / 密码 / 答题 / 结果 / 分享 / 管理员登录 / 后台
  components/     # Layout、ResultView、ResultLongImage、ExportActions 等
supabase/
  migrations/     # 0001 表 + RLS，0002 数据库函数
  functions/      # Edge Functions（start-test / save-answer / complete-test / ... / admin-*）
  functions/_shared/core.ts   # 与 src/lib 镜像，由 drift.test.ts 保证一致
```

## 部署

### 1) Supabase（数据库 + 函数）

```bash
supabase login                 # 登录（需要浏览器授权）
supabase link --project-ref <ref>
supabase db push               # 应用 migrations
supabase secrets set \
  SUPABASE_URL=<url> \
  SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
supabase functions deploy       # 部署全部 Edge Functions
```

### 2) 创建首个管理员

1. 在 Supabase Dashboard → Authentication → Users 创建/邀请一个用户（邮箱 + 密码）。
2. 确认该用户邮箱已验证（或临时关闭邮箱确认）。
3. 将用户 `id` 插入 `admins` 表：

```sql
insert into public.admins (user_id) values ('<auth.users.id>');
```

### 3) GitHub Pages（前端）

1. 仓库设置 → Pages → Source 选 **GitHub Actions**。
2. 仓库 Settings → Secrets and variables：
   - Secrets：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
   - Variables：`VITE_BASE_PATH`（项目站点填 `/仓库名/`，用户主页站点填 `/`）
3. 推送 `main` 分支即自动构建并部署（或手动触发 workflow）。

> 若仓库名不是 `city-soul-quiz`，请同步调整 `vite.config.ts` 的默认 `base` 与 `VITE_BASE_PATH`。

## 访问密码发放

管理员登录 `/admin` 后可批量生成访问密码（默认每码 3 次），设置可用次数、备注、
筛选与停用。密码经 bcrypt 哈希存储，仅前缀可查，原文只在生成时展示一次。

## 免责声明

本产品为娱乐性内容，所有城市原型均为象征性生活方式形象，不代表任何城市的全体居民；
「原型匹配度」为生活方式原型相似度，非科学概率或人格准确率。
