# PlaySentence — Cloudflare Pages 部署

## 项目结构

```
playsentence-cf/
├── functions/
│   └── api/
│       └── spotify.js    # Cloudflare Pages Function（后端）
├── public/
│   └── index.html        # 前端页面
└── wrangler.toml
```

## 部署步骤

### 1. 上传到 GitHub

```bash
git init
git add .
git commit -m "init"
# 在 github.com 新建仓库 playsentence，然后：
git remote add origin https://github.com/你的用户名/playsentence.git
git push -u origin main
```

### 2. 在 Cloudflare Pages 部署

1. 打开 [pages.cloudflare.com](https://pages.cloudflare.com)，登录
2. 点 **Create a project** → **Connect to Git**
3. 选择 `playsentence` 仓库
4. Build settings：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `public`
5. 点 **Save and Deploy**

### 3. 设置环境变量

部署完成后：
1. 进入项目 → **Settings** → **Environment variables**
2. 添加两个变量（选 Production）：

| Variable name | Value |
|---|---|
| `SPOTIFY_CLIENT_ID` | db6f3bae10be44418a99b73745382995 |
| `SPOTIFY_CLIENT_SECRET` | 6fd10285b0754b848b46b77e0b96677c |

3. 回到 **Deployments** → 点最新一次部署右边的 **...** → **Retry deployment**

### 完成

Cloudflare 会给你一个 `xxx.pages.dev` 的域名，也可以绑定自己的域名。
