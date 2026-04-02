# Waline 服务器端部署命令

## 一键部署脚本

将以下命令复制到你的服务器终端执行：

```bash
# 创建 Waline 目录
mkdir -p /www/wwwroot/waline
cd /www/wwwroot/waline

# 初始化项目
npm init -y

# 安装 Waline
npm install @waline/standalone

# 创建数据目录
mkdir -p data

# 创建环境变量文件
cat > .env << 'EOF'
# 数据库配置
DATABASE_URL=./data/waline.db

# 评论服务配置
WALINE_TITLE=T4oist 博客评论
WALINE_URL=http://你的服务器IP:8360

# 管理员账户
WALINE_ADMIN_EMAIL=admin@example.com
WALINE_ADMIN_PASSWORD=your-secure-password

# 安全配置
WALINE_SECURE=false
EOF

# 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash
cd /www/wwwroot/waline
npx @waline/standalone
EOF

# 赋予执行权限
chmod +x start.sh

# 安装 PM2（如果未安装）
npm install -g pm2

# 启动 Waline
pm2 start start.sh --name waline
pm2 save
pm2 startup

# 开放防火墙端口（Ubuntu/Debian）
sudo ufw allow 8360

# 查看服务状态
pm2 status
```

## 重要提示

1. **修改配置**：
   - 将 `你的服务器IP` 替换为你的实际服务器 IP 地址
   - 将 `admin@example.com` 替换为你的邮箱
   - 将 `your-secure-password` 替换为强密码

2. **测试访问**：
   - 浏览器访问：`http://你的服务器IP:8360`
   - 管理后台：`http://你的服务器IP:8360/ui`

3. **前端配置**：
   - 修改 `src/components/common/Comments.astro` 中的 `WALINE_SERVER`
   - 将 `你的服务器IP` 替换为实际 IP

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs waline

# 重启服务
pm2 restart waline

# 停止服务
pm2 stop waline

# 删除服务
pm2 delete waline
```

## 防火墙配置

### Ubuntu/Debian (ufw)
```bash
sudo ufw allow 8360
sudo ufw status
```

### CentOS/RHEL (firewalld)
```bash
sudo firewall-cmd --permanent --add-port=8360/tcp
sudo firewall-cmd --reload
```

### iptables
```bash
sudo iptables -A INPUT -p tcp --dport 8360 -j ACCEPT
sudo iptables-save
```

## 数据备份

```bash
# 手动备份
cp /www/wwwroot/waline/data/waline.db /www/wwwroot/waline/backups/waline_$(date +%Y%m%d).db

# 自动备份（每天凌晨 2 点）
crontab -e
# 添加以下行
0 2 * * * cp /www/wwwroot/waline/data/waline.db /www/wwwroot/waline/backups/waline_$(date +\%Y\%m\%d).db
```

## 更新 Waline

```bash
cd /www/wwwroot/waline
npm update @waline/standalone
pm2 restart waline
```

## 故障排查

### 1. 检查服务是否运行
```bash
pm2 status
netstat -tulpn | grep 8360
```

### 2. 查看日志
```bash
pm2 logs waline
```

### 3. 检查防火墙
```bash
sudo ufw status
```

### 4. 检查端口是否被占用
```bash
lsof -i:8360
```

## 安全建议

1. **修改默认端口**（可选）：
   ```bash
   # 在 .env 文件中添加
   PORT=12345
   ```

2. **设置强密码**：
   - 管理后台密码应包含大小写字母、数字和特殊字符

3. **定期备份**：
   - 建议每天自动备份数据库

4. **监控服务**：
   - 使用 PM2 监控 Waline 服务状态
