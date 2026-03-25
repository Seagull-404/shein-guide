# SSL 证书上传和安装脚本
# 域名：zeyikuajing.com

echo "开始上传并安装 SSL 证书..."

# 1. 创建 SSL 证书目录
echo "创建 SSL 证书目录..."
ssh root@116.62.171.85 "sudo mkdir -p /etc/nginx/ssl/zeyikuajing.com"

# 2. 上传证书文件
echo "上传证书文件..."
scp ssl/zeyikuajing.com_nginx/zeyikuajing.com.csr root@116.62.171.85:/etc/nginx/ssl/zeyikuajing.com/
scp ssl/zeyikuajing.com_nginx/zeyikuajing.com.key root@116.62.171.85:/etc/nginx/ssl/zeyikuajing.com/
scp ssl/zeyikuajing.com_nginx/zeyikuajing.com_bundle.crt root@116.62.171.85:/etc/nginx/ssl/zeyikuajing.com/
scp ssl/zeyikuajing.com_nginx/zeyikuajing.com_bundle.pem root@116.62.171.85:/etc/nginx/ssl/zeyikuajing.com/

# 3. 设置权限
echo "设置证书文件权限..."
ssh root@116.62.171.85 "sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.crt && sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.pem && sudo chmod 600 /etc/nginx/ssl/zeyikuajing.com/*.key"

# 4. 创建 Nginx SSL 配置
echo "创建 Nginx SSL 配置..."
ssh root@116.62.171.85 'sudo tee /etc/nginx/sites-available/zeyikuajing.com.conf << '\''EOF'\''
server {
    listen 80;
    server_name zeyikuajing.com www.zeyikuajing.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
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
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF'

# 5. 启用配置
echo "启 用 SSL 配置..."
ssh root@116.62.171.85 "sudo ln -sf /etc/nginx/sites-available/zeyikuajing.com.conf /etc/nginx/sites-enabled/"

# 6. 测试配置
echo "测试 Nginx 配置..."
ssh root@116.62.171.85 "sudo nginx -t"

# 7. 重启 Nginx
echo "重启 Nginx..."
ssh root@116.62.171.85 "sudo systemctl restart nginx"

echo ""
echo "✅ SSL 证书安装完成！"
echo "请访问 https://zeyikuajing.com 测试"
echo "注意：请确保域名 DNS 已解析到 116.62.171.85"
