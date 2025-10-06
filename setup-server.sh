#!/bin/bash

# 服务器环境初始化脚本

set -e

echo "=========================================="
echo "初始化服务器环境"
echo "=========================================="

echo "1. 更新系统包..."
sudo apt update
sudo apt upgrade -y

echo "2. 安装Node.js (v18 LTS)..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "3. 安装PM2..."
sudo npm install -g pm2

echo "4. 安装Nginx..."
sudo apt install -y nginx

echo "5. 配置防火墙..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "6. 创建部署目录..."
sudo mkdir -p /var/www/pdf-search
sudo chown -R $USER:$USER /var/www/pdf-search

echo "7. 配置PM2开机启动..."
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "=========================================="
echo "服务器环境初始化完成！"
echo "=========================================="
echo "Node版本: $(node -v)"
echo "npm版本: $(npm -v)"
echo "PM2版本: $(pm2 -v)"
echo "Nginx版本: $(nginx -v 2>&1)"
echo "=========================================="
