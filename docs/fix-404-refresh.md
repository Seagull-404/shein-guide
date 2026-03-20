# 腾讯云静态托管 SPA 刷新 404 问题修复

## 问题描述

当前项目是 Vue 3 单页应用，部署在腾讯云 CloudBase 静态托管上。

**问题**: 当用户访问 `https://xxx.tcloudbaseapp.com/shein/#step1` 并刷新页面时，会出现 404 错误：

```
Code: NoSuchKey 
Message: The specified key does not exist.
Key: index.html
```

**原因**: 腾讯云静态托管不支持 SPA 的 history 模式路由重定向。当浏览器请求 `/shein/#step1` 时，服务器找不到对应的文件。

---

## 项目信息

- **部署路径**: `/shein/`
- **静态托管环境 ID**: `shein-serve-3g1udmby7bb8de4f`
- **入口文件**: `/shein/index.html`
- **Vue Router 模式**: 使用 URL hash (`#step1`, `#step2` 等)

---

## 解决方案

请选择以下方案之一并实现：

### 方案 1: 腾讯云控制台配置错误页面重定向（推荐）

在腾讯云控制台配置 404 错误页面重定向到 `/shein/index.html`：

1. 登录腾讯云控制台
2. 进入云开发 → 静态网站托管
3. 找到环境 `shein-serve-3g1udmby7bb8de4f`
4. 配置错误页面：404 → 重定向到 `/shein/index.html`

**注意**: 如果控制台不支持此功能，请尝试方案 2。

### 方案 2: 修改 Vue Router 使用 hash 模式

当前项目使用 `window.history.pushState` 管理 URL hash，但没有使用 Vue Router。

修改 `src/App.vue` 中的路由逻辑，确保所有路由都使用 hash 模式（`#step1` 而不是 `/step1`）。

当前代码：
```javascript
window.history.pushState({ page: 'tutorial', step: 1 }, '', '#step1')
```

这是正确的，问题在于腾讯云不支持 SPA 重定向。

### 方案 3: 使用 CloudBase 云函数做重定向

创建一个云函数，拦截所有 404 请求并返回 `index.html` 的内容。

### 方案 4: 修改 `_redirects` 文件

当前 `public/_redirects` 文件内容：
```
/api/*  /api/:splat  200
/*    /index.html   200
```

但腾讯云静态托管不支持 `_redirects` 文件（这是 Netlify 的格式）。

请研究腾讯云 CloudBase 静态托管的路由重定向配置方式，并实现正确的配置。

---

## 相关文件

- `src/App.vue` - 路由逻辑
- `public/_redirects` - 当前重定向配置（不生效）
- `_headers` - 缓存控制
- `vite.config.js` - 构建配置

---

## 验证方法

修复后，访问以下 URL 并刷新，应该能正常显示页面：
- `https://shein-serve-3g1udmby7bb8de4f-1355592364.tcloudbaseapp.com/shein/#step1`
- `https://shein-serve-3g1udmby7bb8de4f-1355592364.tcloudbaseapp.com/shein/#step2`

---

## 参考资料

- [腾讯云 CloudBase 静态托管文档](https://cloud.tencent.com/document/product/876/40970)
- [Vue Router history 模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)
