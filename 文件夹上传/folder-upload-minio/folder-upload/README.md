# 文件夹上传 · MinIO + SpringBoot 2.4

## 架构

```
前端 (index.html)
  │
  ├─ SparkMD5 计算文件 MD5
  ├─ POST /check   → 秒传检查
  ├─ POST /file    → 后端中转 → MinIO
  └─ GET  /tree    → 从 MinIO 读目录树

后端 (SpringBoot 2.4 / JDK 8)
  ├─ ValidationService  黑名单 + 大小校验
  ├─ MinioService       秒传 / 上传 / 删除 / 目录树
  └─ UploadController   5 个接口
```

## 快速启动

### 1. 启动 MinIO（Docker）

```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

MinIO 控制台：http://localhost:9001

### 2. 修改配置

```yaml
# src/main/resources/application.yml
minio:
  endpoint:   http://localhost:9000   # MinIO 地址
  access-key: minioadmin
  secret-key: minioadmin
  bucket:     folder-upload            # 自动创建
```

### 3. 启动后端

```bash
mvn spring-boot:run
```

### 4. 打开前端

```bash
open frontend/index.html
# 或直接在浏览器中打开该文件
```

---

## API 接口

| 方法   | 路径                           | 说明               |
|--------|--------------------------------|--------------------|
| POST   | /api/upload/init               | 初始化会话         |
| POST   | /api/upload/check              | 秒传检查（MD5）    |
| POST   | /api/upload/file               | 上传单个文件       |
| GET    | /api/upload/tree/{sessionId}   | 获取 OSS 目录树    |
| DELETE | /api/upload/session/{sessionId}| 取消并清理 OSS     |

---

## 秒传原理

```
前端计算 MD5 → POST /check
  → 后端查 MinIO: md5index/{md5} 对象是否存在
      存在  → 返回 instant:true，前端跳过上传
      不存在 → 前端正常 POST /file 上传
               后端上传到 MinIO 后写入 md5index
```

MinIO 中的对象布局：
```
folder-upload (bucket)
  ├─ uploads/
  │   └─ {sessionId}/
  │       └─ {原始相对路径}   ← 实际文件
  └─ md5index/
      └─ {md5}               ← 0字节，metadata 存 ossKey
```

---

## 校验规则

### 前端（index.html）
- 文件大小：> 100MB 跳过，显示在校验日志
- 扩展名黑名单：exe/bat/cmd/sh/ps1/jar/war/php/jsp

### 后端（ValidationService）
- 同上双重校验，前端绕过时后端兜底

---

## 配置项

```yaml
upload:
  max-file-size: 104857600          # 单文件最大字节 (100MB)
  oss-prefix: uploads               # OSS 路径前缀
  forbidden-extensions:             # 黑名单扩展名
    - exe
    - bat
    - sh
    # ...

spring:
  servlet:
    multipart:
      max-file-size: 200MB
      max-request-size: 500MB
```

---

## 切换到阿里云 OSS / AWS S3

MinioClient 实现了 S3 兼容协议，切换只需改 endpoint 和密钥：

```yaml
# 阿里云 OSS（华东）
minio:
  endpoint:   https://oss-cn-hangzhou.aliyuncs.com
  access-key: <AccessKeyId>
  secret-key: <AccessKeySecret>
  bucket:     your-bucket-name
```

代码无需修改。
