# 检查服务器状态的命令
# 请在服务器上执行以下命令

echo "=== 1. 检查 Nginx 状态 ==="
sudo systemctl status nginx

echo ""
echo "=== 2. 检查 Nginx 配置 ==="
sudo nginx -t

echo ""
echo "=== 3. 检查端口监听 ==="
sudo netstat -tlnp | grep -E ':(80|443)'

echo ""
echo "=== 4. 检查 Nginx 错误日志 ==="
sudo tail -50 /var/log/nginx/error.log

echo ""
echo "=== 5. 检查 Nginx 访问日志 ==="
sudo tail -20 /var/log/nginx/access.log

echo ""
echo "=== 6. 检查网站文件 ==="
ls -la /var/www/html/dist/

echo ""
echo "=== 7. 检查文件权限 ==="
ls -la /var/www/html/
