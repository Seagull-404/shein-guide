# 上传 SSL 证书到服务器
# 需要安装 SSH 客户端：https://github.com/PowerShell/Win32-OpenSSH/releases

$Server = "116.62.171.85"
$Username = "root"
$Password = "Wuhaitao2002"
$LocalPath = "ssl\zeyikuajing.com_nginx"
$RemotePath = "/etc/nginx/ssl/zeyikuajing.com"

Write-Host "正在上传 SSL 证书文件..."

# 检查本地证书文件
if (-not (Test-Path $LocalPath)) {
    Write-Error "本地证书目录不存在：$LocalPath"
    exit 1
}

# 使用 scp 命令上传
$Files = @(
    "zeyikuajing.com.csr",
    "zeyikuajing.com.key",
    "zeyikuajing.com_bundle.crt",
    "zeyikuajing.com_bundle.pem"
)

foreach ($File in $Files) {
    $LocalFile = Join-Path $LocalPath $File
    if (Test-Path $LocalFile) {
        Write-Host "上传 $File..."
        $RemoteFile = "$RemotePath/$File"
        
        # 使用 scp 上传
        $scpCommand = "scp -o StrictHostKeyChecking=no `"$LocalFile`" ${Username}@${Server}:`"$RemoteFile`"
        
        # 使用 plink（PuTTY 的命令行工具）
        $plinkCommand = "plink -ssh -l $Username -pw $Password $Server `"mkdir -p $RemotePath && cat > `"$RemoteFile`""
        
        # 由于 PowerShell 无法直接输入密码，需要使用 plink 或手动上传
        Write-Host "请手动上传 $File 到服务器"
        Write-Host "命令：scp $LocalFile ${Username}@${Server}:$RemotePath"
    }
}

Write-Host ""
Write-Host "所有文件上传完成后，请在服务器上执行以下命令："
Write-Host ""
Write-Host "# 1. 设置文件权限"
Write-Host "sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.crt"
Write-Host "sudo chmod 644 /etc/nginx/ssl/zeyikuajing.com/*.pem"
Write-Host "sudo chmod 600 /etc/nginx/ssl/zeyikuajing.com/*.key"
Write-Host ""
Write-Host "# 2. 重启 Nginx"
Write-Host "sudo systemctl restart nginx"
Write-Host ""
Write-Host "# 3. 检查状态"
Write-Host "sudo systemctl status nginx"
