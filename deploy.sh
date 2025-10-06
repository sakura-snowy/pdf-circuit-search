#!/bin/bash

# 部署脚本 - 腾讯云服务器部署

set -e

echo "=========================================="
echo "PDF电路图搜索系统 - 部署脚本"
echo "=========================================="

# 配置变量
SERVER_IP="your_server_ip"  # 替换为你的服务器IP
SERVER_USER="root"  # 替换为你的服务器用户名
DEPLOY_PATH="/var/www/pdf-search"
PROJECT_NAME="PDF_text"

echo "1. 构建前端..."
cd frontend
npm run build
cd ..

echo "2. 构建后端..."
cd backend
npm run build
cd ..

echo "3. 创建部署包..."
mkdir -p deploy_package
cp -r frontend/dist deploy_package/frontend
cp -r backend/dist deploy_package/backend
cp backend/package.json deploy_package/backend/
cp backend/.env.production deploy_package/backend/.env
cp -r pdfs deploy_package/
cp nginx.conf deploy_package/

echo "4. 压缩部署包..."
tar -czf pdf-search-deploy.tar.gz deploy_package/

echo "5. 上传到服务器..."
scp pdf-search-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo "6. 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    set -e

    echo "创建部署目录..."
    sudo mkdir -p /var/www/pdf-search

    echo "解压部署包..."
    cd /tmp
    tar -xzf pdf-search-deploy.tar.gz

    echo "停止现有服务..."
    sudo pm2 stop pdf-search-backend || true

    echo "部署后端..."
    sudo rm -rf /var/www/pdf-search/backend
    sudo mv deploy_package/backend /var/www/pdf-search/
    cd /var/www/pdf-search/backend
    sudo npm install --production

    echo "部署前端..."
    sudo rm -rf /var/www/pdf-search/frontend
    sudo mv /tmp/deploy_package/frontend /var/www/pdf-search/

    echo "部署PDF文件..."
    sudo mkdir -p /var/www/pdf-search/pdfs
    sudo cp -r /tmp/deploy_package/pdfs/* /var/www/pdf-search/pdfs/ || true

    echo "配置Nginx..."
    sudo cp /tmp/deploy_package/nginx.conf /etc/nginx/sites-available/pdf-search
    sudo ln -sf /etc/nginx/sites-available/pdf-search /etc/nginx/sites-enabled/pdf-search
    sudo nginx -t
    sudo systemctl reload nginx

    echo "启动后端服务..."
    cd /var/www/pdf-search/backend
    sudo pm2 start dist/index.js --name pdf-search-backend
    sudo pm2 save

    echo "清理临时文件..."
    rm -rf /tmp/deploy_package
    rm /tmp/pdf-search-deploy.tar.gz

    echo "部署完成！"
ENDSSH

echo "7. 清理本地临时文件..."
rm -rf deploy_package
rm pdf-search-deploy.tar.gz

echo "=========================================="
echo "部署成功！"
echo "访问地址: http://${SERVER_IP}"
echo "=========================================="
