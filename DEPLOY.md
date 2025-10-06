# 部署指南

本文档详细说明如何将PDF电路图搜索系统部署到腾讯云服务器。

## 服务器配置

- **配置**: 4核4G3M
- **操作系统**: Ubuntu 20.04 / 22.04 LTS
- **需要开放端口**: 80 (HTTP), 22 (SSH)

## 部署步骤

### 第一步：准备GitHub仓库

1. 在GitHub上创建新仓库（例如：`pdf-circuit-search`）

2. 在本地项目目录关联远程仓库：
```bash
cd C:\Users\sakura\OneDrive\桌面\PDF_text
git remote add origin https://github.com/your-username/pdf-circuit-search.git
git branch -M main
git push -u origin main
```

### 第二步：服务器初始配置

1. SSH登录到腾讯云服务器：
```bash
ssh root@your_server_ip
```

2. 下载并运行环境初始化脚本：
```bash
# 从GitHub下载setup-server.sh
wget https://raw.githubusercontent.com/your-username/pdf-circuit-search/main/setup-server.sh

# 赋予执行权限
chmod +x setup-server.sh

# 运行脚本
./setup-server.sh
```

该脚本会自动安装：
- Node.js 18 LTS
- npm
- PM2 进程管理器
- Nginx Web服务器
- 配置防火墙

### 第三步：克隆项目到服务器

```bash
# 创建部署目录
sudo mkdir -p /var/www/pdf-search
sudo chown -R $USER:$USER /var/www/pdf-search

# 克隆项目
cd /var/www/pdf-search
git clone https://github.com/your-username/pdf-circuit-search.git .
```

### 第四步：安装依赖

```bash
# 安装后端依赖
cd /var/www/pdf-search/backend
npm install --production

# 安装前端依赖并构建
cd /var/www/pdf-search/frontend
npm install --legacy-peer-deps
npm run build
```

### 第五步：配置环境变量

```bash
# 后端环境变量
cd /var/www/pdf-search/backend
cp .env.production .env
# 如需修改端口等配置，编辑 .env 文件

# 前端已在构建时使用 .env.production
```

### 第六步：上传PDF文件

将PDF文件上传到服务器：

```bash
# 方式1: 使用scp从本地上传
# 在本地电脑执行：
scp -r "C:\Users\sakura\OneDrive\桌面\pdf"/*.pdf root@your_server_ip:/var/www/pdf-search/pdfs/

# 方式2: 在服务器上创建并上传
mkdir -p /var/www/pdf-search/pdfs
# 然后通过FTP或其他方式上传PDF文件
```

### 第七步：配置Nginx

```bash
# 编辑nginx配置，替换域名/IP
cd /var/www/pdf-search
nano nginx.conf
# 将 server_name 改为你的服务器IP或域名

# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/pdf-search

# 创建软链接
sudo ln -s /etc/nginx/sites-available/pdf-search /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 第八步：启动后端服务

```bash
cd /var/www/pdf-search/backend

# 使用PM2启动
pm2 start dist/index.js --name pdf-search-backend

# 保存PM2配置
pm2 save

# 设置开机启动
pm2 startup
# 复制输出的命令并执行

# 查看服务状态
pm2 status
pm2 logs pdf-search-backend
```

### 第九步：验证部署

1. 检查后端服务：
```bash
curl http://localhost:3001/health
# 应返回: {"status":"ok","timestamp":"..."}
```

2. 检查前端访问：
在浏览器访问：`http://your_server_ip`

3. 测试完整流程：
   - 打开网站首页，查看PDF文档列表
   - 点击任意PDF文档，查看详情页
   - 尝试搜索关键词（如：油门踏板）
   - 验证搜索结果和跳转功能

## 常用运维命令

### PM2管理

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs pdf-search-backend

# 重启服务
pm2 restart pdf-search-backend

# 停止服务
pm2 stop pdf-search-backend

# 删除服务
pm2 delete pdf-search-backend

# 监控
pm2 monit
```

### Nginx管理

```bash
# 测试配置
sudo nginx -t

# 重启
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/pdf-search
git pull

# 重新构建前端
cd frontend
npm run build

# 重新编译后端
cd ../backend
npm run build

# 重启后端服务
pm2 restart pdf-search-backend
```

## 故障排查

### 问题1: 无法访问网站

**检查清单**:
1. 检查Nginx是否运行：`sudo systemctl status nginx`
2. 检查端口是否开放：`sudo ufw status`
3. 检查服务器安全组是否允许80端口访问（腾讯云控制台）
4. 检查Nginx错误日志：`sudo tail -f /var/log/nginx/error.log`

### 问题2: API请求失败

**检查清单**:
1. 检查后端服务状态：`pm2 status`
2. 查看后端日志：`pm2 logs pdf-search-backend`
3. 测试后端健康检查：`curl http://localhost:3001/health`
4. 检查Nginx代理配置是否正确

### 问题3: PDF无法加载

**检查清单**:
1. 确认PDF文件存在：`ls -lh /var/www/pdf-search/pdfs/`
2. 检查文件权限：`sudo chown -R www-data:www-data /var/www/pdf-search/pdfs/`
3. 检查后端日志中的错误信息
4. 确认PDF路径配置正确（.env文件）

### 问题4: 搜索功能异常

**检查清单**:
1. 查看后端日志中的错误：`pm2 logs pdf-search-backend --lines 100`
2. 测试API直接调用：`curl "http://localhost:3001/api/pdfs/xxx/search?query=测试"`
3. 检查PDF文件是否包含可提取的文本（非纯图片PDF）

## 性能优化建议

### 1. 启用Gzip压缩

编辑 `/etc/nginx/nginx.conf`，取消注释或添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. 使用PM2集群模式

```bash
pm2 start dist/index.js --name pdf-search-backend -i 2
```
（根据CPU核心数调整 `-i` 参数）

### 3. 配置Nginx缓存

在 `nginx.conf` 的 `server` 块中添加：
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### 4. 限制请求大小

已在 `nginx.conf` 中配置：
```nginx
client_max_body_size 200M;
```

## 安全建议

1. **配置HTTPS**（推荐使用Let's Encrypt）：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. **配置防火墙**：
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. **定期更新系统**：
```bash
sudo apt update && sudo apt upgrade -y
```

4. **配置fail2ban防止暴力破解**：
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## 监控与日志

### 设置日志轮转

创建 `/etc/logrotate.d/pdf-search`:
```
/var/www/pdf-search/backend/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### PM2监控

```bash
# 安装pm2-logrotate
pm2 install pm2-logrotate

# 设置日志保留天数
pm2 set pm2-logrotate:retain 7
```

## 备份策略

建议定期备份：
1. PDF文件：`/var/www/pdf-search/pdfs/`
2. 配置文件：`.env`, `nginx.conf`
3. 数据库（如果使用）

示例备份脚本：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /backup/pdf-search-${DATE}.tar.gz /var/www/pdf-search/pdfs/
```

---

如有问题，请查看项目README.md或提交Issue。
