# GreatSQL 龙芯（loongarch64）安装手册

> 适用系统：Loongson-3A6000 / loongarch64 架构  
> 适用版本：GreatSQL 8.0.25-16 及以上  
> 兼容性：完全兼容 MySQL 8.0 语法与协议

---

## 目录

1. [环境确认](#1-环境确认)
2. [下载安装包](#2-下载安装包)
3. [创建用户与目录](#3-创建用户与目录)
4. [解压与部署](#4-解压与部署)
5. [配置 my.cnf](#5-配置-mycnf)
6. [初始化数据库](#6-初始化数据库)
7. [配置 systemd 服务](#7-配置-systemd-服务)
8. [启动与验证](#8-启动与验证)
9. [修改初始密码](#9-修改初始密码)
10. [配置环境变量](#10-配置环境变量)
11. [常用操作命令](#11-常用操作命令)
12. [常见问题](#12-常见问题)

---

## 1. 环境确认

安装前先确认系统架构和内核版本：

```bash
# 查看 CPU 架构
lscpu

# 查看内核版本
uname -a
```

预期输出关键信息：

```
Architecture: loongarch64
Model name:   Loongson-3A6000
```

确认系统 glibc 版本（需 >= 2.28）：

```bash
ldd --version
```

---

## 2. 下载安装包

### 方式一：通过 Gitee 下载（国内推荐，速度快）

访问 Release 页面手动下载：

```
https://gitee.com/GreatSQL/GreatSQL/releases
```

或使用 wget 命令直接下载：

```bash
cd ~/下载

# 龙芯OS (Loongnix) 版本 - 推荐
wget https://gitee.com/GreatSQL/GreatSQL/releases/download/GreatSQL-8.0.25-17/GreatSQL-8.0.25-17-Loongnix-glibc2.28-loongarch64.tar.xz
```

### 方式二：通过 GitHub 下载

```
https://github.com/GreatSQL/GreatSQL/releases
```

### 版本选择说明

| 操作系统 | 推荐安装包 |
|---|---|
| 龙芯OS / Loongnix | `GreatSQL-x.x.x-Loongnix-glibc2.28-loongarch64.tar.xz` |
| 麒麟OS (Kylin V10) | `GreatSQL-x.x.x-Kylin-glibc2.28-loongarch64.tar.xz` |
| 通用 loongarch64 | `GreatSQL-x.x.x-glibc2.28-loongarch64.tar.xz` |

> ⚠️ 注意：loongarch64 架构下**不支持 RocksDB 引擎**，其余功能与 x86 版本一致。

### 验证文件完整性（可选）

```bash
# 下载完成后校验 md5
md5sum GreatSQL-8.0.25-17-Loongnix-glibc2.28-loongarch64.tar.xz
# 与官网公布的 md5 值对比
```

---

## 3. 创建用户与目录

```bash
# 创建 mysql 用户组和用户（无登录权限）
sudo groupadd mysql
sudo useradd -r -g mysql -s /bin/false mysql

# 创建数据目录
sudo mkdir -p /data/mysql

# 创建日志目录（可选）
sudo mkdir -p /data/mysql/logs
```

---

## 4. 解压与部署

```bash
cd ~/下载

# 解压安装包（以 8.0.25-16 为例，根据实际文件名调整）
tar -xf GreatSQL-8.0.25-16-glibc2.28-loongarch64.tar.xz

# 移动到安装目录
sudo mv GreatSQL-8.0.25-16-glibc2.28-loongarch64 /usr/local/greatsql

# 设置目录权限
sudo chown -R mysql:mysql /usr/local/greatsql
sudo chown -R mysql:mysql /data/mysql
```

确认目录结构：

```bash
ls /usr/local/greatsql/
# 应看到：bin  include  lib  share  support-files 等目录
```

---

## 5. 配置 my.cnf

```bash
sudo tee /etc/my.cnf <<'EOF'
[mysqld]
# 基础配置
basedir=/usr/local/greatsql
datadir=/data/mysql
socket=/tmp/mysql.sock
pid-file=/data/mysql/mysql.pid
user=mysql
port=3306

#设置大小写不敏感
lower_case_table_names=1
# 字符集
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 日志配置
log-error=/data/mysql/logs/error.log
slow_query_log=1
slow_query_log_file=/data/mysql/logs/slow.log
long_query_time=2

# 连接数
max_connections=500

# InnoDB 配置（根据实际内存调整，建议为物理内存的 50-70%）
innodb_buffer_pool_size=1G

[client]
socket=/tmp/mysql.sock
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4
EOF
```

> 💡 `innodb_buffer_pool_size` 建议根据实际内存调整，龙芯3A6000通常配备16GB内存，可设置为 `8G`。

---

## 6. 初始化数据库

```bash
cd /usr/local/greatsql

sudo bin/mysqld \
  --initialize \
  --user=mysql \
  --basedir=/usr/local/greatsql \
  --datadir=/data/mysql
```

初始化成功后，终端会输出一行**临时密码**，格式如下：

```
[Note] A temporary password is generated for root@localhost: xxxxxxXXXX0!
```

> ⚠️ **务必记录这个临时密码**，首次登录时需要使用。

---

## 7. 配置 systemd 服务

```bash
sudo tee /etc/systemd/system/greatsql.service <<'EOF'
[Unit]
Description=GreatSQL Server (MySQL Compatible)
Documentation=https://greatsql.cn
After=network.target

[Service]
Type=simple
User=mysql
Group=mysql
ExecStart=/usr/local/greatsql/bin/mysqld --defaults-file=/etc/my.cnf
ExecStop=/usr/local/greatsql/bin/mysqladmin --socket=/tmp/mysql.sock shutdown
LimitNOFILE=65535
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 设置开机自启
sudo systemctl enable greatsql
```

---

## 8. 启动与验证

```bash
# 启动服务
sudo systemctl start greatsql

# 查看启动状态
sudo systemctl status greatsql
```

正常启动后输出应包含 `Active: active (running)`。

查看错误日志确认无报错：

```bash
sudo tail -50 /data/mysql/logs/error.log
```

验证端口监听：

```bash
ss -tlnp | grep 3306
```

---

## 9. 修改初始密码

使用第 6 步记录的临时密码登录：

```bash
/usr/local/greatsql/bin/mysql \
  -u root \
  -p \
  --socket=/tmp/mysql.sock
```

登录后**必须先修改密码**，否则无法执行任何操作：

```sql
-- 修改 root 密码（替换 YourNewPassword 为你的密码）
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword@2024';
FLUSH PRIVILEGES;

-- 验证登录成功
SELECT VERSION();
SHOW DATABASES;
```

### 创建远程访问用户（可选）

```sql
-- 创建允许远程连接的用户
CREATE USER 'admin'@'%' IDENTIFIED BY 'YourPassword@2024';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

---

## 10. 配置环境变量

将 GreatSQL 的 bin 目录加入 PATH，方便直接使用 mysql 命令：

```bash
echo 'export PATH=/usr/local/greatsql/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

验证：

```bash
mysql --version
# 输出：/usr/local/greatsql/bin/mysql  Ver 8.0.25 ...
```

---

## 11. 常用操作命令

```bash
# 启动
sudo systemctl start greatsql

# 停止
sudo systemctl stop greatsql

# 重启
sudo systemctl restart greatsql

# 查看状态
sudo systemctl status greatsql

# 查看实时日志
sudo journalctl -u greatsql -f

# 登录数据库
mysql -u root -p --socket=/tmp/mysql.sock

# 数据库备份
mysqldump -u root -p --all-databases > /backup/all_databases.sql

# 数据库恢复
mysql -u root -p < /backup/all_databases.sql
```

---

## 12. 常见问题

### Q1：初始化报错 "error while loading shared libraries"

```bash
# 检查依赖库
ldd /usr/local/greatsql/bin/mysqld | grep "not found"

# 安装缺少的库（以 libaio 为例）
sudo apt install libaio1   # Debian/Ubuntu
sudo yum install libaio    # CentOS/龙芯OS
```

### Q2：启动失败，日志报 "Can't create/write to file"

```bash
# 检查数据目录权限
ls -la /data/mysql
# 确保所有者是 mysql 用户
sudo chown -R mysql:mysql /data/mysql
sudo chown -R mysql:mysql /data/mysql/logs
```

### Q3：忘记 root 密码

```bash
# 停止服务
sudo systemctl stop greatsql

# 跳过权限验证启动
sudo /usr/local/greatsql/bin/mysqld_safe --skip-grant-tables &

# 登录后重置密码
mysql -u root --socket=/tmp/mysql.sock
```

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPassword@2024';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 重新正常启动
sudo systemctl start greatsql
```

### Q4：无法远程连接

```bash
# 检查防火墙（开放 3306 端口）
sudo firewall-cmd --add-port=3306/tcp --permanent
sudo firewall-cmd --reload

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
```

---

## 参考链接

- GreatSQL 官网：https://greatsql.cn
- GitHub：https://github.com/GreatSQL/GreatSQL
- Gitee（国内镜像）：https://gitee.com/GreatSQL/GreatSQL
- 官方文档：https://greatsql.cn/docs

---

*文档版本：v1.0 | 适用于 GreatSQL 8.0.25+ / loongarch64*
