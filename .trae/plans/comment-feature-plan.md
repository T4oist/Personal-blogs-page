# 博客评论功能实施方案 - 针对你的服务器环境

## 一、服务器环境确认

✅ **操作系统**：Ubuntu/Debian  
✅ **Node.js**：已安装（18+）  
✅ **访问方式**：IP 地址 + 端口  
✅ **通知功能**：不需要  

---

## 二、简化实施方案

### 第一步：服务器端部署 Waline

#### 1.1 创建 Waline 目录

```bash
# SSH 连接到你的服务器后执行
mkdir -p /www/wwwroot/waline
cd /www/wwwroot/waline
```

#### 1.2 初始化项目

```bash
# 初始化 npm 项目
npm init -y

# 安装 Waline standalone 版本
npm install @waline/standalone
```

#### 1.3 创建数据目录

```bash
# 创建数据存储目录
mkdir -p data
```

#### 1.4 配置环境变量

创建 `.env` 文件：

```bash
nano .env
```

写入以下内容：

```env
# 数据库配置（使用 SQLite，简单方便）
DATABASE_URL=./data/waline.db

# 评论服务配置
WALINE_TITLE=T4oist 博客评论
WALINE_URL=http://你的服务器IP:8360

# 管理员账户（首次登录后可在后台修改）
WALINE_ADMIN_EMAIL=admin@example.com
WALINE_ADMIN_PASSWORD=your-secure-password

# 安全配置
WALINE_SECURE=false
```

> **重要**：请将 `你的服务器IP` 替换为你的实际服务器 IP 地址

#### 1.5 创建启动脚本

创建 `start.sh`：

```bash
nano start.sh
```

写入以下内容：

```bash
#!/bin/bash
cd /www/wwwroot/waline
npx @waline/standalone
```

赋予执行权限：

```bash
chmod +x start.sh
```

#### 1.6 使用 PM2 管理进程（推荐）

安装 PM2：

```bash
npm install -g pm2
```

启动 Waline：

```bash
pm2 start start.sh --name waline
pm2 save
pm2 startup
```

#### 1.7 开放防火墙端口

```bash
# Ubuntu/Debian 使用 ufw
sudo ufw allow 8360

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 8360 -j ACCEPT
sudo iptables-save
```

#### 1.8 测试访问

在浏览器中访问：`http://你的服务器IP:8360`

如果看到 Waline 的欢迎页面，说明部署成功！

---

### 第二步：前端集成评论组件

#### 2.1 创建评论组件

创建文件：`src/components/common/Comments.astro`

```astro
---
interface Props {
  path?: string;
}

const { 
  path = Astro.url.pathname 
} = Astro.props;

// 替换为你的服务器 IP
const WALINE_SERVER = 'http://你的服务器IP:8360';
---

<div id="waline-comments" class="comments-container"></div>

<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css" />

<script define:vars={{ WALINE_SERVER, path }}>
  import { init } from '@waline/client';
  
  init({
    el: '#waline-comments',
    serverURL: WALINE_SERVER,
    path: path,
    lang: 'zh-CN',
    
    // 评论数量
    commentCount: true,
    
    // 分页配置
    pageSize: 10,
    
    // 表情包
    emoji: [
      '//unpkg.com/@waline/emojis@1.1.0/bilibili',
      '//unpkg.com/@waline/emojis@1.1.0/qq',
    ],
    
    // 代码高亮
    highlight: 'github-dark',
    
    // 登录配置
    login: 'enable',
    
    // 必填信息
    meta: ['nick', 'mail', 'link'],
    requiredMeta: ['nick', 'mail'],
    placeholder: '说点什么吧...',
    
    // 字数限制
    wordLimit: 1000,
    
    // 表情反应
    reaction: true,
  });
</script>

<style>
  .comments-container {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--c-border);
  }
  
  :global(.wl-card) {
    background-color: var(--c-bg-soft) !important;
    border-color: var(--c-border) !important;
  }
  
  :global(.wl-editor) {
    background-color: var(--c-bg) !important;
    color: var(--c-text) !important;
  }
  
  :global(.wl-btn) {
    background-color: var(--c-primary) !important;
  }
  
  :global(.wl-header-item) {
    color: var(--c-text) !important;
  }
  
  :global(.wl-input) {
    background-color: var(--c-bg) !important;
    color: var(--c-text) !important;
    border-color: var(--c-border) !important;
  }
</style>
```

#### 2.2 修改博客文章页面

查看当前的博客文章页面结构：

```bash
# 查看文件
cat src/pages/blog/[...slug].astro
```

如果没有该文件，创建它：

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import Comments from '@components/common/Comments.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: post,
  }));
}

const post = Astro.props;
const { Content } = await post.render();
---

<BaseLayout title={post.data.title}>
  <article class="blog-content max-w-4xl mx-auto px-4 py-24">
    <header class="mb-12">
      <h1 class="text-4xl font-bold mb-4" style="color: var(--c-text);">
        {post.data.title}
      </h1>
      <div class="flex items-center gap-4 text-sm" style="color: var(--c-text-3);">
        <time>{post.data.date.toLocaleDateString('zh-CN')}</time>
        {post.data.category && (
          <span class="text-primary">{post.data.category}</span>
        )}
      </div>
    </header>
    
    <div class="prose max-w-none">
      <Content />
    </div>
    
    <!-- 评论组件 -->
    <Comments />
  </article>
</BaseLayout>
```

---

### 第三步：配置管理后台

#### 3.1 访问管理后台

浏览器访问：`http://你的服务器IP:8360/ui`

#### 3.2 首次登录

- 使用你在 `.env` 中配置的邮箱和密码登录
- 登录后建议立即修改密码

#### 3.3 管理功能

- ✅ 查看/审核/删除评论
- ✅ 用户管理
- ✅ 配置评论规则
- ✅ 查看统计数据

---

## 三、需要添加/修改的文件清单

### 新增文件：

```
src/components/common/Comments.astro     # 评论组件
```

### 修改文件：

```
src/pages/blog/[...slug].astro          # 博客文章页面（添加评论组件）
```

### 服务器端文件：

```
/www/wwwroot/waline/                    # Waline 服务目录
├── package.json                         # npm 配置
├── .env                                 # 环境变量
├── start.sh                             # 启动脚本
└── data/
    └── waline.db                        # SQLite 数据库
```

---

## 四、部署验证清单

### 服务器端验证：

- [ ] Node.js 版本 >= 18
- [ ] Waline 服务正常运行（`pm2 status`）
- [ ] 端口 8360 已开放
- [ ] 可以通过浏览器访问 `http://服务器IP:8360`

### 前端验证：

- [ ] 评论组件已创建
- [ ] 博客文章页面已集成评论组件
- [ ] 可以在博客页面看到评论区
- [ ] 可以发表评论

### 功能验证：

- [ ] 可以发表评论
- [ ] 可以回复评论
- [ ] 表情包功能正常
- [ ] 管理后台可以登录
- [ ] 可以在后台管理评论

---

## 五、常见问题解决

### 问题 1：无法访问 Waline 服务

**解决方案**：

```bash
# 检查服务是否运行
pm2 status

# 检查端口是否监听
netstat -tulpn | grep 8360

# 检查防火墙
sudo ufw status
```

### 问题 2：评论无法提交

**解决方案**：

```bash
# 查看 Waline 日志
pm2 logs waline

# 检查数据库文件权限
ls -la /www/wwwroot/waline/data/
```

### 问题 3：跨域问题

**解决方案**：

在 `.env` 中添加：

```env
WALINE_ALLOW_ORIGINS=http://你的博客域名,http://localhost:4321
```

---

## 六、备份与维护

### 6.1 数据备份

```bash
# 创建备份脚本
nano /www/wwwroot/waline/backup.sh
```

写入：

```bash
#!/bin/bash
BACKUP_DIR="/www/wwwroot/waline/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /www/wwwroot/waline/data/waline.db $BACKUP_DIR/waline_$DATE.db

# 保留最近 7 天的备份
find $BACKUP_DIR -name "waline_*.db" -mtime +7 -delete
```

设置定时任务：

```bash
crontab -e
```

添加：

```bash
# 每天凌晨 2 点备份
0 2 * * * /www/wwwroot/waline/backup.sh
```

### 6.2 更新 Waline

```bash
cd /www/wwwroot/waline
npm update @waline/standalone
pm2 restart waline
```

---

## 七、安全建议

1. **修改默认端口**（可选）：

```env
# 在 .env 中修改
PORT=12345
```

2. **设置强密码**：

管理后台密码应包含大小写字母、数字和特殊字符。

3. **定期备份**：

建议每天自动备份数据库。

4. **监控服务**：

使用 PM2 监控 Waline 服务状态。

---

## 八、实施时间表

| 步骤 | 时间 | 内容 |
|------|------|------|
| 服务器端部署 | 15 分钟 | 安装配置 Waline |
| 前端集成 | 10 分钟 | 创建评论组件 |
| 测试验证 | 5 分钟 | 测试评论功能 |
| **总计** | **30 分钟** | 完整部署 |

---

## 九、后续优化建议

1. **域名配置**（如果有域名）：
   - 配置子域名 `waline.yourdomain.com`
   - 申请 SSL 证书，启用 HTTPS

2. **邮件通知**（如果需要）：
   - 配置 SMTP 服务
   - 新评论邮件提醒

3. **评论审核**：
   - 设置敏感词过滤
   - 开启评论审核功能

---

## 总结

这个方案针对你的服务器环境进行了优化：

✅ **简单部署**：使用 SQLite 数据库，无需额外配置  
✅ **快速访问**：直接使用 IP + 端口访问  
✅ **易于维护**：PM2 管理进程，自动重启  
✅ **完全免费**：无需域名和 SSL 证书  
✅ **功能完整**：支持 Markdown、表情包、管理后台  

现在可以开始实施了！如果你确认这个方案，我将为你创建前端的评论组件文件。
