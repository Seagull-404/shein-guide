# SHEIN 商家入驻指引项目

## 项目概述

这是一个 **SHEIN 中国商家开店全流程指引** 的 Vue 3 单页应用，用于帮助新商家了解开店流程、准备材料、学习操作步骤。

**在线地址**: https://shein-serve-3g1udmby7bb8de4f-1355592364.tcloudbaseapp.com/shein/

---

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **部署平台**: 腾讯云 CloudBase 静态托管
- **数据存储**: 飞书多维表格 (通过后端 API)
- **本地存储**: localStorage (问卷数据缓存)

---

## 项目结构

```
shein-guide/
├── src/
│   ├── App.vue                    # 主应用组件（页面路由、步骤切换）
│   ├── main.js                    # 入口文件
│   ├── style.css                  # 全局样式
│   ├── components/
│   │   ├── BasicSurveyModal.vue   # 基础信息问卷弹窗
│   │   ├── AccountSurveyModal.vue # 账号信息问卷弹窗
│   │   └── HelloWorld.vue         # (废弃)
│   └── composables/
│       └── useSurvey.js           # 问卷逻辑（数据存储、飞书提交）
├── public/
│   ├── shein-guide.pdf            # 步骤1 PDF 教程
│   ├── shein-guide2.pdf           # 步骤2 PDF 教程
│   ├── shein-guide3.pdf           # 步骤3 PDF 教程
│   ├── shein-guide4.pdf           # 步骤4 PDF 教程
│   ├── shein-guide5.pdf           # 步骤5 PDF 教程
│   ├── 弘联插件/                   # 订单转换插件
│   ├── track123-template.xlsx     # Track123 模板
│   └── 【美东牙买加】配置导入.json  # 仓库配置
├── cloudfunctions/
│   └── feishu/
│       └── index.js               # 腾讯云函数（飞书 API 代理）
├── api/
│   └── feishu/
│       └── index.js               # 本地开发 API 代理
├── vite.config.js                 # Vite 配置（带时间戳文件名）
├── index.html                     # HTML 入口
├── _headers                       # CloudBase 缓存控制
└── .github/workflows/
    └── deploy.yml                 # GitHub Actions 自动部署
```

---

## 核心功能

### 1. 五步开店流程

| 步骤 | 名称 | 内容 |
|------|------|------|
| 1 | 商家注册 | PDF 教程 + 战斧浏览器/SHEIN 注册链接 |
| 2 | 店铺资料 | PDF 教程 + 美东仓库信息 |
| 3 | 选品上架 | PDF 教程 + 妙手 ERP 推荐 |
| 4 | 营销活动 | PDF 教程 + B站视频教程 |
| 5 | 发货物流 | PDF 教程 + B站视频 + 工具下载 |

### 2. 问卷系统

- **基础信息问卷**: 收集团队、营业执照、法人等信息
- **账号信息问卷**: 收集 SHEIN 店铺账号密码
- **数据提交**: 通过后端 API 写入飞书多维表格
- **本地缓存**: localStorage 存储问卷状态，避免重复填写

### 3. 文件下载

- 弘联订单转换插件
- Track123 物流模板
- 美东仓库配置文件

---

## 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 部署方式

**方式 1: GitHub Actions 自动部署**
- 推送到 main 分支自动触发
- 配置 Secrets: `TCB_SECRET_ID`, `TCB_SECRET_KEY`, `TCB_ENV_ID`

**方式 2: 手动部署**
```bash
tcb login --apiKeyId <SECRET_ID> --apiKey <SECRET_KEY>
tcb hosting deploy ./dist /shein -e shein-serve-3g1udmby7bb8de4f
```

---

## 重要配置

### vite.config.js

```javascript
// 文件名带时间戳，解决腾讯云 CDN 缓存问题
const buildTime = Date.now()
entryFileNames: `assets/index-${buildTime}.js`
```

### 飞书配置 (useSurvey.js)

```javascript
const FEISHU_CONFIG = {
  appId: 'cli_a927f88bdc389bdf',
  baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
  tableId: 'tblVcBw1zUhWp6IU'
}
```

### API 端点

- **开发环境**: `http://localhost:3001/api/feishu/record`
- **生产环境**: `https://shein-serve-3g1udmby7bb8de4f-1355592364.ap-shanghai.app.tcloudbase.com/feishu?v=2`

---

## 常见问题

### 1. PDF 不显示

**原因**: 腾讯云 CDN 缓存了旧的 index.js

**解决**: 
- 文件名已添加时间戳，重新构建部署即可
- 或清除浏览器缓存

### 2. 刷新页面 404

**原因**:
- 腾讯云 CloudBase 静态托管不识别 `public/_redirects` 这类 Netlify 规则
- 站点部署在 `/shein/` 子路径下，前端如果把地址改写成 `/`，刷新时会请求错误的根路径

**解决**: 
- 在腾讯云控制台为静态托管配置“错误码重定向”：`404 -> /shein/index.html`
- 如果控制台同时提供 `403` 错误码重定向，也建议一并指向 `/shein/index.html`
- 当前项目已改为纯 hash 路由，不再把 `/shein/` 改写成 `/`

### CloudBase 静态托管配置

CloudBase 的正确入口是控制台里的“路由配置/错误码重定向”，不是仓库中的 `_redirects` 文件。

建议按下面方式配置当前环境 `shein-serve-3g1udmby7bb8de4f`：

1. 登录腾讯云控制台，进入“云开发 CloudBase”
2. 选择环境 `shein-serve-3g1udmby7bb8de4f`
3. 进入“静态网站托管”
4. 打开“路由配置”或“错误码重定向”
5. 添加规则：`404 -> /shein/index.html`
6. 如控制台支持，再补一条：`403 -> /shein/index.html`

这样刷新 `https://xxx.tcloudbaseapp.com/shein/#step1` 时，服务端仍会回落到 `/shein/index.html`，前端再根据 hash 恢复到对应步骤。

### 3. 部署时文件权限错误

**原因**: Windows 文件被锁定

**解决**:
```powershell
Get-ChildItem -Path dist -Recurse | Set-ItemProperty -Name IsReadOnly -Value $false
```

---

## 修改注意事项

### 修改 PDF 路径

PDF 文件放在 `public/` 目录，引用路径为 `/shein/xxx.pdf`（base 路径是 `/shein/`）：

```html
<iframe src="/shein/shein-guide.pdf"></iframe>
```

### 修改问卷字段

1. 修改 `useSurvey.js` 中的 `getDefaultSurveyData()`
2. 修改 `BasicSurveyModal.vue` 或 `AccountSurveyModal.vue` 表单
3. 修改 `submitToFeishu()` 中的字段映射
4. 同步更新飞书多维表格字段

### 修改步骤内容

编辑 `App.vue` 中的步骤模板区域：
- `o.value === 1` 对应步骤 1
- `o.value === 2` 对应步骤 2
- 以此类推

---

## 联系方式

- **开发者**: Seagull-404
- **GitHub**: https://github.com/Seagull-404/shein-guide
