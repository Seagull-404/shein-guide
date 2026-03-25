#!/bin/bash

# SSL 证书安装脚本
# 域名：zeyikuajing.com

echo "开始安装 SSL 证书..."

# 1. 创建 SSL 证书目录
sudo mkdir -p /etc/nginx/ssl/zeyikuajing.com

# 2. 上传证书文件（需要手动上传）
echo "请将以下文件上传到服务器："
echo "  - zeyikuajing.com.csr -> /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com.csr"
echo "  - zeyikuajing.com.key -> /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com.key"
echo "  - zeyikuajing.com_bundle.crt -> /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com_bundle.crt"
echo "  - zeyikuajing.com_bundle.pem -> /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com_bundle.pem"

# 3. 设置权限
sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.crt
sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.pem
sudo chmod 600 /etc/nginx/ssl/zeyikuajing.com/*.key

# 4. 创建 Nginx SSL 配置
sudo tee /etc/nginx/sites-available/zeyikuajing.com.conf << 'EOF'
server {
    listen 80;
    server_name zeyikuajing.com www.zeyikuajing.com;
    
    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zeyikuajing.com www.zeyikuajing.com;
    
    root /var/www/html/dist;
    index index.html;
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/zeyikuajing.com/zeyikuajing.com.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. 启用配置
sudo ln -sf /etc/nginx/sites-available/zeyikuajing.com.conf /etc/nginx/sites-enabled/

# 6. 测试配置
sudo nginx -t

# 7. 重启 Nginx
sudo systemctl restart nginx

echo "SSL 证书安装完成！"
echo "请访问 https://zeyikuajing.com 测试"
