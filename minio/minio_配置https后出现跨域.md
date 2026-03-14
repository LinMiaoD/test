# Nginx 代理 MinIO 解决跨域问题 - 笔记

## 问题现象

- Web 服务部署在 192.168.2.24 (Nginx + HTTPS)
- MinIO 部署在 192.168.2.91:9000 (HTTPS，未用 Nginx)
- 通过 24 的后端 API 上传文件正常
- 前端直接访问 MinIO 的文件 URL 报错(跨域)

## 问题原因



```
浏览器直接访问: https://192.168.2.91:9000/jmis-cloud/xxx.html
从 192.168.2.24 跨域到 192.168.2.91:9000
❌ CORS 错误
```

## 解决方案

在 24 的 Nginx 配置中添加 MinIO 代理:





~~~nginx
server {
    listen 443 ssl;
    server_name 192.168.2.24;
    
    # 后端 API (优先匹配)
    location ^~ /jmis-cloud/api/ {
        proxy_pass http://192.168.2.91:82/;
        proxy_set_header x-forwarded-for $remote_addr;
    }
    
    # MinIO 文件代理 (新增)
    location ^~ /jmis-cloud/ {
        proxy_pass https://192.168.2.91:9000;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # MinIO 自签名证书
        proxy_ssl_verify off;
        
        # 大文件支持
        proxy_request_buffering off;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
}
```

## 工作原理
```
浏览器 → https://192.168.2.24/jmis-cloud/xxx.html
       ↓ (Nginx 代理)
       https://192.168.2.91:9000/jmis-cloud/xxx.html
✅ 同源请求，无跨域问题
~~~

## Location 匹配优先级

- `^~` 表示前缀匹配，匹配成功后不再检查正则
- `/jmis-cloud/api/` 优先于 `/jmis-cloud/` 匹配
- API 请求走后端，文件请求走 MinIO