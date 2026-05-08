# 文件夹上传 · SpringBoot 2.4 + HTML

## 项目结构

```
folder-upload/
├── pom.xml
├── frontend/
│   └── index.html                          ← 前端（直接浏览器打开）
└── src/main/
    ├── java/com/upload/
    │   ├── FolderUploadApplication.java
    │   ├── config/
    │   │   ├── ApiResult.java
    │   │   ├── UploadConfig.java
    │   │   └── WebConfig.java              ← CORS配置
    │   ├── controller/
    │   │   └── UploadController.java
    │   └── service/
    │       └── UploadService.java
    └── resources/
        └── application.yml
```

## 快速启动

```bash
# 编译启动后端
cd folder-upload
mvn spring-boot:run

# 前端直接在浏览器打开
open frontend/index.html
```

## API 接口

| 方法   | 路径                          | 说明                     |
|--------|-------------------------------|--------------------------|
| POST   | /api/upload/init              | 初始化上传会话           |
| POST   | /api/upload/file              | 上传单个文件             |
| GET    | /api/upload/tree/{sessionId}  | 获取已上传目录树         |
| DELETE | /api/upload/session/{sessionId}| 取消上传，清理目录      |

### POST /api/upload/init

```json
// Request
{ "folderName": "myFolder" }

// Response
{ "success": true, "data": { "sessionId": "20240315_143022_abc123", "folderName": "myFolder" } }
```

### POST /api/upload/file

```
Form-Data:
  sessionId:    20240315_143022_abc123
  relativePath: myFolder/subdir/file.txt
  file:         <binary>
```

## 配置说明

```yaml
# application.yml
upload:
  root-path: /tmp/uploads   # 修改为你的存储目录
  max-concurrent: 5

spring:
  servlet:
    multipart:
      max-file-size: 500MB       # 单文件最大
      max-request-size: 2GB      # 单次请求最大
```

## 前端功能

- 支持点击选择文件夹 / 拖拽文件夹
- 整体进度条 + 每个文件独立进度条
- 实时显示：上传速度、剩余时间、已完成数
- 并发上传（默认4并发，可在 JS 中调整 CONCURRENCY 常量）
- 取消上传（自动清理服务器临时目录）
- 上传完成后渲染目录树

## 注意事项

1. **CORS**：前端直接打开 HTML 文件时，已配置后端允许跨域。
   如果部署到同域 Nginx，可删除 WebConfig.java 中的 CORS 配置。

2. **大文件夹**：如果文件数量超过 1000，建议将 `CONCURRENCY` 调小至 2，
   避免后端线程耗尽。

3. **路径安全**：UploadService 已做路径穿越检查，禁止 `../` 等非法路径。

4. **目录保留**：上传的文件按原始相对路径存储，完整保留目录结构。
