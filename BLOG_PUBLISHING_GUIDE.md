# 博客写作与发布流程

这是一份从写博客、预览检查，到上传 GitHub 并部署到热铁盒 Retinbox Web Hosting 的项目流程。

## 项目结构

- 博客文章目录：`src/content/blog/`
- 内容字段配置：`src/content/config.ts`
- 构建脚本：`package.json`
- GitHub 自动部署配置：`.github/workflows/deploy.yml`
- GitHub 远端仓库：`git@github.com:T4oist/Personal-blogs-page.git`

推荐主流程：

```text
写 Markdown -> 本地预览 -> npm run build -> Git 提交 -> 推送 GitHub -> GitHub Action 自动部署热铁盒
```

## 1. 写一篇博客

在 `src/content/blog/` 下新建 Markdown 文件，文件名建议使用日期和英文 slug：

```text
src/content/blog/2026-06-25-my-new-post.md
```

文章开头必须包含 frontmatter：

```md
---
title: "文章标题"
description: "一句话摘要"
date: 2026-06-25
tags:
  - 学习
  - 博客
category: 学习
published: true
---

这里开始写正文。
```

字段说明：

- `title`：必填，文章标题。
- `description`：必填，文章摘要。
- `date`：必填，发布时间。
- `updated`：可选，更新时间。
- `tags`：可选，标签数组，默认为空。
- `category`：可选，分类，默认为空。
- `published`：可选，设为 `false` 时作为草稿，不会出现在首页最近文章和博客列表中。
- `image`：可选，封面图字段；当前页面代码没有明显展示它。

如果文章需要图片：

- 放在 `public/`：用 `/image-name.png` 引用。
- 放在 `src/content/blog/`：按 Astro Markdown 的相对路径方式引用。

## 2. 本地预览

启动开发服务器：

```powershell
npm run dev
```

打开终端提示的本地地址，通常是：

```text
http://localhost:4321
```

重点检查：

- 首页 Recent Posts 是否出现新文章。
- `/blog` 列表是否出现新文章。
- `/blog/文章文件名` 页面是否正常。
- 标题、日期、标签、目录、评论区是否正常。
- 中文内容在浏览器里是否显示正常。

## 3. 发布前检查

执行构建检查：

```powershell
npm run build
```

这个命令会先运行 `astro check`，再生成 `dist/`。`dist/` 已经在 `.gitignore` 中，不需要提交。

如果构建失败，先根据终端报错修复文章 frontmatter、Markdown 语法或组件问题，再重新执行构建。

## 4. 上传到 GitHub

查看当前改动：

```powershell
git status
```

添加本次要发布的文章：

```powershell
git add src/content/blog/你的文章.md
```

如果本次还修改了页面、样式或配置，按需添加对应文件。

提交：

```powershell
git commit -m "Add new blog post"
```

推送到 GitHub：

```powershell
git push origin main
```

## 5. 部署到热铁盒

推送到 GitHub 后，`.github/workflows/deploy.yml` 会触发 GitHub Action，使用仓库 Secret `RTH_API_KEY` 部署到 Retinbox Web Hosting。

当前 GitHub Action 配置：

```text
site: t4oist.online
build: build
outdir: dist
```

如果需要手动部署，也可以在本地执行：

```powershell
npm run deploy
```

当前本地部署脚本会调用热铁盒 CLI，并使用：

```text
site: t4oist.online
build: build
outdir: dist
```

日常发布建议优先使用 GitHub Action，因为它和 GitHub 提交记录绑定，更稳定也更容易追踪。

## 注意事项

- 提交前确认 `git status` 中的改动都是这次想发布的内容。
- `node_modules/`、`dist/`、`build/` 不需要提交。
- 如果 GitHub Action 部署失败，优先检查仓库 Secrets 中是否配置了 `RTH_API_KEY`。
- 如果热铁盒部署目标异常，检查 GitHub Action 的 `site: T4oist` 和本地脚本的 `site: t4oist.online` 是否需要统一。
- 当前终端里中文可能出现乱码；发布前以编辑器和浏览器预览中的显示结果为准。
