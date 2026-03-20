# 上传并应用新的 Nginx 配置
# 请在服务器上执行以下命令

echo "=== 1. 备份旧配置 ==="
sudo cp /etc/nginx/sites-available/zeyikuajing.com.conf /etc/nginx/sites-available/zeyikuajing.com.conf.backup

echo ""
echo "=== 2. 创建新的 Nginx 配置 ==="
sudo tee /etc/nginx/sites-available/zeyikuajing.com.conf << 'EOF'
server {
    listen 80;
    server_name zeyikuajing.com www.zeyikuajing.com;
    
    # 重定向到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zeyikuajing.com www.zeyikuajing.com;
    
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
    
    # 统一 /shein -> /shein/
    location = /shein {
        return 301 /shein/;
    }
    
    # 静态资源（必须放在 SPA 规则前面）
    location ^~ /shein/assets {
        alias /var/www/html/dist/assets/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 其他静态文件
    location ^~ /shein {
        alias /var/www/html/dist/;
        try_files $uri /shein/index.html =404;
    }
    
    # 根路径跳转到 /shein/
    location = / {
        return 301 /shein/;
    }
}
EOF

echo ""
echo "=== 3. 测试配置 ==="
sudo nginx -t

echo ""
echo "=== 4. 重启 Nginx ==="
sudo systemctl restart nginx

echo ""
echo "=== 5. 检查状态 ==="
sudo systemctl status nginx

echo ""
echo "=== 6. 验证配置 ==="
echo "请访问以下地址验证："
echo "https://zeyikuajing.com/shein/"
echo "https://zeyikuajing.com/shein/assets/index-1773388827517.js"
echo "https://zeyikuajing.com/shein/assets/index-1773388827517.css"
