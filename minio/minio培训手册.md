# MinIO 运维培训手册

## 目录

1. [服务管理](#一服务管理)
2. [日志查看与故障排查](#二日志查看与故障排查)
3. [安装与卸载](#三安装与卸载)
4. [启动方式](#四启动方式)
5. [权限与目录管理](#五权限与目录管理)
6. [客户端操作](#六客户端操作mc)
7. [配置文件管理](#七配置文件管理)
8. [常见问题处理](#八常见问题处理)

------

## 一、服务管理

### 1.1 基础服务命令

```bash
# 启动服务
sudo systemctl start minio

# 停止服务
sudo systemctl stop minio

# 重启服务
sudo systemctl restart minio

# 查看服务运行状态(最常用,排查问题第一步)
sudo systemctl status minio

# 设置开机自启动
sudo systemctl enable minio

# 取消开机自启动
sudo systemctl disable minio
```

### 1.2 配置变更后必须执行

```bash
# 修改 .service 文件后,重新加载配置
sudo systemctl daemon-reload

# 然后重启服务使配置生效
sudo systemctl restart minio
```

------

## 二、日志查看与故障排查

### 2.1 日志查看命令

```bash
# 实时查看日志(最常用,按 Ctrl+C 退出)
sudo journalctl -u minio -f --no-pager

# 查看最近 N 行日志
sudo journalctl -u minio -n 50 --no-pager
sudo journalctl -u minio -n 100 --no-pager

# 按时间范围查看
sudo journalctl -u minio --since "2025-10-10" --until "2025-10-11"
sudo journalctl -u minio --since "1 hour ago"
sudo journalctl -u minio --since "today"
```

### 2.2 日志分析重点

查看日志时重点关注:

- **ERROR**: 错误信息
- **FATAL**: 致命错误
- **Permission denied**: 权限问题
- **Address already in use**: 端口占用
- **Connection refused**: 连接失败

------

## 三、安装与卸载

### 3.1 安装 MinIO

```bash
# 方式1: 从本地 RPM 包安装
sudo rpm -ivh minio-20241218131544.0.0-1.x86_64.rpm

# 方式2: 从 URL 直接安装(需联网)
sudo yum install -y https://dl.minio.org.cn/server/minio/release/linux-amd64/archive/minio-20241218131544.0.0-1.x86_64.rpm

# 查看已安装版本
rpm -qa | grep minio
```

### 3.2 卸载 MinIO

```bash
# 标准卸载(替换为实际版本号)
sudo rpm -e minio-20250723155402.0.0-1.x86_64

# 强制卸载(当文件缺失或标准卸载失败时使用)
sudo rpm -e --noscripts minio-20250723155402.0.0-1.x86_64
```

------

## 四、启动方式

### 4.1 通过 systemd 启动(推荐)

```bash
# 生产环境推荐使用 systemd 管理
sudo systemctl start minio
```

### 4.2 手动启动(调试用)

```bash
# 进入 MinIO 程序目录
cd /data/jinmei/minio

# 单节点模式启动
./minio server data/

# 指定 API 端口启动(旧版本)
./minio server --address :9000 data/

# 新版本启动(分离 API 和控制台端口)
./minio server --address :9000 --console-address :9001 data/
```

**说明**: 手动启动主要用于调试,生产环境应使用 systemd 管理

------

## 五、权限与目录管理

### 5.1 创建数据目录

```bash
# 创建 MinIO 数据目录
sudo mkdir -p /data/jinmei/minio/data
```

### 5.2 设置目录权限

```bash
# 更改目录所有者(适配服务运行用户)
sudo chown -R minio-user:minio-user /data/jinmei/minio/

# 设置目录权限
sudo chmod -R 755 /data/jinmei/minio/
```

### 5.3 检查权限

```bash
# 查看目录权限和所有者
ls -ld /data/jinmei/minio/data

# 查看目录内容详情
ls -lh /data/jinmei/minio/data
```

**权限说明**:

- 755 权限: 所有者读写执行,组用户和其他用户只读执行
- 目录所有者必须与服务运行用户一致

------

## 六、客户端操作(mc)

### 6.1 配置连接

```bash
# 添加 MinIO 服务器别名
mc alias set myminio http://服务器IP:9000 用户名 密码

# 查看所有已配置的别名
mc alias list

# 删除别名
mc alias remove myminio
```

### 6.2 桶(Bucket)操作

```bash
# 创建桶
mc mb myminio/桶名称

# 列出所有桶
mc ls myminio

# 列出桶内文件
mc ls myminio/桶名称/

# 删除桶(桶必须为空)
mc rb myminio/桶名称
```

### 6.3 访问策略设置

```bash
# 设置桶为公开下载(允许匿名访问)
mc anonymous set download myminio/桶名称

# 设置桶为公开读写
mc anonymous set public myminio/桶名称

# 设置桶为私有(仅授权用户访问)
mc anonymous set private myminio/桶名称

# 查看桶的访问策略
mc anonymous get myminio/桶名称
```

### 6.4 文件操作

```bash
# 上传文件到桶
mc cp 本地文件路径 myminio/桶名称/目标路径

# 上传整个目录
mc cp -r 本地目录路径 myminio/桶名称/目标路径

# 从桶下载文件
mc cp myminio/桶名称/文件路径 本地保存路径

# 下载整个目录
mc cp -r myminio/桶名称/目录路径 本地保存路径

# 删除文件
mc rm myminio/桶名称/文件路径

# 递归删除目录
mc rm -r --force myminio/桶名称/目录路径
```

### 6.5 数据迁移示例

```bash
# 将目录复制到桶内另一位置
mc cp -r m105/training/all/2025-10-15 m105/training/all/

# 在不同 MinIO 实例间同步数据
mc mirror myminio1/source-bucket myminio2/target-bucket


mc mirror myminio1/training myminio2/training
mc mirror --watch myminio1/training myminio2/training

mc mirror --watch training1/training training2/training

```

------

## 七、配置文件管理

### 7.1 环境变量配置



```bash
# 自定义配置文件位置
sudo vim /data/jinmei/minio/minio.config

# RPM 包默认配置文件位置
sudo vim /etc/default/minio
```

**常见配置项**:

```bash
# MinIO 数据存储目录
MINIO_VOLUMES="/data/jinmei/minio/data"

# Root 用户凭证
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123

# API 服务地址
MINIO_SERVER_URL="http://服务器IP:9000"

# 控制台地址(新版本)
MINIO_BROWSER_REDIRECT_URL="http://服务器IP:9001"
```

### 7.2 systemd 服务文件

```bash
# 编辑服务配置文件
sudo vim /lib/systemd/system/minio.service
```

**服务文件示例**:

```ini
[Unit]
Description=MinIO
Documentation=https://docs.minio.io
After=network-online.target

[Service]
Type=notify
User=minio-user
Group=minio-user
EnvironmentFile=/data/jinmei/minio/minio.config
ExecStart=/data/jinmei/minio/minio server --address :9000 --console-address :9001 /data/jinmei/minio/data
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 7.3 配置修改后的操作流程

```bash
# 1. 重新加载 systemd 配置
sudo systemctl daemon-reload

# 2. 重启 MinIO 服务
sudo systemctl restart minio

# 3. 检查服务状态
sudo systemctl status minio

# 4. 查看日志确认启动成功
sudo journalctl -u minio -f --no-pager
```

------

## 八、常见问题处理

### 8.1 故障排查流程

```bash
# 步骤1: 查看服务状态
sudo systemctl status minio

# 步骤2: 查看实时日志
sudo journalctl -u minio -f --no-pager

# 步骤3: 查看最近日志记录
sudo journalctl -u minio -n 100 --no-pager
```

### 8.2 典型问题及解决方案

#### 问题1: 服务启动失败

**排查步骤**:

```bash
# 查看详细错误信息
sudo systemctl status minio
sudo journalctl -u minio -n 50 --no-pager

# 检查配置文件是否正确
sudo cat /data/jinmei/minio/minio.config

# 检查程序文件是否存在
ls -l /data/jinmei/minio/minio
```

#### 问题2: 权限错误

**错误特征**: 日志中出现 "Permission denied"

**解决方法**:

```bash
# 检查数据目录权限
ls -ld /data/jinmei/minio/data

# 修正所有者
sudo chown -R minio-user:minio-user /data/jinmei/minio/

# 修正权限
sudo chmod -R 755 /data/jinmei/minio/

# 重启服务
sudo systemctl restart minio
```

#### 问题3: 端口被占用

**错误特征**: 日志中出现 "Address already in use"

**解决方法**:

```bash
# 查看端口占用情况
sudo lsof -i :9000
sudo lsof -i :9001

# 杀死占用端口的进程(替换为实际 PID)
sudo kill -9 PID

# 或修改配置使用其他端口
sudo vim /data/jinmei/minio/minio.config
```

#### 问题4: 无法访问控制台

**排查步骤**:

```bash
# 检查服务是否正常运行
sudo systemctl status minio

# 检查防火墙规则
sudo firewall-cmd --list-ports

# 开放控制台端口(如果需要)
sudo firewall-cmd --zone=public --add-port=9001/tcp --permanent
sudo firewall-cmd --reload
```

### 8.3 性能监控

```bash
# 查看 MinIO 进程资源占用
top -p $(pgrep minio)

# 查看磁盘使用情况
df -h /data/jinmei/minio/data

# 查看目录大小
du -sh /data/jinmei/minio/data/*
```

### 8.4 minio下载





------



## 九、快速参考卡片

### 最常用命令

```
操作命令
启动服务sudo systemctl start minio
停止服务sudo systemctl stop minio
查看状态sudo systemctl status minio
实时日志sudo journalctl -u minio -f --no-pager
重载配置sudo systemctl daemon-reload
连接服务器mc alias set myminio http://IP:9000 user pass
上传文件mc cp 本地文件 myminio/bucket/路径
下载文件mc cp myminio/bucket/文件 本地路径
```

### 关键目录路径

```
用途路径
程序目录/data/jinmei/minio/
数据目录/data/jinmei/minio/data/
配置文件/data/jinmei/minio/minio.config
服务文件/lib/systemd/system/minio.service
RPM配置/etc/default/minio
```