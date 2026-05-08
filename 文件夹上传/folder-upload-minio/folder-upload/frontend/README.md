# 文件夹上传 MinIO 前端 (Vue 2)

基于 Vue 2 的文件夹上传前端项目，支持拖拽文件夹、MD5 秒传、并发上传、断点续传。

## 项目结构

```
frontend/
├── package.json          # 项目配置
├── webpack.config.js      # Webpack 配置
├── .babelrc              # Babel 配置
├── index.html            # HTML 模板
├── src/
│   ├── main.js           # 入口文件
│   ├── App.vue           # 根组件
│   ├── router/
│   │   └── index.js      # 路由配置
│   └── components/
│       └── FolderUpload.vue  # 文件夹上传组件
```

## 安装依赖

```bash
cd frontend
npm install
```

## 启动开发服务器

```bash
npm run dev
# 或
npm start
```

服务启动后访问 http://localhost:8081

## 构建生产版本

```bash
npm run build
```

## 功能特性

- 拖拽文件夹 / 点击选择上传
- 保留目录结构
- MD5 秒传（文件已存在则秒传）
- 黑名单校验（禁止 exe, bat, cmd 等危险文件）
- 文件大小限制（100MB）
- 并发上传（默认 4 并发）
- 实时进度显示
- 上传取消与清理
- OSS 目录树展示
- 文件 URL 列表

## API 配置

在 `src/components/FolderUpload.vue` 中修改：

```javascript
API: 'http://localhost:8080/api/upload',  // 后端 API 地址
```

## 后端要求

需要启动对应的 Spring Boot 后端服务，默认端口 8080。

API 接口：
- `POST /api/upload/init` - 初始化上传会话
- `POST /api/upload/check` - MD5 秒传检查
- `POST /api/upload/file` - 上传文件
- `DELETE /api/upload/session/{sessionId}` - 取消会话
- `GET /api/upload/tree/{sessionId}` - 获取目录树
- `GET /api/upload/files/{sessionId}` - 获取文件 URL 列表
